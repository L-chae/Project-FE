// src/api/wordClusterApi.js
import httpClient from "./httpClient";

const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true";

// --------------------------------------------------
// Mock: 연관 단어 초기 데이터
// (실제 서버 연동 시에는 제거 또는 응답 형태에 맞게 수정)
// --------------------------------------------------
const MOCK_CLUSTER_DATA = {
  similar: [
    { text: "Drink", level: 1, inMyList: false },
    { text: "Beverage", level: 2, inMyList: false },
    { text: "Espresso", level: 3, inMyList: true },
  ],
  opposite: [
    { text: "Refuse", level: 3, inMyList: false },
    { text: "Reject", level: 2, inMyList: false },
  ],
};

// 공통 빈 값
const EMPTY_CLUSTER = {
  similar: [],
  opposite: [],
};

export const getWordCluster = async (wordId) => {
  if (!wordId) return EMPTY_CLUSTER;

  if (USE_MOCK) {
    // 목업 모드: 임시 더미 데이터 반환
    return MOCK_CLUSTER_DATA;
  }

  // 실제 서버 연동 시 백엔드와 약속 필요:
  // 예: GET /api/words/{wordId}/cluster  → { similar: [], opposite: [] }
  const res = await httpClient.get(`/api/words/${wordId}/cluster`);
  const data = res.data || {};

  return {
    similar: Array.isArray(data.similar) ? data.similar : [],
    opposite: Array.isArray(data.opposite) ? data.opposite : [],
  };
};
