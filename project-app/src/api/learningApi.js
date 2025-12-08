// src/api/learningApi.js
import httpClient from "./httpClient";

const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true";

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/* -----------------------
 * 목업 데이터 정의
 * --------------------- */

// 객관식 퀴즈 문제 목업
const MOCK_MCQ_QUESTIONS = [
  {
    id: 1,
    wordId: 1001,
    title: "다음 중 'abandon'의 뜻으로 가장 알맞은 것은?",
    description: "문장: He decided to abandon the project.",
    choices: [
      { id: "1-A", label: "A", text: "버리다", isCorrect: true },
      { id: "1-B", label: "B", text: "축하하다", isCorrect: false },
      { id: "1-C", label: "C", text: "고민하다", isCorrect: false },
      { id: "1-D", label: "D", text: "준비하다", isCorrect: false },
    ],
    explanation: "'abandon'은 '버리다, 포기하다'라는 뜻이다.",
  },
  {
    id: 2,
    wordId: 1002,
    title: "다음 중 'reluctant'의 뜻으로 가장 알맞은 것은?",
    description: "",
    choices: [
      { id: "2-A", label: "A", text: "마지못해 하는", isCorrect: true },
      { id: "2-B", label: "B", text: "열정적인", isCorrect: false },
      { id: "2-C", label: "C", text: "신중한", isCorrect: false },
      { id: "2-D", label: "D", text: "자주 있는", isCorrect: false },
    ],
    explanation: "'reluctant'은 '내키지 않는, 마지못해 하는'이라는 의미.",
  },
  {
    id: 3,
    wordId: 1003,
    title: "다음 중 'significant'의 뜻으로 가장 알맞은 것은?",
    description: "",
    choices: [
      { id: "3-A", label: "A", text: "중요한", isCorrect: true },
      { id: "3-B", label: "B", text: "사소한", isCorrect: false },
      { id: "3-C", label: "C", text: "우연한", isCorrect: false },
      { id: "3-D", label: "D", text: "불가능한", isCorrect: false },
    ],
    explanation: "'significant'은 '중요한, 의미 있는'이라는 뜻.",
  },
];

// 카드 학습 목업
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

// 오답 노트 목록 목업
const MOCK_WRONG_NOTES = [
  {
    wrongWordId: 9001,
    wordId: 1001,
    word: "abandon",
    meaning: "버리다, 포기하다",
    lastWrongAt: "2025-11-25 13:20",
    totalCorrect: 1,
    totalWrong: 3,
    status: "pending",
    tag: "quiz",
    isUsedInStory: "N",
  },
  {
    wrongWordId: 9002,
    wordId: 1002,
    word: "reluctant",
    meaning: "마지못해 하는",
    lastWrongAt: "2025-11-26 09:42",
    totalCorrect: 0,
    totalWrong: 2,
    status: "pending",
    tag: "card",
    isUsedInStory: "Y",
  },
  {
    wrongWordId: 9003,
    wordId: 1003,
    word: "significant",
    meaning: "중요한",
    lastWrongAt: "2025-11-26 21:10",
    totalCorrect: 2,
    totalWrong: 4,
    status: "review",
    tag: "quiz",
    isUsedInStory: "N",
  },
];

/* -----------------------
 * 공개 API 함수들
 * --------------------- */

/**
 * 객관식 퀴즈 문제 조회
 *
 * 백엔드 규격:
 *  - 일반 퀴즈: GET /api/quiz?mode=normal&limit={limit}
 *  - 오답 복습: GET /api/quiz?mode=wrong&limit={limit}
 *
 * Response 예시:
 *  [
 *    {
 *      "wordId": 21,
 *      "word": "coffee",
 *      "options": ["커피", "사과", "나무", "오렌지"],
 *      "answerIndex": 0
 *    }
 *  ]
 *
 * 프론트에서는 위 응답을 내부에서 쓰기 좋은 형태로 변환해서 리턴한다.
 */
