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

  // 질문 텍스트
  const question =
    raw.questionText ??
    raw.question ??
    raw.word ?? // word만 오는 경우에도 처리
    raw.prompt ??
    "질문 내용이 없습니다.";

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

  // 단어(영어)
  const word =
    typeof raw.word === "string" && raw.word.trim().length > 0
      ? raw.word.trim()
      : raw.baseWord ??
        raw.mainWord ??
        "";

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

  // 원본 필드는 유지하되, 정규화된 필드가 우선하도록 마지막에 덮어쓰기
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

  // 1) 배열로 바로 오는 경우
  if (Array.isArray(data)) {
    return data.map(normalizeQuizItem).filter(Boolean);
  }

  // 2) { questions: [...] } 형태
  if (Array.isArray(data.questions)) {
    return data.questions.map(normalizeQuizItem).filter(Boolean);
  }

  // 필요하면 여기서 { items: [...] } 등 추가 대응 가능
  return [];
};

// ============================================================
// [API 1] 퀴즈 데이터 가져오기 (GET /api/quiz)
//    프론트 파라미터: { source: 'quiz' | 'wrong-note', limit: number, level: string }
// ============================================================
export const fetchQuizzes = async (params) => {
  if (USE_MOCK) {
    return mockFetchQuizzes(params);
  }

  try {
    const mode = params.source === "wrong-note" ? "wrong" : "normal";

    const res = await httpClient.get("/api/quiz", {
      params: {
        mode,                // normal | wrong
        count: params.limit, // /api/quiz?mode=normal&count=10&level=1
        level: params.level,
      },
    });

    const list = normalizeQuizListResponse(res.data);

    const limit =
      typeof params.limit === "number"
        ? params.limit
        : Number(params.limit);

    return Number.isFinite(limit) && limit > 0
      ? list.slice(0, limit)
      : list;
  } catch (error) {
    console.error("Quiz Fetch Error:", error);
    throw error;
  }
};

// ============================================================
// [API 2] 퀴즈 결과 저장하기 (POST /api/quiz/result)
//    resultData: { score, total, mode, timestamp }
// ============================================================
export const submitQuizResult = async (resultData) => {
  if (USE_MOCK) {
    return mockSubmitResult(resultData);
  }

  try {
    const res = await httpClient.post("/api/quiz/result", resultData);
    return res.data;
  } catch (error) {
    console.error("Submit Result Error:", error);
    throw error;
  }
};

// ============================================================
// 🧪 MOCK DATA (VITE_USE_MOCK === "true" 일 때만 사용)
// ============================================================
const mockFetchQuizzes = (params) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const isWrongMode = params.source === "wrong-note";

      const mockData = isWrongMode
        ? [
            // 오답 다시 풀기용 데이터 (주황색 테마)
            {
              id: 101,
              word: "Abstract",
              meaningKo: "추상적인",
              partOfSpeech: "Adj",
              question: "[복습] 'Abstract'의 의미는?",
              options: ["구체적인", "추상적인", "단순한", "복잡한"],
              answer: 1,
            },
            {
              id: 102,
              word: "Yield",
              meaningKo: "굴복하다",
              partOfSpeech: "Verb",
              question: "[복습] 'Yield'의 뜻은?",
              options: ["굴복하다", "방패", "공격하다", "머무르다"],
              answer: 0,
            },
            {
              id: 103,
              word: "Candid",
              meaningKo: "솔직한",
              partOfSpeech: "Adj",
              question: "[복습] 'Candid'의 동의어는?",
              options: ["Frank", "Secret", "Shy", "Rude"],
              answer: 0,
            },
          ]
        : [
            // 정규 학습용 데이터 (보라색 테마)
            {
              id: 1,
              word: "Apple",
              meaningKo: "사과",
              partOfSpeech: "Noun",
              question: "'Apple'의 뜻은 무엇인가요?",
              options: ["포도", "사과", "바나나", "오렌지"],
              answer: 1,
            },
            {
              id: 2,
              word: "Happy",
              meaningKo: "행복한",
              partOfSpeech: "Adj",
              question: "'Happy'의 반대말은?",
              options: ["Sad", "Joyful", "Excited", "Glad"],
              answer: 0,
            },
          ];

      const limit = Number(params.limit) || mockData.length;
      resolve(mockData.slice(0, limit));
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
