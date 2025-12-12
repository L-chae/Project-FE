// src/api/wrongApi.js
import httpClient from "./httpClient";

const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true";

/**
 * WRONG_ANSWER_LOG 공통 normalize
 * - 백엔드 필드명이 달라도 프론트에서는 동일 구조로 쓰기 위함
 * - 12/12 핵심 수정:
 *   1) raw.meaningKo / raw.meaning_ko / raw.korean 우선 반영
 *   2) exampleSentenceKo로 meaning을 대체하지 않음(뜻 오염/반복 원인)
 *   3) word가 객체로 내려오는 케이스 안전 처리 유지
 */
const normalizeWrongItem = (raw) => {
  if (!raw || typeof raw !== "object") {
    console.error("normalizeWrongItem: invalid data", raw);
    return null;
  }

  // 백엔드에서 word가 객체(Word 엔티티)로 내려오는 경우 처리
  const wordObj =
    raw.word && typeof raw.word === "object" && raw.word !== null
      ? raw.word
      : null;

  const used =
    raw.isUsedInStory === true ||
    raw.isUsedInStory === "Y" ||
    raw.isUsedInStory === "y";

  // meaning 정규화 (예문으로 대체 금지)
  const meaning =
    raw.meaningKo ??
    raw.meaning_ko ??
    raw.meaning ??
    raw.korean ??
    wordObj?.meaningKo ??
    wordObj?.meaning_ko ??
    wordObj?.meaning ??
    wordObj?.korean ??
    "";

  return {
    // PK
    wrongWordId: raw.wrongWordId ?? raw.wrongLogId ?? raw.id,

    // 단어 정보
    wordId: raw.wordId ?? wordObj?.wordId ?? wordObj?.id ?? null,
    word:
      typeof raw.word === "string"
        ? raw.word
        : wordObj?.word ?? wordObj?.text ?? "",
    meaning,

    // 난이도
    wordLevel:
      raw.wordLevel ??
      raw.level ??
      wordObj?.level ??
      wordObj?.wordLevel ??
      raw.difficultyLevel ??
      raw.difficulty ??
      null,

    // 마지막 오답 시각(정규화)
    wrongAt: raw.wrongAt ?? raw.lastWrongAt ?? raw.wrong_at ?? null,

    // 누적 정답/오답
    totalWrong: raw.totalWrong ?? raw.wrongCount ?? raw.wrong ?? 0,
    totalCorrect: raw.totalCorrect ?? raw.correctCount ?? 0,

    // 스토리 사용 여부 → 항상 "Y" / "N"
    isUsedInStory: used ? "Y" : "N",
  };
};

/* =========================================================
 * MOCK 모드용 인메모리 상태
 *  - addWrongLog / deleteWrongLog / getWrongList /
 *    getUnusedWrongLogs / markWrongUsed / getRecentWrongLogs
 *    가 같은 배열을 공유
 * ======================================================= */

let mockWrongList = [];
let mockInitialized = false;

const initMockWrongList = () => {
  if (mockInitialized) return;
  mockInitialized = true;

  const daysAgo = (n) => {
    const d = new Date();
    d.setDate(d.getDate() - n);
    return d.toISOString();
  };

  const raw = [
    {
      wrongWordId: 1,
      wordId: 101,
      word: "ambiguous",
      meaning: "애매모호한",
      wordLevel: 1,
      wrongAt: daysAgo(0),
      totalCorrect: 1,
      totalWrong: 3,
      isUsedInStory: "N",
    },
    {
      wrongWordId: 2,
      wordId: 102,
      word: "mitigate",
      meaning: "완화하다",
      wordLevel: 2,
      wrongAt: daysAgo(1),
      totalCorrect: 0,
      totalWrong: 4,
      isUsedInStory: "Y",
    },
    {
      wrongWordId: 3,
      wordId: 103,
      word: "scrutinize",
      meaning: "세밀히 조사하다",
      wordLevel: 3,
      wrongAt: daysAgo(2),
      totalCorrect: 2,
      totalWrong: 5,
      isUsedInStory: "N",
    },
  ];

  mockWrongList = raw.map(normalizeWrongItem).filter(Boolean);
};

/**
 * 오답 기록 추가
 * POST /api/wrong/{wordId}
 */
export const addWrongLog = async (wordId) => {
  if (USE_MOCK) {
    console.log("[Mock] 오답 기록 추가:", wordId);
    initMockWrongList();

    const raw = {
      wrongWordId: Date.now(), // 임시 PK
      wordId,
      word: `mock-word-${wordId}`,
      meaning: "목업 의미",
      wrongAt: new Date().toISOString(),
      totalWrong: 1,
      totalCorrect: 0,
      isUsedInStory: "N",
    };

    const newItem = normalizeWrongItem(raw);
    mockWrongList = [newItem, ...mockWrongList];
    return newItem;
  }

  const res = await httpClient.post(`/api/wrong/${wordId}`);
  const data = res.data;
  return normalizeWrongItem(data) ?? data;
};