export async function fetchMcqQuestions({
  source,
  wordIds,
  clusterId,
  limit,
  mode,
}) {
  if (USE_MOCK) {
    await delay(200);
    const sliced = MOCK_MCQ_QUESTIONS.slice(
      0,
      limit || MOCK_MCQ_QUESTIONS.length
    );
    return sliced;
  }

  const quizMode =
    mode ||
    (source === "wrong-note" || source === "wrong" ? "wrong" : "normal");

  const params = { mode: quizMode };
  if (typeof limit === "number") {
    params.limit = limit;
  }

  // 필요 시 wordIds, clusterId를 쿼리로 추가할 수 있음
  // (백엔드와 합의 후 주석 해제)
  // if (Array.isArray(wordIds) && wordIds.length > 0) {
  //   params.wordIds = wordIds.join(",");
  // }
  // if (clusterId) {
  //   params.clusterId = clusterId;
  // }

  const res = await httpClient.get("/api/quiz", { params });
  const data = res.data;

  const list = Array.isArray(data)
    ? data
    : Array.isArray(data.items)
    ? data.items
    : Array.isArray(data.content)
    ? data.content
    : [];

  // 백엔드 응답을 프론트 공통 형태로 정규화
  return list.map((raw, index) => {
    const id = raw.quizId ?? raw.id ?? raw.wordId ?? index;
    const wordId = raw.wordId ?? raw.id ?? null;

    const questionText =
      raw.word ?? raw.question ?? raw.questionText ?? "" /* 단어/지문 */;

    const options = Array.isArray(raw.options)
      ? raw.options
      : Array.isArray(raw.choices)
      ? raw.choices
      : [];

    const answerIndex =
      typeof raw.answerIndex === "number"
        ? raw.answerIndex
        : typeof raw.answer === "number"
        ? raw.answer
        : null;

    const choices = options.map((opt, i) => {
      const optText =
        typeof opt === "string"
          ? opt
          : typeof opt.text === "string"
          ? opt.text
          : String(opt);

      return {
        id: `${id}-${i}`, // 프론트 내부용 선택지 ID
        label: String.fromCharCode(65 + i), // A, B, C, ...
        text: optText,
        isCorrect: answerIndex === i,
      };
    });

    return {
      id,
      wordId,
      title: questionText,
      description: raw.description ?? "",
      choices,
      explanation: raw.explanation ?? "",
    };
  });
}

/**
 * 객관식 답안 제출
 *
 * 백엔드 규격(제안):
 *  - POST /api/quiz/result
 *
 * Request Body:
 *  {
 *    "mode": "normal" | "wrong",
 *    "wordId": number,
 *    "selectedIndex": number  // 사용자가 고른 보기 인덱스(0 기반)
 *  }
 *
 * Response:
 *  {
 *    "isCorrect": true,
 *    "wrongAnswerLog": {
 *      "wrongWordId": 9001,
 *      "wordId": 21
 *    }
 *  }
 *
 * 프론트에서 사용하는 파라미터:
 *  - wordId: 퀴즈 대상 단어 ID
 *  - selectedIndex: 사용자가 선택한 보기 인덱스(0 기반)
 *  - mode: "normal" | "wrong" (옵션, 기본 "normal")
 */
export async function submitMcqAnswer({
  wordId,
  selectedIndex,
  mode = "normal",
}) {
  if (USE_MOCK) {
    await delay(150);

    const q = MOCK_MCQ_QUESTIONS.find((item) => item.wordId === wordId);
    if (!q) {
      return { isCorrect: false, wrongAnswerLog: null };
    }

    const correctIndex = q.choices.findIndex((c) => c.isCorrect);
    const isCorrect =
      typeof selectedIndex === "number" && selectedIndex === correctIndex;

    const wrongAnswerLog = !isCorrect
      ? {
          wrongWordId: Date.now(),
          wordId: q.wordId,
        }
      : null;

    return { isCorrect, wrongAnswerLog };
  }

  if (typeof wordId === "undefined" || typeof selectedIndex === "undefined") {
    throw new Error("submitMcqAnswer: wordId, selectedIndex가 필요합니다.");
  }

  const payload = {
    mode,
    wordId,
    selectedIndex,
  };

  const res = await httpClient.post("/api/quiz/result", payload);
  const data = res.data ?? {};

  return {
    isCorrect: !!data.isCorrect,
    wrongAnswerLog: data.wrongAnswerLog ?? null,
  };
}

/**
 * 카드 학습용 아이템 조회
 *
 * - 일반 모드(source !== 'wrong-note'):
 *    GET /api/words?page=0&size={limit}
 *    응답: 배열 또는 { content: [...] } 형태라고 가정
 *
 * - 오답 모드(source === 'wrong-note'):
 *    GET /api/wrong
 *    응답: 배열 또는 { items: [...] } 형태라고 가정
 */
