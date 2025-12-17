// src/api/studyApi.js
import httpClient from "./httpClient";

const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true";

/**
 * 프론트 표준값:
 * - correct: 학습 완료(= learned/completed/correct/done)
 * - none: 학습 예정(= pending/todo/none)
 */
const normalizeStudyStatus = (raw) => {
  const s = String(raw ?? "none").trim().toLowerCase();
  if (["correct", "learned", "completed", "done"].includes(s)) return "correct";
  if (["none", "pending", "todo", ""].includes(s)) return "none";
  return s; // unknown은 그대로 (디버깅용)
};

const normalizeStudyLogResponse = (raw, wordId) => {
  if (!raw || typeof raw !== "object") {
    return { wordId: Number(wordId), status: "none" };
  }

  const id =
    raw.wordId ??
    raw.word_id ??
    raw.id ??
    wordId;

  return {
    ...raw,
    wordId: Number(id),
    status: normalizeStudyStatus(raw.status),
  };
};

// MOCK
const mockStudyMap = new Map();
const ensureMock = (wordId) => {
  const id = Number(wordId);
  if (!mockStudyMap.has(id)) {
    mockStudyMap.set(id, { wordId: id, status: "none", totalCorrect: 0, totalWrong: 0 });
  }
  return mockStudyMap.get(id);
};

/**
 * ✅ (신규) GET /api/study/{wordId}
 *  - StudyLogResponse 반환 (status 포함)
 *
 * ⛳ 호환(Fallback):
 *  - 구 서버면 GET /api/completed/{wordId}/status (Boolean)도 시도
 */
export const getStudyStatus = async (wordId) => {
  if (wordId == null) throw new Error("getStudyStatus: wordId가 필요합니다.");
  const id = Number(wordId);

  if (USE_MOCK) {
    const item = ensureMock(id);
    return normalizeStudyLogResponse(item, id);
  }

  try {
    const res = await httpClient.get(`/api/study/${id}`);
    return normalizeStudyLogResponse(res.data, id);
  } catch (e) {
    // fallback: 기존 completed API가 살아있는 환경
    const statusCode = e?.response?.status;
    try {
      const res2 = await httpClient.get(`/api/completed/${id}/status`);
      const isCompleted = !!res2.data;
      return { wordId: id, status: isCompleted ? "correct" : "none" };
    } catch (e2) {
      console.error("getStudyStatus error:", e2.response?.data || e2);
      // 조회 실패해도 UI는 "학습 예정"으로 안전하게
      return { wordId: id, status: "none" };
    }
  }
};

/**
 * ✅ (신규) POST /api/study/{wordId}/correct
 *  - StudyLogResponse 반환
 *
 * ⛳ 호환(Fallback):
 *  - 구 서버면 POST /api/completed/{wordId}
 */
export const recordStudyCorrect = async (wordId) => {
  if (wordId == null) throw new Error("recordStudyCorrect: wordId가 필요합니다.");
  const id = Number(wordId);

  if (USE_MOCK) {
    const item = ensureMock(id);
    item.status = "correct";
    item.totalCorrect = (item.totalCorrect ?? 0) + 1;
    return normalizeStudyLogResponse(item, id);
  }

  try {
    const res = await httpClient.post(`/api/study/${id}/correct`);
    return normalizeStudyLogResponse(res.data, id);
  } catch (e) {
    // fallback: 기존 completed API
    try {
      await httpClient.post(`/api/completed/${id}`);
      return { wordId: id, status: "correct" };
    } catch (e2) {
      console.error("recordStudyCorrect error:", e2.response?.data || e2);
      throw e2;
    }
  }
};

/**
 * ✅ (신규) POST /api/study/{wordId}/wrong
 *  - StudyLogResponse 반환
 *
 * 옵션:
 *  - alsoAddWrongLog=true 이면 /api/wrong/{wordId}도 같이 호출(오답노트 연동)
 */
export const recordStudyWrong = async (wordId, { alsoAddWrongLog = true } = {}) => {
  if (wordId == null) throw new Error("recordStudyWrong: wordId가 필요합니다.");
  const id = Number(wordId);

  if (USE_MOCK) {
    const item = ensureMock(id);
    item.status = "none";
    item.totalWrong = (item.totalWrong ?? 0) + 1;
    return normalizeStudyLogResponse(item, id);
  }

  const studyReq = httpClient.post(`/api/study/${id}/wrong`);

  // 오답노트용 wrong 로그까지 같이 남기려면(요구사항: study + wrong 둘 다)
  const wrongReq = alsoAddWrongLog ? httpClient.post(`/api/wrong/${id}`) : null;

  const results = await Promise.allSettled(
    wrongReq ? [studyReq, wrongReq] : [studyReq]
  );

  const studyResult = results[0];
  if (studyResult.status === "rejected") {
    console.error("recordStudyWrong (study) error:", studyResult.reason?.response?.data || studyResult.reason);
    throw studyResult.reason;
  }

  // wrong 로그 실패는 경고만(학습 상태 반영은 우선 유지)
  if (wrongReq) {
    const wrongResult = results[1];
    if (wrongResult.status === "rejected") {
      console.warn("recordStudyWrong (wrong log) failed:", wrongResult.reason?.response?.data || wrongResult.reason);
    }
  }

  return normalizeStudyLogResponse(studyResult.value.data, id);
};