/**
 * 오답 기록 삭제
 * DELETE /api/wrong/{wordId}
 * (wordId 기준 삭제)
 */
export const deleteWrongLog = async (wordId) => {
  if (USE_MOCK) {
    console.log("[Mock] 오답 기록 삭제:", wordId);
    initMockWrongList();

    mockWrongList = mockWrongList.filter((i) => i.wordId !== Number(wordId));
    return { success: true };
  }

  const res = await httpClient.delete(`/api/wrong/${wordId}`);
  return res.data;
};

/**
 * 내 오답 목록 전체 조회
 * GET /api/wrong
 */
export const getWrongList = async () => {
  if (USE_MOCK) {
    console.log("[Mock] 내 오답 목록 조회");
    initMockWrongList();
    // 이미 normalize된 상태이므로 그대로 복사 반환
    return [...mockWrongList];
  }

  const res = await httpClient.get("/api/wrong");
  const arr = Array.isArray(res.data) ? res.data : [];

  return arr.map(normalizeWrongItem).filter(Boolean);
};

/**
 * 스토리에 아직 사용되지 않은 오답 목록
 * GET /api/wrong/unused
 *
 * StoryCreatePage 등에서 사용.
 * 여기서는 단순 필드만 리턴.
 *
 * 추가 수정:
 * - 백엔드가 word를 객체로 내려주는 경우에도 깨지지 않게 normalizeWrongItem 사용
 * - meaningKo/meaning_ko/korean도 정상 반영
 */
export const getUnusedWrongLogs = async () => {
  if (USE_MOCK) {
    console.log("[Mock] 스토리 미사용 오답 목록 조회");
    initMockWrongList();

    return mockWrongList
      .filter((item) => item.isUsedInStory === "N")
      .map((item) => ({
        wrongWordId: item.wrongWordId,
        wordId: item.wordId,
        word: item.word,
        meaning: item.meaning,
      }));
  }

  const res = await httpClient.get("/api/wrong/unused");
  const arr = Array.isArray(res.data) ? res.data : [];

  return arr
    .map(normalizeWrongItem)
    .filter(Boolean)
    .map((item) => ({
      wrongWordId: item.wrongWordId,
      wordId: item.wordId,
      word: item.word,
      meaning: item.meaning,
    }));
};

/**
 * 최근 퀴즈 오답 (대시보드/홈 등에서 사용)
 * GET /api/quiz/recent-wrong
 *
 * 리턴 형태는 예전 코드와 동일하게 맞춤:
 *  - { wrongLogId, wordId, word, meaning }
 */
export const getRecentWrongLogs = async () => {
  if (USE_MOCK) {
    console.log("[Mock] 최근 퀴즈 오답 조회");
    initMockWrongList();

    // wrongAt 기준 내림차순 정렬 후 상위 5개 예시
    const sorted = [...mockWrongList].sort((a, b) => {
      if (!a.wrongAt || !b.wrongAt) return 0;
      return new Date(b.wrongAt) - new Date(a.wrongAt);
    });

    return sorted.slice(0, 5).map((item) => ({
      wrongLogId: item.wrongWordId,
      wordId: item.wordId,
      word: item.word,
      meaning: item.meaning,
    }));
  }

  const res = await httpClient.get("/api/quiz/recent-wrong");
  const arr = Array.isArray(res.data) ? res.data : [];

  // RecentWrongResponse는 이미 평평한 형태라 normalize 쓰지 않고 안전 매핑
  return arr.map((raw) => ({
    wrongLogId: raw.wrongLogId ?? raw.wrongWordId ?? raw.id,
    wordId: raw.wordId ?? null,
    word: typeof raw.word === "string" ? raw.word : raw.word?.word ?? "",
    meaning:
      raw.meaningKo ??
      raw.meaning_ko ??
      raw.meaning ??
      raw.korean ??
      raw.word?.meaningKo ??
      raw.word?.meaning ??
      "",
  }));
};

/**
 * 오답 기록 → 스토리에 사용됨 처리
 * POST /api/wrong/mark-used/{wrongLogId}
 */
export const markWrongUsed = async (wrongLogId) => {
  if (USE_MOCK) {
    console.log("[Mock] 오답 스토리 사용 처리:", wrongLogId);
    initMockWrongList();

    mockWrongList = mockWrongList.map((item) =>
      item.wrongWordId === Number(wrongLogId)
        ? { ...item, isUsedInStory: "Y" }
        : item
    );

    return { success: true };
  }

  const res = await httpClient.post(`/api/wrong/mark-used/${wrongLogId}`);
  return res.data;
};
