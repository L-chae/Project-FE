// src/api/learningApi.js

const BASE_URL = '/api';
const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/* 기본 HTTP 함수들 (실제 백엔드용) */
async function httpGet(path, params = {}) {
  const url = new URL(BASE_URL + path, window.location.origin);
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') {
      url.searchParams.append(k, v);
    }
  });

  const res = await fetch(url.toString(), {
    credentials: 'include',
  });
  if (!res.ok) throw new Error(`GET ${path} failed`);
  return res.json();
}

async function httpPost(path, body = {}) {
  const res = await fetch(BASE_URL + path, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`POST ${path} failed`);
  return res.json();
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
      { id: '1-A', label: 'A', text: '버리다', isCorrect: true },
      { id: '1-B', label: 'B', text: '축하하다', isCorrect: false },
      { id: '1-C', label: 'C', text: '고민하다', isCorrect: false },
      { id: '1-D', label: 'D', text: '준비하다', isCorrect: false },
    ],
    explanation: "'abandon'은 '버리다, 포기하다'라는 뜻이다.",
  },
  {
    id: 2,
    wordId: 1002,
    title: "다음 중 'reluctant'의 뜻으로 가장 알맞은 것은?",
    description: "",
    choices: [
      { id: '2-A', label: 'A', text: '마지못해 하는', isCorrect: true },
      { id: '2-B', label: 'B', text: '열정적인', isCorrect: false },
      { id: '2-C', label: 'C', text: '신중한', isCorrect: false },
      { id: '2-D', label: 'D', text: '자주 있는', isCorrect: false },
    ],
    explanation: "'reluctant'은 '내키지 않는, 마지못해 하는'이라는 의미.",
  },
  {
    id: 3,
    wordId: 1003,
    title: "다음 중 'significant'의 뜻으로 가장 알맞은 것은?",
    description: "",
    choices: [
      { id: '3-A', label: 'A', text: '중요한', isCorrect: true },
      { id: '3-B', label: 'B', text: '사소한', isCorrect: false },
      { id: '3-C', label: 'C', text: '우연한', isCorrect: false },
      { id: '3-D', label: 'D', text: '불가능한', isCorrect: false },
    ],
    explanation: "'significant'은 '중요한, 의미 있는'이라는 뜻.",
  },
];

// 카드 학습 목업
const MOCK_CARD_ITEMS = [
  {
    id: 1,
    wordId: 1001,
    frontText: 'abandon',
    backText: '버리다, 포기하다',
  },
  {
    id: 2,
    wordId: 1002,
    frontText: 'reluctant',
    backText: '마지못해 하는, 내키지 않는',
  },
  {
    id: 3,
    wordId: 1003,
    frontText: 'significant',
    backText: '중요한, 의미 있는',
  },
  {
    id: 4,
    wordId: 1004,
    frontText: 'comprehensive',
    backText: '포괄적인, 종합적인',
  },
];

// 오답 노트 목록 목업
const MOCK_WRONG_NOTES = [
  {
    wrongWordId: 9001,
    wordId: 1001,
    word: 'abandon',
    meaning: '버리다, 포기하다',
    lastWrongAt: '2025-11-25 13:20',
    totalCorrect: 1,
    totalWrong: 3,
    status: 'pending',
    tag: 'quiz',
    isUsedInStory: 'N',
  },
  {
    wrongWordId: 9002,
    wordId: 1002,
    word: 'reluctant',
    meaning: '마지못해 하는',
    lastWrongAt: '2025-11-26 09:42',
    totalCorrect: 0,
    totalWrong: 2,
    status: 'pending',
    tag: 'card',
    isUsedInStory: 'Y',
  },
  {
    wrongWordId: 9003,
    wordId: 1003,
    word: 'significant',
    meaning: '중요한',
    lastWrongAt: '2025-11-26 21:10',
    totalCorrect: 2,
    totalWrong: 4,
    status: 'review',
    tag: 'quiz',
    isUsedInStory: 'N',
  },
];

/* -----------------------
 * 공개 API 함수들
 * --------------------- */

/**
 * 객관식 퀴즈 문제 조회
 */
export async function fetchMcqQuestions({ source, wordIds, clusterId, limit }) {
  if (USE_MOCK) {
    await delay(200);

    // 간단하게 limit 만큼 잘라서 반환
    const sliced = MOCK_MCQ_QUESTIONS.slice(0, limit || MOCK_MCQ_QUESTIONS.length);
    return sliced;
  }

  return httpGet('/learning/quiz/mcq', {
    source,
    wordIds: wordIds?.join(','),
    clusterId,
    limit,
  });
}

/**
 * 객관식 답안 제출
 * - 서버에서는 STUDY_LOG / WRONG_ANSWER_LOG 반영 + 정오답 반환
 * - 목업에서는 로컬 데이터 기준으로 정오답 판단
 */
export async function submitMcqAnswer({ questionId, choiceId }) {
  if (USE_MOCK) {
    await delay(150);
    const q = MOCK_MCQ_QUESTIONS.find((q) => q.id === questionId);
    const correctChoice = q?.choices.find((c) => c.isCorrect);
    const isCorrect = !!correctChoice && correctChoice.id === choiceId;

    // QuizPage에서 wrongWordId만 쓰고 있으므로 최소 필드만 채움
    const wrongAnswerLog = !isCorrect
      ? {
          wrongWordId: Date.now(), // 대충 유니크한 값
          wordId: q?.wordId,
        }
      : null;

    return { isCorrect, wrongAnswerLog };
  }

  return httpPost('/learning/quiz/mcq/answer', {
    questionId,
    choiceId,
  });
}

/**
 * 카드 학습용 아이템 조회
 */
export async function fetchCardItems({ source, wordIds, clusterId, limit }) {
  if (USE_MOCK) {
    await delay(200);
    const sliced = MOCK_CARD_ITEMS.slice(0, limit || MOCK_CARD_ITEMS.length);
    return sliced;
  }

  return httpGet('/learning/quiz/card', {
    source,
    wordIds: wordIds?.join(','),
    clusterId,
    limit,
  });
}

/**
 * 카드 학습 결과 제출 (알았다 / 몰랐다)
 * - result: 'known' | 'unknown'
 */
export async function submitCardResult({ wordId, result }) {
  if (USE_MOCK) {
    await delay(120);

    const isUnknown = result === 'unknown';
    const wrongAnswerLog = isUnknown
      ? {
          wrongWordId: Date.now(),
          wordId,
        }
      : null;

    return { wrongAnswerLog };
  }

  return httpPost('/learning/quiz/card/result', {
    wordId,
    result,
  });
}

/**
 * 오답 노트 목록 조회
 * filters: { fromDate, toDate, tag, isUsedInStory, page, pageSize }
 */
export async function fetchWrongNotes(filters) {
  if (USE_MOCK) {
    await delay(200);

    const page = Number(filters.page || 1);
    const pageSize = Number(filters.pageSize || 20);

    // 여기서는 필터 무시하고 전부 반환 (필요하면 tag/fromDate 등 조건 추가)
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

  return httpGet('/learning/wrong-notes', filters);
}
