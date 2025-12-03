// src/api/wordApi.js
import httpClient from "./httpClient";

const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true";

// ----------------------
// Mock 데이터
// ----------------------
let mockWordList = [
  {
    wordId: 1,
    word: "Coffee",
    meaning: "커피",
    partOfSpeech: "Noun",
    domain: "Daily Life",
    category: "Daily Life",
    level: 1,
    isFavorite: false,
    isCompleted: false,
    exampleSentenceEn: "I drink coffee every morning.",
    exampleSentenceKo: "나는 매일 아침 커피를 마신다.",
  },
  {
    wordId: 2,
    word: "Negotiate",
    meaning: "협상하다",
    partOfSpeech: "Verb",
    domain: "Business",
    category: "Business",
    level: 3,
    isFavorite: true,
    isCompleted: false,
    exampleSentenceEn: "We need to negotiate a better price.",
    exampleSentenceKo: "우리는 더 나은 가격을 협상해야 한다.",
  },
  // ... 나머지 mock 그대로
];

const mockDelay = (result, ms = 200) =>
  new Promise((resolve) => setTimeout(() => resolve(result), ms));

// -----------------------------------------------------
// 공통 매핑: 백엔드/Mock → 프론트에서 쓰기 편한 형태
// -----------------------------------------------------
const mapWordFromApi = (w) => {
  const levelValue =
    typeof w.level === "number"
      ? w.level
      : typeof w.wordLevel === "number"
      ? w.wordLevel
      : null;

  const exampleSentence =
    typeof w.exampleSentence === "string" && w.exampleSentence.length > 0
      ? w.exampleSentence
      : w.exampleSentenceEn || "";

  return {
    wordId: w.wordId,
    word: w.word,
    meaning: w.meaning,
    partOfSpeech: w.partOfSpeech,
     domain: w.domain || w.category || null,
    category: w.category,
    level: levelValue,
    isFavorite: !!w.isFavorite,
    isCompleted: !!w.isCompleted,
    exampleSentence,
    exampleSentenceEn: w.exampleSentenceEn || exampleSentence || "",
    exampleSentenceKo: w.exampleSentenceKo || "",
  };
};

// =====================================================
// 1. 단어 목록 조회 (페이징)
//    GET /api/words?page=0&size=20
// =====================================================
export const getWordList = async (page = 0, size = 100) => {
  if (USE_MOCK) {
    const start = page * size;
    const end = start + size;
    const slice = mockWordList.slice(start, end);
    const content = slice.map(mapWordFromApi);

    return mockDelay({
      content,
      totalPages: Math.max(1, Math.ceil(mockWordList.length / size)),
      totalElements: mockWordList.length,
      page,
      size,
    });
  }

  const res = await httpClient.get("/api/words", {
    params: { page, size },
  });

  const data = res.data;
  const content = (data.content || []).map(mapWordFromApi);

  return {
    ...data,
    content,
  };
};

// =====================================================
// 2. 오늘의 단어 (단일 객체)
//    GET /api/words/today
// =====================================================
export const getTodayWord = async () => {
  if (USE_MOCK) {
    // "오늘의 단어 1개" 기준으로 통일
    const first = mockWordList[0] || mockWordList[0];
    return mockDelay(mapWordFromApi(first));
  }

  const res = await httpClient.get("/api/words/today");
  return mapWordFromApi(res.data);
};

// =====================================================
// 3. 단어 검색
//    GET /api/words/search?keyword=app&page=0&size=20
// =====================================================
export const searchWords = async (keyword, page = 0, size = 20) => {
  if (USE_MOCK) {
    const lowered = String(keyword || "").toLowerCase();
    const filtered = mockWordList.filter(
      (w) =>
        w.word.toLowerCase().includes(lowered) ||
        w.meaning.toLowerCase().includes(lowered)
    );

    const start = page * size;
    const end = start + size;
    const slice = filtered.slice(start, end);
    const content = slice.map(mapWordFromApi);

    return mockDelay({
      content,
      totalPages: Math.max(1, Math.ceil(filtered.length / size)),
      totalElements: filtered.length,
      page,
      size,
    });
  }

  const res = await httpClient.get("/api/words/search", {
    params: { keyword, page, size },
  });

  const data = res.data;
  const content = (data.content || []).map(mapWordFromApi);

  return {
    ...data,
    content,
  };
};

