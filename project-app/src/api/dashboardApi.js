// src/api/dashboardApi.js
import httpClient from "./httpClient";

/**
 * 오늘의 목표(하루 목표 단어 수, 오늘 학습량, 달성률)
 * GET /api/dashboard/daily-goal
 */
export const getDailyGoal = async () => {
  const res = await httpClient.get("/api/dashboard/daily-goal");
  const data = res.data || {};

  return {
    nickname: data.nickname ?? null,
    dailyGoal: data.dailyGoal ?? 0,
    todayProgress: data.todayProgress ?? data.completedToday ?? 0,
    percentage: data.percentage ?? data.progressRate ?? 0,
  };
};

/**
 * 전체 학습 통계
 * GET /api/dashboard/stats
 */
export const getDashboardStats = async () => {
  const res = await httpClient.get("/api/dashboard/stats");
  const d = res.data || {};

  return {
    // 누적 학습 단어 수: completedWords 기준
    totalLearnedWords: d.totalLearnedWords ?? d.completedWords ?? 0,

    // 즐겨찾기 단어 수
    favoriteWords: d.favoriteWords ?? 0,

    // 오답 수
    wrongWords: d.wrongWords ?? d.wrongAnswers ?? 0,

    // 연속 학습일
    streakDays: d.streakDays ?? d.streak ?? 0,
  };
};

/**
 * 최근 7일 학습량
 * GET /api/dashboard/weekly
 */
export const getWeeklyStudy = async () => {
  const res = await httpClient.get("/api/dashboard/weekly");
  const data = res.data;

  // 배열 또는 { items: [...] } 둘 다 대응
  const rawWeekly = Array.isArray(data) ? data : data?.items || [];

  return rawWeekly.map((d) => ({
    date: d.date || d.day || d.baseDate,
    learnedCount: d.learnedCount ?? d.studyCount ?? d.count ?? 0,
    wrongCount: d.wrongCount ?? d.incorrectCount ?? 0,
  }));
};

/**
 * 오답 단어 TOP 5
 * GET /api/dashboard/wrong/top5?days={days}
 */
export const getWrongTop5 = async (days = 7) => {
  const res = await httpClient.get("/api/dashboard/wrong/top5", {
    params: { days }, // ?days=7 형태로 전송
  });

  const arr = res.data || [];
  const list = Array.isArray(arr) ? arr : arr.items || [];

  return list.map((item) => ({
    wordId: item.wordId ?? item.id ?? null,
    word: item.word ?? "",
    meaning: item.meaning ?? "",
    count: item.count ?? item.wrongCount ?? 0,
  }));
};
