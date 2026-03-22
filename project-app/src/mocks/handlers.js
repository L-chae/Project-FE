// src/mocks/handlers.js
import { http, HttpResponse, delay } from "msw";

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

  AUTH_LOGIN: /\/api\/auth\/login$/,
  AUTH_REFRESH: /\/api\/auth\/refresh$/,
  AUTH_LOGOUT: /\/api\/auth\/logout\/?.*$/,

  USER_ME: /\/api\/user\/me$/,

  DASH_DAILY_GOAL: /\/api\/dashboard\/daily-goal$/,
  DASH_STATS: /\/api\/dashboard\/stats$/,
  DASH_SUMMARY: /\/api\/dashboard\/summary$/,
  DASH_WEEKLY: /\/api\/dashboard\/weekly$/,
  DASH_WRONG_TOP5: /\/api\/dashboard\/wrong\/top5$/,

  WORDS_TODAY: /\/api\/words\/today$/,
  WORDS_ALL: /\/api\/words\/all$/,
  WORDS_LIST: /\/api\/words$/,
  WORDS_SEARCH: /\/api\/words\/search$/,
  WORDS_FILTER: /\/api\/words\/filter$/,

  FAVORITES_LIST: /\/api\/favorites$/,
  FAVORITES_ITEM: /\/api\/favorites\/\d+$/,

  COMPLETED_LIST: /\/api\/completed$/,
  COMPLETED_STATUS: /\/api\/completed\/\d+\/status$/,

  WORDS_DETAIL: /\/api\/words\/detail\/\d+$/,

  CLUSTER: /\/api\/cluster$/,

  STUDY_ITEM: /\/api\/study\/\d+$/,
  STUDY_CORRECT: /\/api\/study\/\d+\/correct$/,
  STUDY_WRONG: /\/api\/study\/\d+\/wrong$/,

  STORY_GENERATE: /\/api\/story\/generate$/,
};

const mockUser = {
  userId: 1,
  email: "test@example.com",
  nickname: "Mock User",
  userName: "목업 유저",
  userBirth: "2000-01-01",
  preference: "Narrative",
  goal: "영어 마스터하기",
  dailyWordGoal: 10,
};

