// src/api/quizApi.js
import httpClient from "./httpClient";

const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true";

// --------------------------------------------------------
// 내부 유틸: 백엔드 응답을 프론트에서 쓰기 좋은 형태로 정규화
// 프론트가 기대하는 형태: { id, question, options: string[], answer: number }
// + 추가: word, meaning, meaningKo, partOfSpeech, level 등을 최대한 공통 필드로 맞춰줌
// --------------------------------------------------------
const normalizeQuizItem = (raw, index) => {
  if (!raw) return null;

  // id
  const id = raw.quizId ?? raw.id ?? raw.wordId ?? index ?? 0;

  // 단어(영어)
  const word =
    typeof raw.word === "string" && raw.word.trim().length > 0
      ? raw.word.trim()
      : raw.baseWord ?? raw.mainWord ?? "";

  // 질문 텍스트
  let question =
    raw.questionText ??
    raw.question ??
    raw.prompt ??
    null;

  // word만 오는 경우 기본 문구 생성
  if (!question) {
    if (word) {
      question = `'${word}'의 뜻으로 가장 알맞은 것은?`;
    } else {
      question = "질문 내용이 없습니다.";
    }
  }

  // 보기
  const optionsRaw = raw.options ?? raw.choices ?? [];
  const options = Array.isArray(optionsRaw) ? optionsRaw : [];

  // 정답 인덱스
  const rawAnswer =
    typeof raw.answerIndex === "number"
      ? raw.answerIndex
      : typeof raw.correctIndex === "number"
      ? raw.correctIndex
      : typeof raw.correctOptionIndex === "number"
      ? raw.correctOptionIndex
      : typeof raw.answer === "number"
      ? raw.answer
      : 0;

  const answer = Number.isFinite(rawAnswer) ? rawAnswer : 0;

  // 한글 뜻 / 의미 필드 정규화
  const meaningKoSource =
    raw.meaningKo ??
    raw.meaning_ko ??
    raw.korean ??
    (typeof raw.meaning === "string" ? raw.meaning : undefined);

  const meaningKo = typeof meaningKoSource === "string" ? meaningKoSource : "";
  const meaning =
    typeof raw.meaning === "string" && raw.meaning.trim().length > 0
      ? raw.meaning
      : meaningKo;

  // 품사
  const partOfSpeech =
    raw.partOfSpeech ??
    raw.pos ??
    raw.part_of_speech ??
    "";

  // 레벨
  const level =
    raw.level ??
    raw.wordLevel ??
    raw.difficulty ??
    raw.levelId ??
    null;

  return {
    ...raw,
    id,
    question,
    options,
    answer,
    word,
    meaning,
    meaningKo,
    partOfSpeech,
    level,
  };
};

const normalizeQuizListResponse = (data) => {
  if (!data) return [];

  if (Array.isArray(data)) {
    return data.map(normalizeQuizItem).filter(Boolean);
  }

  if (Array.isArray(data.questions)) {
    return data.questions.map(normalizeQuizItem).filter(Boolean);
  }

  if (Array.isArray(data.items)) {
    return data.items.map(normalizeQuizItem).filter(Boolean);
  }

  if (Array.isArray(data.content)) {
    return data.content.map(normalizeQuizItem).filter(Boolean);
  }

  return [];
};

