// src/api/dashboardApi.js
import httpClient from "./httpClient";

const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true";

/** 🔹 MOCK: 오늘의 목표 */
const mockGetDailyGoal = () => ({
  nickname: "홍길동",
  dailyGoal: 50,
  todayProgress: 12,
  percentage: 24,
});

/** 🔹 MOCK: 전체 학습 통계 */
const mockGetDashboardStats = () => ({
  totalLearnedWords: 1250,
  wrongWords: 10,
  streakDays: 5,
});

/** 🔹 MOCK: 최근 7일 학습량 */
const mockGetWeeklyStudy = () => [
  { date: "2025-11-26", learnedCount: 15, wrongCount: 2 },
  { date: "2025-11-27", learnedCount: 20, wrongCount: 5 },
  { date: "2025-11-28", learnedCount: 10, wrongCount: 0 },
  { date: "2025-11-29", learnedCount: 30, wrongCount: 1 },
  { date: "2025-11-30", learnedCount: 25, wrongCount: 4 },
  { date: "2025-12-01", learnedCount: 12, wrongCount: 3 },
  { date: "2025-12-02", learnedCount: 18, wrongCount: 2 },
];

/** 🔹 MOCK: 오답 TOP 5 */
const mockGetWrongTop5 = () => [
  { wordId: 1, word: "Coffee", meaning: "커피", count: 5 },
  { wordId: 2, word: "Resilience", meaning: "회복탄력성", count: 4 },
  { wordId: 3, word: "Ambiguous", meaning: "모호한", count: 3 },
  { wordId: 4, word: "Strategy", meaning: "전략", count: 3 },
  { wordId: 5, word: "Implement", meaning: "실행하다", count: 3 },
];

/**
 * 오늘의 목표(하루 목표 단어 수, 오늘 학습량, 달성률)
 * GET /api/dashboard/daily-goal
 */
export const getDailyGoal = async () => {
  if (USE_MOCK) {
    return mockGetDailyGoal();
  }

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
  if (USE_MOCK) {
    return mockGetDashboardStats();
  }

  const res = await httpClient.get("/api/dashboard/stats");
  const d = res.data || {};

  return {
    // 누적 학습 단어 수: completedWords 기준
    totalLearnedWords: d.totalLearnedWords ?? d.completedWords ?? 0,
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
  if (USE_MOCK) {
    return mockGetWeeklyStudy();
  }

  const res = await httpClient.get("/api/dashboard/weekly");
  const data = res.data;

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
  if (USE_MOCK) {
    return mockGetWrongTop5();
  }

  const res = await httpClient.get("/api/dashboard/wrong/top5", {
    params: { days },
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