// =====================================================
// 4. 필터 검색
//    GET /api/words/filter?category=Daily&level=1&partOfSpeech=adj
// =====================================================
export const filterWords = async ({
  category,
  level,
  partOfSpeech,
  page = 0,
  size = 20,
}) => {
  if (USE_MOCK) {
    let filtered = [...mockWordList];

    if (category) {
      filtered = filtered.filter((w) => w.category === category);
    }
    if (level) {
      filtered = filtered.filter(
        (w) => Number(w.level) === Number(level)
      );
    }
    if (partOfSpeech) {
      const lowered = partOfSpeech.toLowerCase();
      filtered = filtered.filter(
        (w) => w.partOfSpeech?.toLowerCase() === lowered
      );
    }

    const start = page * size;
    const end = start + size;
    const slice = filtered.slice(start, end);
    const content = slice.map(mapWordFromApi);

    return mockDelay({
      content,
      totalPages: Math.max(1, Math.ceil(filtered.length / size)),
      totalElements: filtered.length,
      page,
      size,
    });
  }

  const res = await httpClient.get("/api/words/filter", {
    params: { category, level, partOfSpeech, page, size },
  });

  const data = res.data;
  const content = (data.content || []).map(mapWordFromApi);

  return {
    ...data,
    content,
  };
};

// =====================================================
// 5. 즐겨찾기 / 완료 관련 APIs (그대로 사용)
// =====================================================
export const addFavorite = async (wordId) => {
  if (USE_MOCK) {
    mockWordList = mockWordList.map((w) =>
      w.wordId === wordId ? { ...w, isFavorite: true } : w
    );
    return mockDelay({});
  }

  const res = await httpClient.post(`/api/favorites/${wordId}`);
  return res.data;
};

export const removeFavorite = async (wordId) => {
  if (USE_MOCK) {
    mockWordList = mockWordList.map((w) =>
      w.wordId === wordId ? { ...w, isFavorite: false } : w
    );
    return mockDelay({});
  }

  const res = await httpClient.delete(`/api/favorites/${wordId}`);
  return res.data;
};

export const getFavoriteList = async () => {
  if (USE_MOCK) {
    const favorites = mockWordList
      .filter((w) => w.isFavorite)
      .map(mapWordFromApi);
    return mockDelay(favorites);
  }

  const res = await httpClient.get("/api/favorites");
  return res.data;
};

export const toggleProgress = async (wordId, isCompleted) => {
  if (USE_MOCK) {
    mockWordList = mockWordList.map((w) =>
      w.wordId === wordId ? { ...w, isCompleted: !w.isCompleted } : w
    );
    return mockDelay({});
  }

  if (!isCompleted) {
    const res = await httpClient.post(`/api/completed/${wordId}`);
    return res.data;
  }

  const res = await httpClient.delete(`/api/completed/${wordId}`);
  return res.data;
};

export const getCompletedList = async () => {
  if (USE_MOCK) {
    const completed = mockWordList
      .filter((w) => w.isCompleted)
      .map(mapWordFromApi);
    return mockDelay(completed);
  }

  const res = await httpClient.get("/api/completed");
  return res.data;
};

export const getCompletedStatus = async (wordId) => {
  if (USE_MOCK) {
    const target = mockWordList.find((w) => w.wordId === Number(wordId));
    return mockDelay({
      wordId,
      completed: target ? !!target.isCompleted : false,
    });
  }

  const res = await httpClient.get(`/api/completed/${wordId}/status`);
  return res.data;
};

// =====================================================
// 6. 단어 상세 조회
//    GET /api/words/detail/{wordId}
// =====================================================
export const getWordDetail = async (wordId) => {
  if (USE_MOCK) {
    const target = mockWordList.find(
      (w) => w.wordId === Number(wordId)
    );

    if (!target) {
      return mockDelay(
        mapWordFromApi({
          wordId,
          word: "Unknown",
          meaning: "등록되지 않은 단어입니다.",
          partOfSpeech: "Noun",
          domain: "Daily Life",
          category: "Daily Life",
          level: 1,
          isFavorite: false,
          isCompleted: false,
          exampleSentenceEn: "",
          exampleSentenceKo: "",
        })
      );
    }

    return mockDelay(mapWordFromApi(target));
  }

  const res = await httpClient.get(`/api/words/detail/${wordId}`);
  return mapWordFromApi(res.data);
};

// =====================================================
// 7. 테스트: 전체 단어 개수 (백엔드 test-count용)
//    GET /api/words/test-count
// =====================================================
export const getWordCount = async () => {
  if (USE_MOCK) {
    return mockDelay(mockWordList.length);
  }

  const res = await httpClient.get("/api/words/test-count");
  return res.data; // Long
};
