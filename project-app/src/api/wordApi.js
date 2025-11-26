import httpClient from "./httpClient";

const USE_MOCK = true;

// 1. 단어 목록 조회
export const getWordList = async (page = 1, size = 10) => {
  if (USE_MOCK) {
    return {
      content: [
        {
          wordId: 1,
          word: "Ephemeral",
          meaning: "수명이 짧은, 덧없는",
          partOfSpeech: "Adj",
          category: "General",
          level: 3,
          isFavorite: false, // ⭐ boolean으로 변경
          isCompleted: false,
          exampleSentence: "Fashions are ephemeral."
        },
        {
          wordId: 2,
          word: "Serendipity",
          meaning: "뜻밖의 행운",
          partOfSpeech: "Noun",
          category: "Literature",
          level: 2,
          isFavorite: true, // ⭐ boolean으로 변경
          isCompleted: true,
          exampleSentence: "Meeting her was pure serendipity."
        },
        {
          wordId: 3,
          word: "Algorithm",
          meaning: "알고리즘",
          partOfSpeech: "Noun",
          category: "IT",
          level: 2,
          isFavorite: true, // ⭐ boolean으로 변경
          isCompleted: false,
          exampleSentence: "Algorithms solve complex problems."
        }
      ],
      totalPages: 1,
      totalElements: 3
    };
  }
  
  const res = await httpClient.get(`/words?page=${page}&size=${size}`);
  return res.data;
};

// 2. 즐겨찾기 추가
export const addFavorite = async (wordId) => {
  if (USE_MOCK) return true;
  const res = await httpClient.post(`/favorite/${wordId}`);
  return res.data;
};

// 3. 즐겨찾기 삭제 (⭐ 중요: wordId로 삭제 요청)
export const removeFavorite = async (wordId) => {
  if (USE_MOCK) return true;
  // 백엔드에게 "나 이 단어(wordId) 즐겨찾기 뺄래" 라고 요청
  const res = await httpClient.delete(`/favorite/${wordId}`);
  return res.data;
};

// 4. 학습 상태 저장
export const toggleProgress = async (wordId) => {
  if (USE_MOCK) return true;
  const res = await httpClient.post(`/progress/${wordId}`);
  return res.data;
};

// 5. 단어 상세 조회
export const getWordDetail = async (wordId) => {
  if (USE_MOCK) {
    return {
      wordId: wordId,
      word: "Serendipity",
      meaning: "뜻밖의 행운",
      partOfSpeech: "Noun",
      category: "Literature",
      level: 2,
      isFavorite: true, // ⭐ boolean
      isCompleted: true,
      exampleSentence: "Meeting her was pure serendipity."
    };
  }
  const res = await httpClient.get(`/words/${wordId}`);
  return res.data;
};