export async function fetchCardItems({
  source,
  wordIds,
  clusterId,
  limit = 20,
}) {
  if (USE_MOCK) {
    await delay(200);
    const sliced = MOCK_CARD_ITEMS.slice(0, limit || MOCK_CARD_ITEMS.length);
    return sliced;
  }

  // 오답 기반 카드 학습
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

    let filtered = list;

    // 선택된 wrongWordIds 기반으로 필터링하는 경우를 대비해 wordIds를 필터로 사용
    if (Array.isArray(wordIds) && wordIds.length > 0) {
      const idSet = new Set(wordIds);
      filtered = list.filter((item) =>
        idSet.has(Number(item.wordId ?? item.word_id))
      );
    }

    const sliced = filtered.slice(0, limit);

    return sliced.map((item, idx) => ({
      id: item.wrongWordId ?? item.id ?? idx,
      wordId: item.wordId ?? item.word_id,
      frontText: item.word ?? item.wordText ?? "",
      backText:
        item.meaning ?? item.meaningKo ?? item.korean ?? item.translate ?? "",
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
 * 실제 서버 연동 시:
 *  - known  -> POST /api/study/{wordId}/correct
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
      // STUDY_LOG 오답 처리
      await httpClient.post(`/api/study/${wordId}/wrong`);
    } catch (e) {
      console.error("submitCardResult: study wrong 처리 실패", e);
    }

    let wrongAnswerLog = null;
    try {
      // WRONG_ANSWER_LOG 추가
      const res = await httpClient.post(`/api/wrong/${wordId}`);
      wrongAnswerLog = res.data ?? null;
    } catch (e) {
      console.error("submitCardResult: wrong log 추가 실패", e);
    }

    return { wrongAnswerLog };
  }

  // known -> 학습 로그 '정답' 처리
  try {
    await httpClient.post(`/api/study/${wordId}/correct`);
  } catch (e) {
    console.error("submitCardResult: study correct 처리 실패", e);
  }

  // 필요하면 완료 단어 처리도 추가 가능:
  // await httpClient.post(`/api/completed/${wordId}`);

  return { wrongAnswerLog: null };
}

/**
 * 오답 노트 목록 조회
 * filters: { fromDate, toDate, tag, isUsedInStory, page, pageSize }
 *
 * 백엔드:
 *   GET /api/wrong?fromDate=...&toDate=...&tag=...&isUsedInStory=...
 *   - 배열 또는 { items: [...], total: number } 형태라고 가정
 *
 * 서버에서 페이지네이션이 없으면
 *   FE에서 page/pageSize로 잘라서 사용.
 */
export async function fetchWrongNotes(filters = {}) {
  if (USE_MOCK) {
    await delay(200);

    const page = Number(filters.page || 1);
    const pageSize = Number(filters.pageSize || 20);

    const start = (page - 1) * pageSize;
    const end = start + pageSize;

    const items = MOCK_WRONG_NOTES.slice(start, end);
    const total = MOCK_WRONG_NOTES.length;

    return {
      items,
      total,
      page,
      pageSize,
    };
  }

  const page = Number(filters.page || 1);
  const pageSize = Number(filters.pageSize || 20);

  const { fromDate, toDate, tag, isUsedInStory } = filters;

  const res = await httpClient.get("/api/wrong", {
    params: {
      fromDate,
      toDate,
      tag,
      isUsedInStory,
      // 서버에서 page/size를 쓰도록 맞출 수도 있음.
      // 서버에 아직 페이지네이션이 없다면 이 파라미터는 무시될 것.
    },
  });

  const data = res.data;

  // 서버가 페이지 구조를 주는 경우
  if (!Array.isArray(data)) {
    const list = Array.isArray(data.items)
      ? data.items
      : Array.isArray(data.content)
      ? data.content
      : [];
    const total =
      typeof data.totalElements === "number"
        ? data.totalElements
        : typeof data.total === "number"
        ? data.total
        : list.length;

    return {
      items: list,
      total,
      page: data.page ?? page,
      pageSize: data.pageSize ?? pageSize,
    };
  }

  // 서버가 그냥 배열만 주는 경우 → FE에서 페이지네이션
  const list = data;
  const total = list.length;
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const items = list.slice(start, end);

  return {
    items,
    total,
    page,
    pageSize,
  };
}
