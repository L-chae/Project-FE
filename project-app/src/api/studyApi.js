// src/api/studyApi.js
import httpClient from "./httpClient";

const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true";

/**
 * MOCK용 인메모리 상태
 *  - key: wordId
 *  - value: { wordId, status: 'correct' | 'wrong' | 'none', totalCorrect, totalWrong }
 */
const mockStudyMap = new Map();

const ensureMockStudyItem = (wordId) => {
  const id = Number(wordId);
  if (!mockStudyMap.has(id)) {
    mockStudyMap.set(id, {
      wordId: id,
      status: "none",
      totalCorrect: 0,
      totalWrong: 0,
    });
  }
  return mockStudyMap.get(id);
};

/**
 * 단어 학습 상태 조회
 * GET /api/study/{wordId}/status
 *
 * Response 예시:
 * {
 *   "status": "wrong"
 * }
 */
export const getStudyStatus = async (wordId) => {
  if (!wordId && wordId !== 0) {
    throw new Error("getStudyStatus: wordId가 필요합니다.");
  }

  if (USE_MOCK) {
    const item = ensureMockStudyItem(wordId);
    return { status: item.status };
  }

  const id = Number(wordId);

  try {
    const res = await httpClient.get(`/api/study/${id}/status`);
    const data = res.data ?? {};
    // status 없으면 기본값 "none"
    return {
      status: typeof data.status === "string" ? data.status : "none",
    };
  } catch (e) {
    console.error("getStudyStatus error:", e.response?.data || e);
    throw e;
  }
};

/**
 * 정답 처리
 * POST /api/study/{wordId}/correct
 *
 * Response 예시:
 * {
 *   "wordId": 12,
 *   "status": "correct",
 *   "totalCorrect": 10,
 *   "totalWrong": 3
 * }
 */
export const recordStudyCorrect = async (wordId) => {
  if (!wordId && wordId !== 0) {
    throw new Error("recordStudyCorrect: wordId가 필요합니다.");
  }

  if (USE_MOCK) {
    const item = ensureMockStudyItem(wordId);
    item.totalCorrect += 1;
    item.status = "correct";
    return {
      wordId: item.wordId,
      status: item.status,
      totalCorrect: item.totalCorrect,
      totalWrong: item.totalWrong,
    };
  }

  const id = Number(wordId);

  try {
    const res = await httpClient.post(`/api/study/${id}/correct`);
    return res.data;
  } catch (e) {
    console.error("recordStudyCorrect error:", e.response?.data || e);
    throw e;
  }
};

/**
 * 오답 처리
 * POST /api/study/{wordId}/wrong
 *
 * (오답 로그 자동 기록)
 * Response는 백엔드 구현에 따라 다를 수 있음.
 * 있으면 그대로 반환, 없으면 null 반환.
 */
export const recordStudyWrong = async (wordId) => {
  if (!wordId && wordId !== 0) {
    throw new Error("recordStudyWrong: wordId가 필요합니다.");
  }

  if (USE_MOCK) {
    const item = ensureMockStudyItem(wordId);
    item.totalWrong += 1;
    item.status = "wrong";
    return {
      wordId: item.wordId,
      status: item.status,
      totalCorrect: item.totalCorrect,
      totalWrong: item.totalWrong,
    };
  }

  const id = Number(wordId);

  try {
    const res = await httpClient.post(`/api/study/${id}/wrong`);
    // 백엔드에서 바디를 안 돌려줘도 안전하게 처리
    return res.data ?? null;
  } catch (e) {
    console.error("recordStudyWrong error:", e.response?.data || e);
    throw e;
  }
};
