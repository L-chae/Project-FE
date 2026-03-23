// src/api/wordApi.js
import httpClient from "./httpClient";
import { getWordDetailMockCase } from "../mocks/wordDetailMockCases";
import { mockWordList as _mockDataWordList } from "../mocks/mockData";

const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true";

// mockData.js와 동기화된 단어 목록 (VITE_USE_MOCK 경로에서 사용)
// 9000번대(wordDetailMockCases 전용)는 mockData.js에 이미 포함되어 있음
let mockWordList = [..._mockDataWordList];

const mockDelay = (result, ms = 200) =>
  new Promise((resolve) => setTimeout(() => resolve(result), ms));

/**
 * 품사 값 통일: DB / API 값 → 프론트 공통 포맷
 * - 소문자, 축약형 등 섞여 들어와도 UI에서는 Noun/Verb/Adj/Adv로 통일
 */
// src/api/wordApi.js
const normalizePartOfSpeech = (raw) => {
  if (!raw) return null;
  const v = String(raw).trim().toLowerCase();

  if (v === "noun" || v === "n") return "Noun";

  if (
    v === "verb" ||
    v === "v" ||
    v === "linking verb" ||
    v === "modal verb"
  ) {
    return "Verb";
  }

  if (v === "adjective" || v === "adj" || v === "adj.") return "Adjective";
  if (v === "adverb" || v === "adv" || v === "adv.") return "Adverb";

  // 그 외는 Title Case로
  return v.replace(/\b\w/g, (c) => c.toUpperCase());
};


/**
 * 공통 매핑: 백엔드/Mock → 프론트 공통 형태
 * - Word / Favorite / Completed 응답을 한 번에 처리
 */
const mapWordFromApi = (w) => {
  if (!w || typeof w !== "object") {
    console.error("mapWordFromApi: invalid data", w);
    return {
      id: null,
      wordId: null,
      word: "",
      meaning: "",
      partOfSpeech: null,
      category: null,
      level: 1,
      isFavorite: false,
      isCompleted: false,
      exampleSentence: "",
      exampleSentenceEn: "",
      exampleSentenceKo: "",
    };
  }

  // level / wordLevel 둘 다 대응
  let levelValue = null;
  if (typeof w.level === "number") {
    levelValue = w.level;
  } else if (w.level != null) {
    const n = Number(w.level);
    levelValue = Number.isNaN(n) ? null : n;
  } else if (typeof w.wordLevel === "number") {
    levelValue = w.wordLevel;
  } else if (w.wordLevel != null) {
    const n = Number(w.wordLevel);
    levelValue = Number.isNaN(n) ? null : n;
  }
  if (levelValue == null) levelValue = 1;

  const hasExampleSentence =
    typeof w.exampleSentence === "string" &&
    w.exampleSentence.trim().length > 0;

  const exampleSentence = hasExampleSentence
    ? w.exampleSentence
    : typeof w.exampleSentenceEn === "string"
    ? w.exampleSentenceEn
    : typeof w.exampleEn === "string"
    ? w.exampleEn
    : "";

  const id = w.id != null ? w.id : null;

  const wordId =
    w.wordId != null
      ? w.wordId
      : typeof w.id === "number"
      ? w.id
      : null;

  const rawPos = w.partOfSpeech ?? w.pos ?? null;

  const isFavorite =
    w.isFavorite != null ? w.isFavorite : w.favorite ?? false;

  let isCompleted = w.isCompleted;
  if (
    typeof isCompleted === "undefined" &&
    typeof w.learningStatus === "string"
  ) {
    isCompleted = w.learningStatus === "COMPLETED";
  }

  return {
    id,
    wordId,
    word: w.word || "",
    meaning: w.meaning || "",
    partOfSpeech: normalizePartOfSpeech(rawPos),
    category: w.category != null ? w.category : null,
    level: levelValue,
    isFavorite: !!isFavorite,
    isCompleted: !!isCompleted,
    exampleSentence,
    exampleSentenceEn:
      typeof w.exampleSentenceEn === "string"
        ? w.exampleSentenceEn
        : typeof w.exampleEn === "string"
        ? w.exampleEn
        : exampleSentence || "",
    exampleSentenceKo:
      typeof w.exampleSentenceKo === "string"
        ? w.exampleSentenceKo
        : typeof w.exampleKo === "string"
        ? w.exampleKo
        : "",
  };
};

