// src/mocks/handlers.js
import { http, HttpResponse, delay } from "msw";
import {
  mockUser,
  mockWordList as _mockWordList,
  mockClusterMap,
  DEFAULT_CLUSTER,
  mockStudyLog,
  mockStoryList as _mockStoryList,
  mockStoryWords,
} from "./mockData.js";

/**
 * 목표
 * - 서버(8080)를 꺼도 로그인/인증/리프레시 흐름이 동작하게 MSW가 모든 API를 가로챔
 * - "401 → refresh 1회 → 원요청들 200 재시도" Network 증거를 재현 가능하게 함
 */

/** 토큰(테스트용) */
const VALID_ACCESS = "valid.access.token.v1";
const EXPIRED_ACCESS = "expired.access.token.v0";
const VALID_REFRESH = "valid.refresh.token.v1";

// 사용자가 이전에 넣었을 가능성이 높은 값도 허용(실수 방어)
const LEGACY_DUMMY_REFRESH = "dummy_refresh_token";

let currentAccess = VALID_ACCESS;
let currentRefresh = VALID_REFRESH;

function json(data, init) {
  return HttpResponse.json(data ?? {}, init ?? { status: 200 });
}

function getBearerToken(request) {
  const raw =
    request?.headers?.get?.("authorization") ??
    request?.headers?.get?.("Authorization") ??
    "";
  const s = typeof raw === "string" ? raw.trim() : "";
  if (!s.toLowerCase().startsWith("bearer ")) return "";
  return s.slice(7).trim();
}

function isAuthed(request) {
  const token = getBearerToken(request);
  return !!token && token === currentAccess;
}