let mockWordList = [
  {
    wordId: 1,
    word: "Resilience",
    meaning: "회복탄력성",
    partOfSpeech: "Noun",
    category: "Business",
    level: 2,
    isFavorite: true,
    isCompleted: false,
    exampleSentenceEn: "Resilience helps you recover from setbacks.",
    exampleSentenceKo: "회복탄력성은 좌절에서 회복하게 해준다.",
  },
  {
    wordId: 2,
    word: "Ambiguous",
    meaning: "모호한",
    partOfSpeech: "Adjective",
    category: "Business",
    level: 2,
    isFavorite: false,
    isCompleted: true,
    exampleSentenceEn: "The requirement is ambiguous.",
    exampleSentenceKo: "요구사항이 모호하다.",
  },
  {
    wordId: 3,
    word: "Innovative",
    meaning: "혁신적인",
    partOfSpeech: "Adjective",
    category: "Technology",
    level: 2,
    isFavorite: true,
    isCompleted: false,
    exampleSentenceEn: "The startup introduced an innovative solution to the problem.",
    exampleSentenceKo: "그 스타트업은 문제에 혁신적인 해결책을 내놓았다.",
  },
  {
    wordId: 4,
    word: "Algorithm",
    meaning: "알고리즘",
    partOfSpeech: "Noun",
    category: "Technology",
    level: 3,
    isFavorite: false,
    isCompleted: true,
    exampleSentenceEn: "The algorithm sorts data in logarithmic time.",
    exampleSentenceKo: "이 알고리즘은 데이터를 로그 시간 안에 정렬한다.",
  },
  {
    wordId: 5,
    word: "Perseverance",
    meaning: "인내, 끈기",
    partOfSpeech: "Noun",
    category: "Daily Life",
    level: 2,
    isFavorite: false,
    isCompleted: false,
    exampleSentenceEn: "Perseverance is the key to long-term success.",
    exampleSentenceKo: "인내는 장기적인 성공의 열쇠다.",
  },
  {
    wordId: 6,
    word: "Eloquent",
    meaning: "유창한, 설득력 있는",
    partOfSpeech: "Adjective",
    category: "Literature",
    level: 3,
    isFavorite: true,
    isCompleted: false,
    exampleSentenceEn: "She gave an eloquent speech that moved the audience.",
    exampleSentenceKo: "그녀는 청중을 감동시키는 유창한 연설을 했다.",
  },
  {
    wordId: 7,
    word: "Hypothesis",
    meaning: "가설",
    partOfSpeech: "Noun",
    category: "Science",
    level: 3,
    isFavorite: false,
    isCompleted: true,
    exampleSentenceEn: "The scientist tested her hypothesis through experiments.",
    exampleSentenceKo: "과학자는 실험을 통해 가설을 검증했다.",
  },
  {
    wordId: 8,
    word: "Collaborate",
    meaning: "협력하다",
    partOfSpeech: "Verb",
    category: "Business",
    level: 1,
    isFavorite: false,
    isCompleted: false,
    exampleSentenceEn: "Teams collaborate to deliver the project on time.",
    exampleSentenceKo: "팀들은 프로젝트를 제때 완료하기 위해 협력한다.",
  },
  {
    wordId: 9,
    word: "Ephemeral",
    meaning: "일시적인, 덧없는",
    partOfSpeech: "Adjective",
    category: "Literature",
    level: 3,
    isFavorite: true,
    isCompleted: false,
    exampleSentenceEn: "Fame can be ephemeral if not backed by talent.",
    exampleSentenceKo: "재능이 뒷받침되지 않으면 명성은 덧없을 수 있다.",
  },
  {
    wordId: 10,
    word: "Momentum",
    meaning: "추진력, 가속도",
    partOfSpeech: "Noun",
    category: "Science",
    level: 2,
    isFavorite: false,
    isCompleted: true,
    exampleSentenceEn: "The project gained momentum after the first milestone.",
    exampleSentenceKo: "첫 번째 마일스톤 이후 프로젝트가 추진력을 얻었다.",
  },
  {
    wordId: 11,
    word: "Transparent",
    meaning: "투명한, 솔직한",
    partOfSpeech: "Adjective",
    category: "Business",
    level: 1,
    isFavorite: false,
    isCompleted: false,
    exampleSentenceEn: "The company maintains a transparent communication policy.",
    exampleSentenceKo: "회사는 투명한 소통 정책을 유지한다.",
  },
  {
    wordId: 12,
    word: "Pragmatic",
    meaning: "실용적인",
    partOfSpeech: "Adjective",
    category: "Daily Life",
    level: 2,
    isFavorite: true,
    isCompleted: false,
    exampleSentenceEn: "A pragmatic approach focuses on practical results.",
    exampleSentenceKo: "실용적인 접근 방식은 실질적인 결과에 집중한다.",
  },
];

