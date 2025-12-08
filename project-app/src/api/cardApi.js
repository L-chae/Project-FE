// src/api/cardApi.js
import httpClient from "./httpClient";

const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true";

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/* -----------------------
 * 목업 데이터 정의 (카드 학습용)
 * --------------------- */
const MOCK_CARD_ITEMS = [
  {
    id: 1,
    wordId: 1001,
    frontText: "abandon",
    backText: "버리다, 포기하다",
  },
  {
    id: 2,
    wordId: 1002,
    frontText: "reluctant",
    backText: "마지못해 하는, 내키지 않는",
  },
  {
    id: 3,
    wordId: 1003,
    frontText: "significant",
    backText: "중요한, 의미 있는",
  },
  {
    id: 4,
    wordId: 1004,
    frontText: "comprehensive",
    backText: "포괄적인, 종합적인",
  },
];

/**
 * 카드 학습용 아이템 조회
 *
 * - 일반 모드(source !== 'wrong-note'):
 *    GET /api/words?page=0&size={limit}
 *
 * - 오답 모드(source === 'wrong-note'):
 *    GET /api/wrong
 */
export async function fetchCardItems({
  source,
  wordIds,
  clusterId, // 현재는 미사용
  limit = 20,
}) {
  if (USE_MOCK) {
    await delay(200);
    const sliced = MOCK_CARD_ITEMS.slice(0, limit || MOCK_CARD_ITEMS.length);
    return sliced;
  }
 // ✅ 오답 기반 카드 학습
  if (source === "wrong-note") {
    const res = await httpClient.get("/api/wrong");
    const data = res.data;

    const list = Array.isArray(data)
      ? data
      : Array.isArray(data.items)
      ? data.items
      : Array.isArray(data.content)
      ? data.content
      : [];

    // 1) 백엔드에서 받은 raw를 카드용으로 평탄화
    const normalized = list.map((raw, idx) => {
      // word가 객체(Word 엔티티)인 경우 처리
      const wordObj =
        raw.word && typeof raw.word === "object" && raw.word !== null
          ? raw.word
          : null;

      const wordId =
        raw.wordId ??
        wordObj?.wordId ??
        wordObj?.id ??
        raw.word_id ??
        null;

      const frontText =
        typeof raw.word === "string"
          ? raw.word
          : wordObj?.word ?? wordObj?.text ?? "";

      const backText =
        raw.meaning ??
        raw.meaningKo ??
        raw.korean ??
        wordObj?.meaning ??
        wordObj?.meaningKo ??
        wordObj?.exampleSentenceKo ??
        "";

      return {
        // 원본도 필요하면 보려고 raw 유지
        raw,
        id: raw.wrongWordId ?? raw.id ?? idx,
        wrongWordId: raw.wrongWordId ?? raw.id ?? idx,
        wordId,
        frontText,
        backText,
      };
    });

    // 2) 선택한 wordId 들만 필터링
    let filtered = normalized;

    if (Array.isArray(wordIds) && wordIds.length > 0) {
      const idSet = new Set(wordIds.map((n) => Number(n)));

      filtered = normalized.filter((item) =>
        idSet.has(Number(item.wordId))
      );
    }

    const sliced = filtered.slice(0, limit);

    // 3) 카드 컴포넌트에서 필요한 필드만 반환
    return sliced.map((item) => ({
      id: item.id,
      wordId: item.wordId,
      frontText: item.frontText,
      backText: item.backText,
    }));
  }

  // 일반 카드 학습: WORD 테이블 기반
  const res = await httpClient.get("/api/words", {
    params: {
      page: 0,
      size: limit,
    },
  });

  const data = res.data;

  const list = Array.isArray(data)
    ? data
    : Array.isArray(data.content)
    ? data.content
    : Array.isArray(data.items)
    ? data.items
    : [];

  let filtered = list;

  if (Array.isArray(wordIds) && wordIds.length > 0) {
    const idSet = new Set(wordIds);
    filtered = list.filter((w) => idSet.has(Number(w.wordId ?? w.id)));
  }

  const sliced = filtered.slice(0, limit);

  return sliced.map((w, idx) => ({
    id: w.wordId ?? w.id ?? idx,
    wordId: w.wordId ?? w.id,
    frontText: w.word ?? w.text ?? "",
    backText: w.meaning ?? w.meaningKo ?? "",
  }));
}

/**
 * 카드 학습 결과 제출 (알았다 / 몰랐다)
 * - result: 'known' | 'unknown'
 *
 * 서버 스펙:
 *  - known   -> POST /api/study/{wordId}/correct
 *  - unknown -> POST /api/study/{wordId}/wrong + POST /api/wrong/{wordId}
 */
export async function submitCardResult({ wordId, result }) {
  if (USE_MOCK) {
    await delay(120);

    const isUnknown = result === "unknown";
    const wrongAnswerLog = isUnknown
      ? {
          wrongWordId: Date.now(),
          wordId,
        }
      : null;

    return { wrongAnswerLog };
  }

  if (!wordId) {
    throw new Error("submitCardResult: wordId가 필요합니다.");
  }

  // unknown -> 학습 로그 '오답' + WRONG_ANSWER_LOG 추가
  if (result === "unknown") {
    try {
      await httpClient.post(`/api/study/${wordId}/wrong`);
    } catch (e) {
      console.error(
        "submitCardResult: study wrong 처리 실패",
        e.response?.data || e
      );
    }

    let wrongAnswerLog = null;
    try {
      const res = await httpClient.post(`/api/wrong/${wordId}`);
      wrongAnswerLog = res.data ?? null;
    } catch (e) {
      console.error(
        "submitCardResult: wrong log 추가 실패",
        e.response?.data || e
      );
    }

    return { wrongAnswerLog };
  }

  // known -> 학습 로그 '정답' 처리
  try {
    await httpClient.post(`/api/study/${wordId}/correct`);
  } catch (e) {
    console.error(
      "submitCardResult: study correct 처리 실패",
      e.response?.data || e
    );
  }

  return { wrongAnswerLog: null };
}