// ============================================================
// [API 1] 퀴즈 데이터 가져오기 (GET /api/quiz)
//    프론트 파라미터:
//      { source: 'quiz' | 'wrong-note', limit: number, level: string|null, wordIds?: number[] }
// ============================================================
export const fetchQuizzes = async (params) => {
  const { source, limit, level, wordIds } = params;

  if (USE_MOCK) {
    return mockFetchQuizzes({ source, limit, wordIds });
  }

  try {
    const mode = source === "wrong-note" ? "wrong" : "normal";

    // level 정규화: "All"/"ALL" → "all"
    const normalizedLevel =
      typeof level === "string" ? level.trim().toLowerCase() : null;

    const query = {
      mode, // normal | wrong
    };

    const numericLimit =
      typeof limit === "number" ? limit : Number(limit);

    if (Number.isFinite(numericLimit) && numericLimit > 0) {
      // 백엔드: @RequestParam(required = false) Integer count
      query.count = numericLimit;
    }

    // all / null 이면 레벨 필터 안 보냄
    if (normalizedLevel && normalizedLevel !== "all") {
      query.level = normalizedLevel;
    }

    if (Array.isArray(wordIds) && wordIds.length > 0) {
      query.wordIds = wordIds.join(",");
    }

    const res = await httpClient.get("/api/quiz", {
      params: query,
    });

    const list = normalizeQuizListResponse(res.data);

    return Number.isFinite(numericLimit) && numericLimit > 0
      ? list.slice(0, numericLimit)
      : list;
  } catch (error) {
    console.error("Quiz Fetch Error:", error.response?.data || error);
    throw error;
  }
};

// ============================================================
// [API 2] 퀴즈 결과 저장하기 (POST /api/quiz/result)
//    payload: { mode: 'normal'|'wrong', answers: [{ wordId, correct }] }
// ============================================================
export const submitQuizResult = async (payload) => {
  if (USE_MOCK) {
    return mockSubmitResult(payload);
  }

  try {
    const res = await httpClient.post("/api/quiz/result", payload);
    return res.data;
  } catch (error) {
    console.error("Submit Result Error:", error.response?.data || error);
    throw error;
  }
};

// ============================================================
// 🧪 MOCK DATA (VITE_USE_MOCK === "true" 일 때만 사용)
// ============================================================
const mockFetchQuizzes = (params) => {
  const { source, limit, wordIds } = params || {};

  return new Promise((resolve) => {
    setTimeout(() => {
      const isWrongMode = source === "wrong-note";

      const mockData = isWrongMode
        ? [
            {
              id: 101,
              wordId: 101,
              word: "Abstract",
              meaningKo: "추상적인",
              partOfSpeech: "Adj",
              question: "[복습] 'Abstract'의 의미는?",
              options: ["구체적인", "추상적인", "단순한", "복잡한"],
              answerIndex: 1,
            },
            {
              id: 102,
              wordId: 102,
              word: "Yield",
              meaningKo: "굴복하다",
              partOfSpeech: "Verb",
              question: "[복습] 'Yield'의 뜻은?",
              options: ["굴복하다", "방패", "공격하다", "머무르다"],
              answerIndex: 0,
            },
          ]
        : [
            {
              id: 1,
              wordId: 1,
              word: "Apple",
              meaningKo: "사과",
              partOfSpeech: "Noun",
              question: "'Apple'의 뜻은 무엇인가요?",
              options: ["포도", "사과", "바나나", "오렌지"],
              answerIndex: 1,
            },
            {
              id: 2,
              wordId: 2,
              word: "Happy",
              meaningKo: "행복한",
              partOfSpeech: "Adj",
              question: "'Happy'의 반대말은?",
              options: ["Sad", "Joyful", "Excited", "Glad"],
              answerIndex: 0,
            },
          ];

      let list = mockData;

      if (Array.isArray(wordIds) && wordIds.length > 0) {
        const set = new Set(
          wordIds
            .map((n) => Number(n))
            .filter((n) => !Number.isNaN(n))
        );
        list = mockData.filter((item) => set.has(Number(item.wordId)));
      }

      const numericLimit =
        typeof limit === "number" ? limit : Number(limit);

      const normalized = normalizeQuizListResponse(list);

      const sliced =
        Number.isFinite(numericLimit) && numericLimit > 0
          ? normalized.slice(0, numericLimit)
          : normalized;

      resolve(sliced);
    }, 600);
  });
};

const mockSubmitResult = (data) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log("📝 [Mock API] 결과 데이터 전송됨:", data);
      resolve({ success: true, message: "결과가 저장되었습니다. (MOCK)" });
    }, 500);
  });
};