// =====================================================
// 1. 단어 목록 조회 (페이징)
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

  const data = res.data || {};
  const rawContent = Array.isArray(data.content) ? data.content : [];
  const content = rawContent.map(mapWordFromApi);

  return {
    ...data,
    content,
  };
};

// =====================================================
// 1-1. 전체 단어 목록 (단어장용 /api/words/all)
// =====================================================
export const getAllWords = async () => {
  if (USE_MOCK) {
    // 목업에서는 전부 한 번에 반환
    const mapped = mockWordList.map(mapWordFromApi);
    return mockDelay(mapped);
  }

  const res = await httpClient.get("/api/words/all");
  const arr = Array.isArray(res.data) ? res.data : [];
  return arr.map(mapWordFromApi);
};

// =====================================================
// 2. 오늘의 단어
// =====================================================
export const getTodayWord = async () => {
  if (USE_MOCK) {
    const first = mockWordList[0];
    return mockDelay(mapWordFromApi(first));
  }

  const res = await httpClient.get("/api/words/today");
  return mapWordFromApi(res.data);
};

// =====================================================
// 3. 단어 검색
// =====================================================
export const searchWords = async (keyword, page = 0, size = 20) => {
  if (USE_MOCK) {
    const lowered = String(keyword || "").toLowerCase();
    const filtered = mockWordList.filter((w) => {
      const wordText = (w.word || "").toLowerCase();
      const meaningText = (w.meaning || "").toLowerCase();
      return (
        (lowered && wordText.includes(lowered)) ||
        (lowered && meaningText.includes(lowered))
      );
    });

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

  const data = res.data || {};
  const rawContent = Array.isArray(data.content) ? data.content : [];
  const content = rawContent.map(mapWordFromApi);

  return {
    ...data,
    content,
  };
};

// =====================================================
// 4. 필터 검색 (백엔드용, 필요시)
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

    if (category && category !== "All") {
      filtered = filtered.filter((w) => w.category === category);
    }
    if (level != null && level !== "" && level !== "All") {
      filtered = filtered.filter(
        (w) => Number(w.level) === Number(level)
      );
    }
    if (partOfSpeech && partOfSpeech !== "All") {
      const lowered = String(partOfSpeech).toLowerCase();
      filtered = filtered.filter((w) => {
        if (!w.partOfSpeech) return false;
        return String(w.partOfSpeech).toLowerCase() === lowered;
      });
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

  const data = res.data || {};
  const rawContent = Array.isArray(data.content) ? data.content : [];
  const content = rawContent.map(mapWordFromApi);

  return {
    ...data,
    content,
  };
};

// =====================================================
// 5. 즐겨찾기 관련
// =====================================================
export const addFavorite = async (wordId) => {
  if (USE_MOCK) {
    mockWordList = mockWordList.map((w) =>
      w.wordId === wordId ? { ...w, isFavorite: true } : w
    );
    return mockDelay(true);
  }

  if (wordId == null) {
    throw new Error("addFavorite: wordId가 없습니다.");
  }

  try {
    const res = await httpClient.post(`/api/favorites/${wordId}`, {});
    return res.status === 201 || res.status === 200;
  } catch (e) {
    const resp = e?.response;
    if (
      resp &&
      resp.status === 400 &&
      resp.data &&
      resp.data.message === "이미 즐겨찾기한 단어입니다."
    ) {
      console.info("이미 즐겨찾기된 단어, 성공으로 간주:", wordId);
      return true;
    }

    console.error("addFavorite error", e);
    return false;
  }
};

export const removeFavorite = async (wordId) => {
  if (USE_MOCK) {
    mockWordList = mockWordList.map((w) =>
      w.wordId === wordId ? { ...w, isFavorite: false } : w
    );
    return mockDelay(true);
  }

  if (wordId == null) {
    throw new Error("removeFavorite: wordId가 없습니다.");
  }

  try {
    const res = await httpClient.delete(`/api/favorites/${wordId}`);
    return res.status === 204 || res.status === 200;
  } catch (e) {
    const resp = e && e.response;

    if (resp && resp.status === 400) {
      console.info(
        "removeFavorite: 400 이지만 이미 해제된 상태로 간주합니다.",
        wordId,
        resp.data
      );
      return true;
    }

    console.error("removeFavorite error", e);
    return false;
  }
};

export const getFavoriteList = async () => {
  if (USE_MOCK) {
    const favorites = mockWordList
      .filter((w) => w.isFavorite)
      .map(mapWordFromApi);
    return mockDelay(favorites);
  }

  const res = await httpClient.get("/api/favorites");
  const arr = Array.isArray(res.data) ? res.data : [];

  return arr.map((raw) => {
    const mapped = mapWordFromApi(raw);
    return {
      ...mapped,
      isFavorite: true,
    };
  });
};

// =====================================================
// 6. 학습 완료 관련
// =====================================================
export const getCompletedList = async () => {
  if (USE_MOCK) {
    const completed = mockWordList
      .filter((w) => w.isCompleted)
      .map(mapWordFromApi);
    return mockDelay(completed);
  }

  const res = await httpClient.get("/api/completed");
  const arr = Array.isArray(res.data) ? res.data : [];

  return arr.map((raw) => {
    const mapped = mapWordFromApi(raw);
    return {
      ...mapped,
      isCompleted: true,
    };
  });
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
// 7. 단어 상세 조회
// =====================================================
export const getWordDetail = async (wordId) => {
  if (USE_MOCK) {
    const caseData = getWordDetailMockCase(wordId);
    if (caseData?.word) {
      return mockDelay(mapWordFromApi(caseData.word));
    }

    const target = mockWordList.find((w) => w.wordId === Number(wordId));

    if (!target) {
      return mockDelay(
        mapWordFromApi({
          wordId,
          word: "Unknown",
          meaning: "등록되지 않은 단어입니다.",
          partOfSpeech: "Noun",
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
// 8. 테스트: 전체 단어 개수
// =====================================================
export const getWordCount = async () => {
  if (USE_MOCK) {
    return mockDelay(mockWordList.length);
  }

  const res = await httpClient.get("/api/words/test-count");
  return res.data;
};

// =====================================================
// 9. 연관 단어(클러스터)에서 단어장에 추가 (Mock 전용) 
// =====================================================
export const addWordFromCluster = async ({ text, level = 1 }) => {
  if (USE_MOCK) {
    const exists = mockWordList.find(
      (w) => String(w.word).toLowerCase() === String(text).toLowerCase()
    );
    if (exists) {
      return mockDelay(mapWordFromApi(exists));
    }

    const lastId = mockWordList[mockWordList.length - 1]?.wordId || 0;
    const newId = lastId + 1;

    const newWord = {
      wordId: newId,
      word: text,
      meaning: `${text} (mock)`,
      partOfSpeech: "Noun",
      category: "Daily Life",
      level,
      isFavorite: false,
      isCompleted: false,
      exampleSentenceEn: "",
      exampleSentenceKo: "",
    };

    mockWordList = [...mockWordList, newWord];

    return mockDelay(mapWordFromApi(newWord));
  }

  const res = await httpClient.post("/api/words/from-cluster", { text, level });
  return mapWordFromApi(res.data);
};
// =====================================================
// 10. 단어별 학습 통계 조회
// =====================================================
export const getStudyLog = async (wordId) => {
  if (USE_MOCK) {
    const caseData = getWordDetailMockCase(wordId);
    if (caseData?.studyLog) {
      return mockDelay({
        wordId: Number(wordId),
        totalCorrect: Number(caseData.studyLog.totalCorrect ?? 0),
        totalWrong: Number(caseData.studyLog.totalWrong ?? 0),
        lastStudyAt: caseData.studyLog.lastStudyAt ?? null,
      });
    }

    return mockDelay({
      wordId: Number(wordId),
      totalCorrect: 0,
      totalWrong: 0,
      lastStudyAt: null,
    });
  }

  const res = await httpClient.get(`/api/study/${wordId}`);
  return res.data;
};
