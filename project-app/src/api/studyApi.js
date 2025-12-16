// src/api/studyApi.js
import httpClient from "./httpClient";

const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true";

/**
 * ✅ 백엔드/DB 상태값을 프론트 표준값으로 정규화
 * 프론트는 'correct'일 때만 "학습 완료"로 보이게 할 거라서,
 * learned/completed/done 같은 값도 correct로 매핑해준다.
 */
const normalizeStudyStatus = (raw) => {
  const s = String(raw ?? "none").trim().toLowerCase();

  // 정답 완료 계열
  if (["correct", "learned", "completed", "done"].includes(s)) return "correct";

  // 오답 계열
  if (["wrong", "incorrect", "fail", "failed"].includes(s)) return "wrong";

  // 미학습 계열
  if (["none", "pending", "todo", ""].includes(s)) return "none";

  // 그 외는 그대로(확장 가능)
  return s;
};

/**
 * ✅ 응답이 문자열 / JSON 둘 다 올 수 있어서 status 뽑아내는 헬퍼
 * - "learned" (string) -> "learned"
 * - { status: "learned" } (object) -> "learned"
 * - 그 외 -> fallback
 */
const pickStatusFromResponse = (data, fallback = "none") => {
  if (typeof data === "string") return data;
  if (data && typeof data === "object" && typeof data.status === "string") return data.status;
  return fallback;
};

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
 *  - "learned" (문자열)
 *  - { "status": "learned" } (JSON)
 */
export const getStudyStatus = async (wordId) => {
  if (!wordId && wordId !== 0) {
    throw new Error("getStudyStatus: wordId가 필요합니다.");
  }

  if (USE_MOCK) {
    const item = ensureMockStudyItem(wordId);
    return { status: normalizeStudyStatus(item.status) };
  }

  const id = Number(wordId);

  try {
    const res = await httpClient.get(`/api/study/${id}/status`);
    const statusRaw = pickStatusFromResponse(res.data, "none");
    return { status: normalizeStudyStatus(statusRaw) };
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
 *  - "learned" / "correct" (문자열)
 *  - { wordId, status, totalCorrect, totalWrong } (JSON)
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
      status: normalizeStudyStatus(item.status),
      totalCorrect: item.totalCorrect,
      totalWrong: item.totalWrong,
    };
  }

  const id = Number(wordId);

  try {
    const res = await httpClient.post(`/api/study/${id}/correct`);
    const raw = res.data;

    // 문자열 응답이면 표준 형태로 감싸서 반환
    if (typeof raw === "string") {
      return { wordId: id, status: normalizeStudyStatus(raw) };
    }

    const data = raw ?? {};
    return {
      ...data,
      // 혹시 status가 없거나 learned 등으로 와도 보정
      status: normalizeStudyStatus(pickStatusFromResponse(data, "correct")),
    };
  } catch (e) {
    console.error("recordStudyCorrect error:", e.response?.data || e);
    throw e;
  }
};

/**
 * 오답 처리
 * POST /api/study/{wordId}/wrong
 *
 * Response 예시:
 *  - "wrong" (문자열)
 *  - { ... , status: "wrong" } (JSON)
 *  - 바디 없음(null)일 수도 있음
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
      status: normalizeStudyStatus(item.status),
      totalCorrect: item.totalCorrect,
      totalWrong: item.totalWrong,
    };
  }

  const id = Number(wordId);

  try {
    const res = await httpClient.post(`/api/study/${id}/wrong`);
    const raw = res.data ?? null;

    // 바디 없으면 null 그대로
    if (raw == null) return null;

    // 문자열 응답이면 표준 형태로 감싸서 반환
    if (typeof raw === "string") {
      return { wordId: id, status: normalizeStudyStatus(raw) };
    }

    // JSON 응답
    const data = raw;
    return {
      ...data,
      status: normalizeStudyStatus(pickStatusFromResponse(data, "wrong")),
    };
  } catch (e) {
    console.error("recordStudyWrong error:", e.response?.data || e);
    throw e;
  }
};