function nowYMDLocal() {
  const d = new Date();
  const yy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yy}-${mm}-${dd}`;
}

function startOfWeekYMDs(weekStartsOn = 0) {
  const base = new Date();
  const d = new Date(base.getFullYear(), base.getMonth(), base.getDate());
  const day = d.getDay(); // 0..6
  const diff = (day - weekStartsOn + 7) % 7;
  d.setDate(d.getDate() - diff);

  const out = [];
  for (let i = 0; i < 7; i += 1) {
    const cur = new Date(d);
    cur.setDate(d.getDate() + i);
    const yy = cur.getFullYear();
    const mm = String(cur.getMonth() + 1).padStart(2, "0");
    const dd = String(cur.getDate()).padStart(2, "0");
    out.push(`${yy}-${mm}-${dd}`);
  }
  return out;
}

function requireAuthOr401(request) {
  if (!isAuthed(request)) {
    return json({ message: "Unauthorized" }, { status: 401 });
  }
  return null;
}

const RE = {
  OPTIONS_API: /\/api\/.*$/,

  AUTH_LOGIN: /\/api\/auth\/login(?=[?#]|$)/,
  AUTH_REFRESH: /\/api\/auth\/refresh(?=[?#]|$)/,
  AUTH_LOGOUT: /\/api\/auth\/logout(?=[?#/]|$)/,

  USER_ME: /\/api\/user\/me(?=[?#]|$)/,

  DASH_DAILY_GOAL: /\/api\/dashboard\/daily-goal(?=[?#]|$)/,
  DASH_STATS: /\/api\/dashboard\/stats(?=[?#]|$)/,
  DASH_SUMMARY: /\/api\/dashboard\/summary(?=[?#]|$)/,
  DASH_WEEKLY: /\/api\/dashboard\/weekly(?=[?#]|$)/,
  DASH_WRONG_TOP5: /\/api\/dashboard\/wrong\/top5(?=[?#]|$)/,

  WORDS_TODAY: /\/api\/words\/today(?=[?#]|$)/,
  WORDS_ALL: /\/api\/words\/all(?=[?#]|$)/,
  WORDS_LIST: /\/api\/words(?=[?#]|$)/,
  WORDS_SEARCH: /\/api\/words\/search(?=[?#]|$)/,
  WORDS_FILTER: /\/api\/words\/filter(?=[?#]|$)/,

  FAVORITES_LIST: /\/api\/favorites(?=[?#]|$)/,
  FAVORITES_ITEM: /\/api\/favorites\/\d+(?=[?#]|$)/,

  COMPLETED_LIST: /\/api\/completed(?=[?#]|$)/,
  COMPLETED_STATUS: /\/api\/completed\/\d+\/status(?=[?#]|$)/,

  WORDS_DETAIL: /\/api\/words\/detail\/\d+(?=[?#]|$)/,

  CLUSTER: /\/api\/cluster(?=[?#]|$)/,

  STUDY_ITEM: /\/api\/study\/\d+(?=[?#]|$)/,
  STUDY_CORRECT: /\/api\/study\/\d+\/correct(?=[?#]|$)/,
  STUDY_WRONG: /\/api\/study\/\d+\/wrong(?=[?#]|$)/,

  CLUSTER_CREATE: /\/api\/cluster\/create(?=[?#]|$)/,

  AI_STORY: /\/api\/ai\/story(?=[?#]|$)/,

  STORY_LIST:   /\/api\/story(?=[?#]|$)/,
  STORY_WORDS:  /\/api\/story\/\d+\/words(?=[?#]|$)/,
  STORY_DETAIL: /\/api\/story\/\d+(?=[?#]|$)/,

  QUIZ:                /\/api\/quiz(?=[?#]|$)/,
  FLASHCARD:           /\/api\/flashcard(?=[?#]|$)/,
  WRONG_LIST:          /\/api\/wrong(?=[?#]|$)/,
  WRONG_ITEM:          /\/api\/wrong\/\d+(?=[?#]|$)/,
  AUTH_SIGNUP:         /\/api\/auth\/signup(?=[?#]|$)/,
  AUTH_CHECK_EMAIL:    /\/api\/auth\/check-email(?=[?#]|$)/,
  AUTH_CHECK_NICKNAME: /\/api\/auth\/check-nickname(?=[?#]|$)/,
};

// mockWordList은 favorites 핸들러에서 재할당(=)이 발생하므로 let으로 선언
let mockWordList = _mockWordList;
// mockStoryList은 POST/DELETE에서 재할당이 발생하므로 let으로 선언
let mockStoryList = [..._mockStoryList];

export const handlers = [
  /** CORS Preflight 방어 */
  http.options(RE.OPTIONS_API, async () => {
    return json({}, { status: 200 });
  }),

  /** -----------------------------------
   * AUTH
   * ----------------------------------- */

  // 로그인: 서버 꺼도 동작해야 하므로 MSW가 반드시 처리
  // - 일부러 EXPIRED_ACCESS를 내려서 다음 API들이 401을 내도록 유도
  // - refresh 성공 후 VALID_ACCESS로 바뀌면 원요청들이 200으로 재시도됨
  http.post(RE.AUTH_LOGIN, async ({ request }) => {
    await delay(150);

    let body = {};
    try {
      body = (await request.json()) ?? {};
    } catch {
      body = {};
    }

    const email = typeof body?.email === "string" ? body.email : mockUser.email;

    // 로그인 시점마다 토큰 상태를 결정적으로 초기화
    currentAccess = VALID_ACCESS;
    currentRefresh = VALID_REFRESH;

    return json(
      {
        accessToken: EXPIRED_ACCESS,
        refreshToken: currentRefresh,
        // 백엔드가 토큰만 주는 경우가 많아서 user는 optional
        // (프론트는 /api/user/me로 user를 가져옴)
        user: { ...mockUser, email },
      },
      { status: 200 }
    );
  }),

  // Refresh: refreshToken이 맞으면 accessToken 발급(=VALID_ACCESS)
  http.post(RE.AUTH_REFRESH, async ({ request }) => {
    await delay(250);

    let body = {};
    try {
      body = (await request.json()) ?? {};
    } catch {
      body = {};
    }

    const refreshToken = typeof body?.refreshToken === "string" ? body.refreshToken : "";

    const ok =
      !!refreshToken &&
      (refreshToken === currentRefresh || refreshToken === VALID_REFRESH || refreshToken === LEGACY_DUMMY_REFRESH);

    if (!ok) {
      return json(
        { success: false, message: "리프레시 토큰이 유효하지 않습니다.", status: 400 },
        { status: 400 }
      );
    }

    // refresh 성공 → access 토큰을 VALID로 전환
    currentAccess = VALID_ACCESS;

    // refreshToken은 유지(현업에서도 rotation 안 하는 케이스 많음)
    currentRefresh = refreshToken === LEGACY_DUMMY_REFRESH ? LEGACY_DUMMY_REFRESH : VALID_REFRESH;

    return json(
      {
        accessToken: currentAccess,
        refreshToken: currentRefresh,
      },
      { status: 200 }
    );
  }),

  // 로그아웃: 서버 없어도 항상 성공 처리
  http.post(RE.AUTH_LOGOUT, async () => {
    await delay(80);
    return json({ success: true }, { status: 200 });
  }),

  /** -----------------------------------
   * USER
   * ----------------------------------- */

  http.get(RE.USER_ME, async ({ request }) => {
    await delay(120);
    const unauthorized = requireAuthOr401(request);
    if (unauthorized) return unauthorized;

    return json({ ...mockUser }, { status: 200 });
  }),

  /** -----------------------------------
   * DASHBOARD
   * ----------------------------------- */

  http.get(RE.DASH_DAILY_GOAL, async ({ request }) => {
    await delay(120);
    const unauthorized = requireAuthOr401(request);
    if (unauthorized) return unauthorized;

    return json(
      {
        nickname: mockUser.nickname,
        dailyGoal: 50,
        todayProgress: 12,
        percentage: 24,
      },
      { status: 200 }
    );
  }),

  http.get(RE.DASH_STATS, async ({ request }) => {
    await delay(120);
    const unauthorized = requireAuthOr401(request);
    if (unauthorized) return unauthorized;

    return json(
      {
        completedWords: 1250,
        wrongWords: 10,
        streakDays: 5,
      },
      { status: 200 }
    );
  }),

  // proof 페이지에서 summary를 쓰는 경우를 위해 stats와 동일 응답 제공
  http.get(RE.DASH_SUMMARY, async ({ request }) => {
    await delay(120);
    const unauthorized = requireAuthOr401(request);
    if (unauthorized) return unauthorized;

    return json(
      {
        totalLearnedWords: 1250,
        wrongWords: 10,
        streakDays: 5,
      },
      { status: 200 }
    );
  }),

  http.get(RE.DASH_WEEKLY, async ({ request }) => {
    await delay(150);
    const unauthorized = requireAuthOr401(request);
    if (unauthorized) return unauthorized;

    const week = startOfWeekYMDs(0);
    const learned = [15, 20, 10, 30, 25, 12, 18];
    const wrong = [2, 5, 0, 1, 4, 3, 2];

    return json(
      week.map((date, i) => ({
        date,
        learnedCount: learned[i] ?? 0,
        wrongCount: wrong[i] ?? 0,
      })),
      { status: 200 }
    );
  }),

  http.get(RE.DASH_WRONG_TOP5, async ({ request }) => {
    await delay(150);
    const unauthorized = requireAuthOr401(request);
    if (unauthorized) return unauthorized;

    return json(
      [
        { wordId: 4,  word: "Algorithm",    meaning: "알고리즘",        count: 5 },
        { wordId: 9,  word: "Ephemeral",    meaning: "일시적인, 덧없는", count: 4 },
        { wordId: 2,  word: "Ambiguous",    meaning: "모호한",           count: 2 },
        { wordId: 8,  word: "Collaborate",  meaning: "협력하다",         count: 2 },
        { wordId: 10, word: "Momentum",     meaning: "추진력, 가속도",   count: 3 },
      ],
      { status: 200 }
    );
  }),

  /** -----------------------------------
   * WORDS
   * ----------------------------------- */

  http.get(RE.WORDS_TODAY, async ({ request }) => {
    await delay(140);
    const unauthorized = requireAuthOr401(request);
    if (unauthorized) return unauthorized;

    // wordApi.getTodayWord()가 "단일 객체"를 기대하므로 배열로 감싸지 않음
    return json(
      {
        ...(mockWordList[0] ?? {
          wordId: 999,
          word: "Today",
          meaning: "오늘",
          partOfSpeech: "Noun",
          category: "Daily Life",
          level: 1,
          isFavorite: false,
          isCompleted: false,
          exampleSentenceEn: "",
          exampleSentenceKo: "",
        }),
        date: nowYMDLocal(),
      },
      { status: 200 }
    );
  }),

  http.get(RE.WORDS_ALL, async ({ request }) => {
    await delay(160);
    const unauthorized = requireAuthOr401(request);
    if (unauthorized) return unauthorized;

    return json(mockWordList, { status: 200 });
  }),

  http.get(RE.WORDS_LIST, async ({ request }) => {
    await delay(160);
    const unauthorized = requireAuthOr401(request);
    if (unauthorized) return unauthorized;

    const url = new URL(request.url);
    const page = Number(url.searchParams.get("page") ?? "0");
    const size = Number(url.searchParams.get("size") ?? "100");

    const start = page * size;
    const end = start + size;
    const slice = mockWordList.slice(start, end);

    return json(
      {
        content: slice,
        totalPages: Math.max(1, Math.ceil(mockWordList.length / Math.max(1, size))),
        totalElements: mockWordList.length,
        page,
        size,
      },
      { status: 200 }
    );
  }),

  http.get(RE.WORDS_SEARCH, async ({ request }) => {
    await delay(160);
    const unauthorized = requireAuthOr401(request);
    if (unauthorized) return unauthorized;

    const url = new URL(request.url);
    const keyword = (url.searchParams.get("keyword") ?? "").toLowerCase();
    const page = Number(url.searchParams.get("page") ?? "0");
    const size = Number(url.searchParams.get("size") ?? "20");

    const filtered = mockWordList.filter((w) => {
      const ww = String(w?.word ?? "").toLowerCase();
      const mm = String(w?.meaning ?? "").toLowerCase();
      return keyword ? ww.includes(keyword) || mm.includes(keyword) : true;
    });

    const start = page * size;
    const end = start + size;
    const slice = filtered.slice(start, end);

    return json(
      {
        content: slice,
        totalPages: Math.max(1, Math.ceil(filtered.length / Math.max(1, size))),
        totalElements: filtered.length,
        page,
        size,
      },
      { status: 200 }
    );
  }),

  http.get(RE.WORDS_FILTER, async ({ request }) => {
    await delay(160);
    const unauthorized = requireAuthOr401(request);
    if (unauthorized) return unauthorized;

    const url = new URL(request.url);
    const category = url.searchParams.get("category");
    const level = url.searchParams.get("level");
    const partOfSpeech = url.searchParams.get("partOfSpeech");
    const page = Number(url.searchParams.get("page") ?? "0");
    const size = Number(url.searchParams.get("size") ?? "20");

    let filtered = [...mockWordList];

    if (category && category !== "All") filtered = filtered.filter((w) => String(w?.category) === String(category));
    if (level && level !== "All") filtered = filtered.filter((w) => String(w?.level) === String(level));
    if (partOfSpeech && partOfSpeech !== "All") {
      const posLower = String(partOfSpeech).toLowerCase();
      filtered = filtered.filter((w) => String(w?.partOfSpeech ?? "").toLowerCase() === posLower);
    }

    const start = page * size;
    const end = start + size;
    const slice = filtered.slice(start, end);

    return json(
      {
        content: slice,
        totalPages: Math.max(1, Math.ceil(filtered.length / Math.max(1, size))),
        totalElements: filtered.length,
        page,
        size,
      },
      { status: 200 }
    );
  }),

  /** -----------------------------------
   * FAVORITES / COMPLETED (간단 지원)
   * ----------------------------------- */

  http.get(RE.FAVORITES_LIST, async ({ request }) => {
    await delay(120);
    const unauthorized = requireAuthOr401(request);
    if (unauthorized) return unauthorized;

    return json(mockWordList.filter((w) => !!w.isFavorite), { status: 200 });
  }),

  http.post(RE.FAVORITES_ITEM, async ({ request }) => {
    await delay(120);
    const unauthorized = requireAuthOr401(request);
    if (unauthorized) return unauthorized;

    const url = new URL(request.url);
    const id = Number(url.pathname.split("/").pop() ?? "0");
    mockWordList = mockWordList.map((w) => (Number(w.wordId) === id ? { ...w, isFavorite: true } : w));
    return json({ success: true }, { status: 201 });
  }),

  http.delete(RE.FAVORITES_ITEM, async ({ request }) => {
    await delay(120);
    const unauthorized = requireAuthOr401(request);
    if (unauthorized) return unauthorized;

    const url = new URL(request.url);
    const id = Number(url.pathname.split("/").pop() ?? "0");
    mockWordList = mockWordList.map((w) => (Number(w.wordId) === id ? { ...w, isFavorite: false } : w));
    return json({ success: true }, { status: 204 });
  }),

  http.get(RE.COMPLETED_LIST, async ({ request }) => {
    await delay(120);
    const unauthorized = requireAuthOr401(request);
    if (unauthorized) return unauthorized;

    return json(mockWordList.filter((w) => !!w.isCompleted), { status: 200 });
  }),

  /** -----------------------------------
   * WORD DETAIL
   * ----------------------------------- */

  http.get(RE.WORDS_DETAIL, async ({ request }) => {
    await delay(140);
    const unauthorized = requireAuthOr401(request);
    if (unauthorized) return unauthorized;

    const url = new URL(request.url);
    const wordId = Number(url.pathname.split("/").pop() ?? "0");
    const target = mockWordList.find((w) => Number(w.wordId) === wordId);

    if (!target) {
      return json({ message: "Word not found" }, { status: 404 });
    }

    const { wordId: wid, word, meaning, partOfSpeech, category, level, isFavorite, isCompleted, exampleSentenceEn, exampleSentenceKo } = target;
    return json({ wordId: wid, word, meaning, partOfSpeech, category, level, isFavorite, isCompleted, exampleSentenceEn, exampleSentenceKo }, { status: 200 });
  }),

  /** -----------------------------------
   * CLUSTER (유의어/반의어)
   * ----------------------------------- */

  http.get(RE.CLUSTER, async ({ request }) => {
    await delay(200);
    const unauthorized = requireAuthOr401(request);
    if (unauthorized) return unauthorized;

    const url = new URL(request.url);
    const wordId = Number(url.searchParams.get("wordId") ?? "0");
    const cluster = mockClusterMap[wordId] ?? DEFAULT_CLUSTER;

    return json(cluster, { status: 200 });
  }),

  http.post(RE.CLUSTER_CREATE, async ({ request }) => {
    await delay(400);
    const unauthorized = requireAuthOr401(request);
    if (unauthorized) return unauthorized;

    const url = new URL(request.url);
    const wordId = Number(url.searchParams.get("wordId") ?? "0");
    const cluster = mockClusterMap[wordId] ?? DEFAULT_CLUSTER;

    return json(cluster, { status: 200 });
  }),

  /** -----------------------------------
   * STUDY LOG
   * ----------------------------------- */

  http.get(RE.STUDY_ITEM, async ({ request }) => {
    await delay(120);
    const unauthorized = requireAuthOr401(request);
    if (unauthorized) return unauthorized;

    const url = new URL(request.url);
    const wordId = Number(url.pathname.split("/").pop() ?? "0");
    const log = mockStudyLog.get(wordId) ?? { totalCorrect: 0, totalWrong: 0, status: "none", lastStudyAt: null };

    return json({ wordId, ...log }, { status: 200 });
  }),

  http.post(RE.STUDY_CORRECT, async ({ request }) => {
    await delay(120);
    const unauthorized = requireAuthOr401(request);
    if (unauthorized) return unauthorized;

    const url = new URL(request.url);
    const parts = url.pathname.split("/");
    const wordId = Number(parts[parts.length - 2] ?? "0");
    const prev = mockStudyLog.get(wordId) ?? { totalCorrect: 0, totalWrong: 0, status: "none", lastStudyAt: null };
    const updated = { ...prev, totalCorrect: prev.totalCorrect + 1, status: "correct", lastStudyAt: new Date().toISOString() };
    mockStudyLog.set(wordId, updated);

    return json({ wordId, ...updated }, { status: 200 });
  }),

  http.post(RE.STUDY_WRONG, async ({ request }) => {
    await delay(120);
    const unauthorized = requireAuthOr401(request);
    if (unauthorized) return unauthorized;

    const url = new URL(request.url);
    const parts = url.pathname.split("/");
    const wordId = Number(parts[parts.length - 2] ?? "0");
    const prev = mockStudyLog.get(wordId) ?? { totalCorrect: 0, totalWrong: 0, status: "none", lastStudyAt: null };
    const updated = { ...prev, totalWrong: prev.totalWrong + 1, status: "wrong", lastStudyAt: new Date().toISOString() };
    mockStudyLog.set(wordId, updated);

    return json({ wordId, ...updated }, { status: 200 });
  }),

  /** -----------------------------------
   * STORY
   * ----------------------------------- */

  http.post(RE.AI_STORY, async ({ request }) => {
    await delay(800);

    let body = {};
    try { body = (await request.json()) ?? {}; } catch { body = {}; }

    const wrongIds = Array.isArray(body?.wrongAnswerLogIds)
      ? body.wrongAnswerLogIds.map(Number).filter(Boolean)
      : [];

    // wrongIds로 mockWordList에서 단어 찾기
    const matchedWords = wrongIds
      .map((id) => mockWordList.find((w) => Number(w.wordId) === id))
      .filter(Boolean);

    // 테마별 스토리 풀 (오답 단어 조합 기반 매칭)
    const STORY_POOL = [
      {
        themeIds: [4, 25], // Algorithm, Groundbreaking → Technology
        title: "The Groundbreaking Algorithm",
        titleKo: "획기적인 알고리즘",
        storyEn:
          "The research division unveiled a Groundbreaking Algorithm that could predict equipment failure before it happened. " +
          "Building a Groundbreaking Algorithm is not a single act of inspiration — it is hundreds of iterations refined by failure. " +
          "The Algorithm began with a simple premise: past patterns contain the seeds of future outcomes. " +
          "Every revision of the Algorithm uncovered edge cases that forced the team to question what they thought they understood. " +
          "The Groundbreaking results from the first live test silenced every skeptic who had called the project unrealistic. " +
          "A second, more ambitious Algorithm was designed to integrate data from sources no previous system had attempted to combine. " +
          "What started as a Groundbreaking experiment became the new baseline for an entire field of applied engineering. " +
          "The team understood at last that a truly Groundbreaking Algorithm does not replace human judgment — it sharpens it.",
        storyKo:
          "연구팀은 장비 고장을 미리 예측할 수 있는 획기적인(Groundbreaking) 알고리즘(Algorithm)을 공개했다. " +
          "획기적인(Groundbreaking) 알고리즘(Algorithm)을 구축하는 것은 단 한 번의 영감이 아니라, 실패로 다듬어진 수백 번의 반복이다. " +
          "알고리즘(Algorithm)은 단순한 전제에서 출발했다 — 과거의 패턴 속에 미래의 씨앗이 있다는 것. " +
          "알고리즘(Algorithm)의 매 수정은 팀이 이해했다고 생각했던 것을 의심하게 만드는 예외 케이스를 드러냈다. " +
          "첫 번째 실제 테스트에서 나온 획기적인(Groundbreaking) 결과는 프로젝트를 비현실적이라고 불렀던 모든 회의론자를 침묵시켰다. " +
          "두 번째, 더 야심찬 알고리즘(Algorithm)은 기존 어떤 시스템도 시도하지 않았던 소스의 데이터를 통합하도록 설계되었다. " +
          "획기적인(Groundbreaking) 실험으로 시작한 것이 응용 엔지니어링 전 분야의 새로운 기준이 되었다. " +
          "팀은 마침내 이해했다 — 진정으로 획기적인(Groundbreaking) 알고리즘(Algorithm)은 인간의 판단을 대체하는 것이 아니라, 그것을 날카롭게 만든다는 것을.",
        usedWords: ["Algorithm", "Groundbreaking"],
      },
      {
        themeIds: [5, 20], // Perseverance, Vague → Daily Life
        title: "Through the Vague",
        titleKo: "막연함을 넘어",
        storyEn:
          "The path forward was Vague at best — no clear map, no promised destination, only the next step. " +
          "Elena had learned that when the goal is Vague, Perseverance is the only compass worth trusting. " +
          "Every morning she chose Perseverance over the Vague fear that her efforts might not be enough. " +
          "The feedback she received was Vague and contradictory, yet she extracted what she could and kept going. " +
          "Perseverance, she found, does not require certainty — it only requires the willingness to act despite a Vague horizon. " +
          "Months of Perseverance slowly transformed the Vague outline of her idea into a concrete and workable plan. " +
          "What had felt Vague and overwhelming became manageable, one small act of Perseverance at a time. " +
          "She realized that Perseverance is not about seeing the whole road — it is about taking the next step even when the road ahead remains Vague.",
        storyKo:
          "앞으로 나아갈 길은 기껏해야 막연했다(Vague) — 명확한 지도도, 약속된 목적지도 없이 다음 한 걸음만 있을 뿐이었다. " +
          "엘레나는 목표가 막연할(Vague) 때 인내(Perseverance)만이 신뢰할 수 있는 유일한 나침반임을 배웠다. " +
          "매일 아침 그녀는 자신의 노력이 충분하지 않을지도 모른다는 막연한(Vague) 두려움 대신 인내(Perseverance)를 선택했다. " +
          "받은 피드백은 막연하고(Vague) 모순적이었지만, 그녀는 할 수 있는 것을 추려내고 계속 나아갔다. " +
          "인내(Perseverance)는 확실함을 필요로 하지 않는다 — 막연한(Vague) 지평선에도 불구하고 행동하려는 의지만 있으면 된다는 것을 그녀는 알게 되었다. " +
          "수개월의 인내(Perseverance)는 그녀의 아이디어에 대한 막연한(Vague) 윤곽을 서서히 구체적이고 실행 가능한 계획으로 변화시켰다. " +
          "막연하고(Vague) 압도적으로 느껴졌던 것이 인내(Perseverance)의 작은 행동 하나하나를 통해 감당할 수 있게 되었다. " +
          "그녀는 인내(Perseverance)란 전체 길을 보는 것이 아니라 — 길이 여전히 막연(Vague)하더라도 다음 발걸음을 내딛는 것임을 깨달았다.",
        usedWords: ["Perseverance", "Vague"],
      },
      {
        themeIds: [8, 31], // Collaborate, Compete → Business
        title: "From Compete to Collaborate",
        titleKo: "경쟁에서 협력으로",
        storyEn:
          "For years, the two departments had been forced to Compete for the same limited budget, producing rivalry instead of results. " +
          "A new director arrived with a simple mandate: stop trying to Compete with each other and start learning to Collaborate. " +
          "The shift from Compete to Collaborate was not instant — old habits of rivalry ran deep on both sides. " +
          "But the first project they chose to Collaborate on produced results that neither could have achieved while trying to Compete. " +
          "They realized they had spent enormous energy trying to Compete in areas where the real gains came from working together. " +
          "Choosing to Collaborate did not mean they stopped having high standards — it meant they raised those standards together. " +
          "The teams began to Collaborate on documentation, shared tools, and onboarding in ways that made the whole organization stronger. " +
          "In the end, the most powerful thing they did was decide not to Compete for recognition but to Collaborate toward something worth recognizing.",
        storyKo:
          "수년간 두 부서는 같은 제한된 예산을 놓고 경쟁(Compete)해야 했고, 그 결과로 성과 대신 경쟁심만 쌓였다. " +
          "새로운 디렉터가 단순한 지침을 가지고 왔다 — 서로 경쟁(Compete)하는 것을 멈추고 협력(Collaborate)하는 법을 배우라는 것이었다. " +
          "경쟁(Compete)에서 협력(Collaborate)으로의 전환은 즉각적이지 않았다 — 양측 모두에 경쟁심의 오래된 습관이 깊이 자리하고 있었다. " +
          "그러나 함께 협력(Collaborate)하기로 선택한 첫 번째 프로젝트는 경쟁(Compete)하던 시절에는 어느 쪽도 달성할 수 없었던 결과를 만들어냈다. " +
          "그들은 실제 이익이 함께 일하는 것에서 오는 영역에서 경쟁(Compete)하느라 엄청난 에너지를 낭비했음을 깨달았다. " +
          "협력(Collaborate)하기로 선택한다는 것이 높은 기준을 포기한다는 의미가 아니었다 — 그 기준을 함께 높인다는 의미였다. " +
          "팀들은 문서화, 공유 도구, 온보딩에서 협력(Collaborate)하기 시작했고, 이는 조직 전체를 더 강하게 만들었다. " +
          "결국, 그들이 한 가장 강력한 선택은 인정받기 위해 경쟁(Compete)하는 것이 아니라 인정받을 가치 있는 무언가를 향해 협력(Collaborate)하기로 한 것이었다.",
        usedWords: ["Collaborate", "Compete"],
      },
      {
        themeIds: [9, 15], // Ephemeral, Creative → Literature
        title: "The Creative and the Ephemeral",
        titleKo: "창의적인 것과 덧없는 것",
        storyEn:
          "The most Creative ideas often arrive in Ephemeral flashes — there one moment and gone before you can reach for a pen. " +
          "She trained herself to capture those Ephemeral sparks immediately, because a Creative mind is also a forgetful one. " +
          "Her most Creative work had always come from Ephemeral sources: an overheard sentence, a slant of light, a half-remembered dream. " +
          "The Ephemeral nature of inspiration frustrated her until she learned to treat each Ephemeral moment as a gift rather than a problem. " +
          "She developed a Creative habit of noting down everything Ephemeral before evaluating whether it had value. " +
          "Over time, her Creative output grew richer because she had stopped waiting for perfect conditions and started trusting the Ephemeral. " +
          "The most Ephemeral idea — a word spoken in passing, a texture felt briefly — became the seed of her most Creative chapter. " +
          "She understood at last that the Creative life is built not from lasting inspiration but from the courage to act on Ephemeral ones.",
        storyKo:
          "가장 창의적인(Creative) 아이디어는 종종 덧없는(Ephemeral) 번뜩임으로 찾아온다 — 한순간 거기 있다가 펜을 잡기도 전에 사라진다. " +
          "그녀는 그런 덧없는(Ephemeral) 불꽃들을 즉시 포착하는 훈련을 했다 — 창의적인(Creative) 마음은 동시에 건망증이 있는 마음이기도 하니까. " +
          "그녀의 가장 창의적인(Creative) 작업은 항상 덧없는(Ephemeral) 원천에서 왔다 — 우연히 들린 문장, 오후 햇살의 기울기, 반쯤 기억되는 꿈. " +
          "영감의 덧없는(Ephemeral) 속성이 그녀를 좌절시켰지만, 각각의 덧없는(Ephemeral) 순간을 문제가 아닌 선물로 다루는 법을 배우면서 달라졌다. " +
          "그녀는 모든 덧없는(Ephemeral) 것을 가치 있는지 평가하기 전에 먼저 기록해두는 창의적인(Creative) 습관을 개발했다. " +
          "시간이 지나면서, 완벽한 조건을 기다리는 것을 멈추고 덧없음(Ephemeral)을 믿기 시작하면서 그녀의 창의적(Creative) 결과물은 더욱 풍요로워졌다. " +
          "가장 덧없는(Ephemeral) 아이디어 — 지나가며 들린 단어 하나, 잠깐 느낀 질감 — 가 그녀의 가장 창의적인(Creative) 챕터의 씨앗이 되었다. " +
          "그녀는 마침내 이해했다 — 창의적인(Creative) 삶은 영속적인 영감으로 쌓이는 것이 아니라, 덧없는(Ephemeral) 영감에 용기 있게 행동하는 것으로 쌓인다는 것을.",
        usedWords: ["Ephemeral", "Creative"],
      },
    ];

    // 요청된 wordId 기준으로 스토리 테마 점수 산정 → 최고 일치 스토리 선택
    const DEFAULT_STORY = {
      title: "The Journey of Words",
      titleKo: "단어들의 여정",
      storyEn:
        "Maya had always struggled with Resilience, but she refused to let failure become her identity. " +
        "One day, an Ambiguous memo from her manager left the entire team uncertain about their goals. " +
        "Rather than letting the Ambiguous situation paralyze her, Maya chose to act with Perseverance. " +
        "She began to Collaborate with colleagues across departments, turning confusion into collective clarity. " +
        "Each small win gave her new Momentum, and that Momentum carried her through the longest days. " +
        "She studied every challenge like a scientist testing a Hypothesis — methodically, without panic. " +
        "Her Innovative approach to problem-solving inspired others who had lost their own Resilience. " +
        "Slowly, the team rediscovered its rhythm, driven by shared Momentum and a Pragmatic mindset. " +
        "By the end of the quarter, what had seemed Ambiguous was now a clear and Eloquent strategy. " +
        "Maya understood at last that Resilience is not a gift — it is a habit built one word at a time.",
      storyKo:
        "마야는 항상 회복탄력성(Resilience)에 어려움을 겪었지만, 실패가 자신의 정체성이 되는 것을 거부했다. " +
        "어느 날, 관리자로부터 받은 모호한(Ambiguous) 메모가 팀 전체를 목표에 대한 불확실함 속에 빠뜨렸다. " +
        "모호한(Ambiguous) 상황이 자신을 마비시키도록 두는 대신, 마야는 인내(Perseverance)로 행동하기로 했다. " +
        "그녀는 부서를 넘나들며 동료들과 협력(Collaborate)하여 혼란을 공동의 명확함으로 바꾸어 나갔다. " +
        "작은 승리 하나하나가 새로운 추진력(Momentum)이 되었고, 그 추진력(Momentum)은 가장 힘든 날들도 버티게 해주었다. " +
        "그녀는 가설(Hypothesis)을 검증하는 과학자처럼 모든 도전을 체계적으로, 그리고 침착하게 연구했다. " +
        "문제 해결에 대한 혁신적(Innovative)인 접근 방식은 회복탄력성(Resilience)을 잃어버린 동료들에게 영감을 주었다. " +
        "팀은 서서히 리듬을 되찾았고, 공유된 추진력(Momentum)과 실용적(Pragmatic)인 사고방식이 그 원동력이 되었다. " +
        "분기 말이 되자, 모호했던(Ambiguous) 것들이 이제는 설득력 있는(Eloquent) 전략으로 자리 잡았다. " +
        "마야는 마침내 깨달았다 — 회복탄력성(Resilience)은 타고나는 것이 아니라, 매 단어를 통해 쌓아가는 습관이라는 것을.",
      usedWords: ["Resilience", "Ambiguous", "Perseverance", "Collaborate", "Momentum", "Hypothesis", "Innovative", "Pragmatic", "Eloquent"],
    };

    let selected = DEFAULT_STORY;
    if (wrongIds.length > 0) {
      let bestScore = 0;
      for (const template of STORY_POOL) {
        const score = wrongIds.filter((id) => template.themeIds.includes(id)).length;
        if (score > bestScore) {
          bestScore = score;
          selected = template;
        }
      }
    }

    // usedWords: 매칭된 단어가 있으면 실제 단어명으로, 없으면 스토리 기본값
    const usedWords =
      matchedWords.length > 0 ? matchedWords.map((w) => w.word) : selected.usedWords;

    const newStoryId = mockStoryList.length + 1;
    const newStory = {
      storyId: newStoryId,
      title: selected.title,
      titleKo: selected.titleKo,
      storyEn: selected.storyEn,
      storyKo: selected.storyKo,
      createdAt: new Date().toISOString(),
    };

    mockStoryList = [newStory, ...mockStoryList];

    return json(
      {
        success: true,
        message: "스토리 생성 완료",
        ...newStory,
        usedWords,
      },
      { status: 200 }
    );
  }),

  /** -----------------------------------
   * STORY CRUD
   * ----------------------------------- */

  http.post(RE.STORY_LIST, async ({ request }) => {
    await delay(300);
    const unauthorized = requireAuthOr401(request);
    if (unauthorized) return unauthorized;

    let body = {};
    try { body = (await request.json()) ?? {}; } catch { body = {}; }

    const newStoryId = mockStoryList.length + 1;
    const newStory = {
      storyId: newStoryId,
      title:     (body.title     ?? "Untitled").trim(),
      titleKo:   (body.titleKo   ?? "").trim(),
      storyEn:   body.storyEn    ?? "",
      storyKo:   body.storyKo    ?? "",
      createdAt: new Date().toISOString(),
    };

    mockStoryList = [newStory, ...mockStoryList];
    return json(newStory, { status: 201 });
  }),

  http.get(RE.STORY_LIST, async ({ request }) => {
    await delay(160);
    const unauthorized = requireAuthOr401(request);
    if (unauthorized) return unauthorized;

    return json([...mockStoryList], { status: 200 });
  }),

  http.get(RE.STORY_WORDS, async ({ request }) => {
    await delay(140);
    const unauthorized = requireAuthOr401(request);
    if (unauthorized) return unauthorized;

    const url = new URL(request.url);
    const parts = url.pathname.split("/");
    const storyId = Number(parts[parts.length - 2] ?? "0");
    const words = mockStoryWords[storyId] ?? [];

    return json(words, { status: 200 });
  }),

  http.get(RE.STORY_DETAIL, async ({ request }) => {
    await delay(140);
    const unauthorized = requireAuthOr401(request);
    if (unauthorized) return unauthorized;

    const url = new URL(request.url);
    const storyId = Number(url.pathname.split("/").pop() ?? "0");
    const target = mockStoryList.find((s) => Number(s.storyId) === storyId);

    if (!target) {
      return json({ message: "Story not found" }, { status: 404 });
    }

    return json(target, { status: 200 });
  }),

  http.delete(RE.STORY_DETAIL, async ({ request }) => {
    await delay(140);
    const unauthorized = requireAuthOr401(request);
    if (unauthorized) return unauthorized;

    const url = new URL(request.url);
    const storyId = Number(url.pathname.split("/").pop() ?? "0");
    const exists = mockStoryList.some((s) => Number(s.storyId) === storyId);

    if (!exists) {
      return json({ message: "Story not found" }, { status: 404 });
    }

    mockStoryList = mockStoryList.filter((s) => Number(s.storyId) !== storyId);
    return json({ success: true, storyId }, { status: 200 });
  }),

  /** -----------------------------------
   * QUIZ
   * ----------------------------------- */

  http.get(RE.QUIZ, async ({ request }) => {
    await delay(160);
    const unauthorized = requireAuthOr401(request);
    if (unauthorized) return unauthorized;

    // 목록을 셔플해서 앞 4개 사용
    const shuffled = [...mockWordList].sort(() => Math.random() - 0.5);
    const [question, ...rest] = shuffled;
    const distractors = rest.slice(0, 3);

    const options = [question.meaning, ...distractors.map((w) => w.meaning)]
      .sort(() => Math.random() - 0.5);

    return json(
      {
        wordId:  question.wordId,
        word:    question.word,
        options,
        answer:  question.meaning,
      },
      { status: 200 }
    );
  }),

  http.post(RE.QUIZ, async ({ request }) => {
    await delay(120);
    const unauthorized = requireAuthOr401(request);
    if (unauthorized) return unauthorized;

    let body = {};
    try { body = (await request.json()) ?? {}; } catch { body = {}; }

    const wordId     = Number(body.wordId ?? 0);
    const userAnswer = String(body.userAnswer ?? "").trim();
    const target     = mockWordList.find((w) => Number(w.wordId) === wordId);
    const correct    = !!target && target.meaning === userAnswer;

    return json(
      { correct, correctAnswer: target?.meaning ?? "" },
      { status: 200 }
    );
  }),

  /** -----------------------------------
   * FLASHCARD
   * ----------------------------------- */

  http.get(RE.FLASHCARD, async ({ request }) => {
    await delay(150);
    const unauthorized = requireAuthOr401(request);
    if (unauthorized) return unauthorized;

    return json([...mockWordList], { status: 200 });
  }),

  /** -----------------------------------
   * WRONG LOG
   * ----------------------------------- */

  http.get(RE.WRONG_LIST, async ({ request }) => {
    await delay(140);
    const unauthorized = requireAuthOr401(request);
    if (unauthorized) return unauthorized;

    const result = [];
    for (const [wordId, log] of mockStudyLog.entries()) {
      if (log.status === "wrong" || log.status === "review") {
        const word = mockWordList.find((w) => Number(w.wordId) === wordId);
        if (word) {
          result.push({
            wrongWordId: wordId,
            wordId,
            word:        word.word,
            meaning:     word.meaning,
            totalWrong:  log.totalWrong,
            lastStudyAt: log.lastStudyAt,
          });
        }
      }
    }

    return json(result, { status: 200 });
  }),

  http.post(RE.WRONG_ITEM, async ({ request }) => {
    await delay(120);
    const unauthorized = requireAuthOr401(request);
    if (unauthorized) return unauthorized;

    const url    = new URL(request.url);
    const wordId = Number(url.pathname.split("/").pop() ?? "0");
    const prev   = mockStudyLog.get(wordId) ?? { totalCorrect: 0, totalWrong: 0, status: "none", lastStudyAt: null };
    mockStudyLog.set(wordId, { ...prev, totalWrong: prev.totalWrong + 1, status: "wrong", lastStudyAt: new Date().toISOString() });

    return json({ success: true }, { status: 200 });
  }),

  /** -----------------------------------
   * AUTH (회원가입 / 이메일·닉네임 중복확인)
   * ----------------------------------- */

  http.post(RE.AUTH_SIGNUP, async () => {
    await delay(200);
    return json({ success: true, message: "회원가입 성공" }, { status: 201 });
  }),

  http.post(RE.AUTH_CHECK_EMAIL, async () => {
    await delay(100);
    return json({ available: true }, { status: 200 });
  }),

  http.post(RE.AUTH_CHECK_NICKNAME, async () => {
    await delay(100);
    return json({ available: true }, { status: 200 });
  }),

  http.get(RE.COMPLETED_STATUS, async ({ request }) => {
    await delay(120);
    const unauthorized = requireAuthOr401(request);
    if (unauthorized) return unauthorized;

    const url = new URL(request.url);
    const parts = url.pathname.split("/");
    const wordId = Number(parts[parts.length - 2] ?? "0");
    const target = mockWordList.find((w) => Number(w.wordId) === wordId);

    return json({ wordId, completed: !!target?.isCompleted }, { status: 200 });
  }),
];

/*
요약(3줄)
1) /api/auth/login은 EXPIRED_ACCESS를 내려서 /me·/today·/summary가 401을 내도록 유도합니다.
2) /api/auth/refresh는 refreshToken이 맞으면 VALID_ACCESS로 전환해 원요청들이 200으로 재시도됩니다.
3) RegExp 매칭으로 5173/8080 어디로 요청하든 MSW가 가로채서 서버 OFF 상태에서도 동작합니다.
*/