const mockClusterMap = {
  1: {
    similar: [
      { text: "Tenacity", meaning: "끈질김", type: "synonym", score: 0.91, inMyList: false },
      { text: "Endurance", meaning: "인내력", type: "synonym", score: 0.87, inMyList: true },
    ],
    opposite: [
      { text: "Fragility", meaning: "취약함", type: "antonym", score: 0.85, inMyList: false },
      { text: "Weakness", meaning: "나약함", type: "antonym", score: 0.80, inMyList: false },
    ],
  },
  2: {
    similar: [
      { text: "Vague", meaning: "불분명한", type: "synonym", score: 0.93, inMyList: false },
      { text: "Unclear", meaning: "불명확한", type: "synonym", score: 0.88, inMyList: false },
    ],
    opposite: [
      { text: "Clear", meaning: "명확한", type: "antonym", score: 0.92, inMyList: true },
      { text: "Definite", meaning: "확실한", type: "antonym", score: 0.84, inMyList: false },
    ],
  },
  3: {
    similar: [
      { text: "Creative", meaning: "창의적인", type: "synonym", score: 0.89, inMyList: true },
      { text: "Pioneering", meaning: "선구적인", type: "synonym", score: 0.83, inMyList: false },
    ],
    opposite: [
      { text: "Conventional", meaning: "전통적인", type: "antonym", score: 0.86, inMyList: false },
      { text: "Outdated", meaning: "구식의", type: "antonym", score: 0.78, inMyList: false },
    ],
  },
  6: {
    similar: [
      { text: "Articulate", meaning: "명확히 표현하는", type: "synonym", score: 0.90, inMyList: false },
      { text: "Expressive", meaning: "표현력이 풍부한", type: "synonym", score: 0.85, inMyList: false },
    ],
    opposite: [
      { text: "Inarticulate", meaning: "말을 잘 못하는", type: "antonym", score: 0.88, inMyList: false },
    ],
  },
  9: {
    similar: [
      { text: "Transient", meaning: "일시적인", type: "synonym", score: 0.94, inMyList: false },
      { text: "Fleeting", meaning: "순간적인", type: "synonym", score: 0.90, inMyList: false },
    ],
    opposite: [
      { text: "Permanent", meaning: "영구적인", type: "antonym", score: 0.91, inMyList: true },
      { text: "Enduring", meaning: "지속적인", type: "antonym", score: 0.86, inMyList: false },
    ],
  },
};

const DEFAULT_CLUSTER = {
  similar: [
    { text: "Similar Word", meaning: "유사 단어", type: "synonym", score: 0.80, inMyList: false },
  ],
  opposite: [
    { text: "Opposite Word", meaning: "반대 단어", type: "antonym", score: 0.75, inMyList: false },
  ],
};

// wordId → { totalCorrect, totalWrong, status, lastStudyAt }
const mockStudyLog = new Map([
  [2, { totalCorrect: 5, totalWrong: 1, status: "correct", lastStudyAt: "2026-03-20T10:00:00.000Z" }],
  [4, { totalCorrect: 3, totalWrong: 3, status: "review",  lastStudyAt: "2026-03-19T14:30:00.000Z" }],
  [7, { totalCorrect: 8, totalWrong: 0, status: "correct", lastStudyAt: "2026-03-21T09:15:00.000Z" }],
  [10, { totalCorrect: 2, totalWrong: 4, status: "wrong",  lastStudyAt: "2026-03-18T16:00:00.000Z" }],
]);

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
        { wordId: 1, word: "Coffee", meaning: "커피", count: 5 },
        { wordId: 2, word: "Resilience", meaning: "회복탄력성", count: 4 },
        { wordId: 3, word: "Ambiguous", meaning: "모호한", count: 3 },
        { wordId: 4, word: "Strategy", meaning: "전략", count: 3 },
        { wordId: 5, word: "Implement", meaning: "실행하다", count: 3 },
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

  http.post(RE.STORY_GENERATE, async ({ request }) => {
    await delay(800);
    const unauthorized = requireAuthOr401(request);
    if (unauthorized) return unauthorized;

    let body = {};
    try {
      body = (await request.json()) ?? {};
    } catch {
      body = {};
    }

    const words = Array.isArray(body?.words) ? body.words : ["resilience", "ambiguous"];
    const wordList = words.join(", ");

    const story = `In a bustling city filled with opportunity and challenge, Maya discovered the true meaning of resilience. Every morning, she faced situations that were often ambiguous — decisions that had no clear right or wrong answer.

One day, her manager handed her a project with instructions so ambiguous that her entire team was confused. Rather than giving up, Maya drew upon her resilience and called a meeting to clarify the goals together.

"Life is rarely straightforward," she told her colleagues. "But our resilience is what allows us to move forward even when the path seems ambiguous."

By the end of the quarter, Maya's team had delivered outstanding results. Their success was a testament to the power of resilience in the face of ambiguity.

[Words used: ${wordList}]`;

    return json(
      {
        story,
        usedWords: words,
        generatedAt: new Date().toISOString(),
      },
      { status: 200 }
    );
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
