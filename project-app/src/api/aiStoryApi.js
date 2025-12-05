// src/api/aiStoryApi.js
import httpClient from "./httpClient";

const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true";

const mockDelay = (result, ms = 800) =>
  new Promise((resolve) => setTimeout(() => resolve(result), ms));

/**
 * 1) AI 스토리 생성 (POST /api/ai/story)
 *    - USE_MOCK = true  → 프론트 목업으로만 동작
 *    - USE_MOCK = false → 실제 서버(/api/ai/story) 호출
 *
 * Request:
 *   { words: string[], difficulty: string, style: string }
 *
 * Response (예상):
 *   {
 *     storyEn: string,
 *     storyKo: string,
 *     usedWords?: (string | { text: string })[]
 *   }
 */
export const generateAiStory = async ({ words, difficulty, style }) => {
  if (!Array.isArray(words) || words.length === 0) {
    throw new Error("generateAiStory: words 배열이 비어 있습니다.");
  }

  if (USE_MOCK) {
    console.log("[Mock] AI 스토리 생성 요청:", { words, difficulty, style });

    const joined = words.join(", ");

    return mockDelay({
      success: true,
      message: "스토리 생성 성공(목업)",
      storyEn: `Once upon a time, ${joined} were used in a magical story.`,
      storyKo: `옛날 옛적에 ${joined}이(가) 마법 같은 이야기 속에서 사용되었습니다.`,
      usedWords: words.map((w) => ({ text: w })),
    });
  }

  // 실제 서버 호출
  const res = await httpClient.post("/api/ai/story", {
    words,
    difficulty,
    style,
  });

  return res.data;
};
