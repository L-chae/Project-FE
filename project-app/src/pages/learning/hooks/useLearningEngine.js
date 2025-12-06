// src/pages/learning/hooks/useLearningEngine.js
import { useEffect, useState, useCallback } from 'react';
import {
  fetchMcqQuestions,
  submitMcqAnswer,
  fetchCardItems,
  submitCardResult,
} from './../../../api/learningApi';

// mode: 'mcq' | 'card'
export function useLearningEngine({ mode, source, wordIds, clusterId, limit = 10 }) {
  const [items, setItems] = useState([]);       // mcq: questions, card: cards
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  // mcq 전용
  const [selectedChoiceId, setSelectedChoiceId] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(null);
  const [score, setScore] = useState(0);
  const [wrongAnswerLogs, setWrongAnswerLogs] = useState([]);

  // card 전용
  const [isFlipped, setIsFlipped] = useState(false);
  const [knownCount, setKnownCount] = useState(0);
  const [unknownCount, setUnknownCount] = useState(0);

  // 카드 학습 결과용: 이번 세션에서 "모르겠다"로 찍힌 단어 목록
  const [unknownWords, setUnknownWords] = useState([]);

  // 공통 로딩
  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      setIsFinished(false);
      setCurrentIndex(0);
      setSelectedChoiceId(null);
      setIsAnswered(false);
      setIsCorrect(null);
      setScore(0);
      setWrongAnswerLogs([]);
      setIsFlipped(false);
      setKnownCount(0);
      setUnknownCount(0);
      setUnknownWords([]); // 새 세션 시작 시 초기화

      try {
        let data;
        if (mode === 'mcq') {
          data = await fetchMcqQuestions({ source, wordIds, clusterId, limit });
        } else {
          data = await fetchCardItems({ source, wordIds, clusterId, limit });
        }
        if (cancelled) return;
        setItems(data || []);
      } catch (e) {
        if (cancelled) return;
        console.error(e);
        setError(e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [mode, source, clusterId, limit, JSON.stringify(wordIds)]);

  const total = items.length;
  const current = items[currentIndex] || null;
  const progress = total > 0 ? (currentIndex + (isFinished ? 1 : 0)) / total : 0;

  // 객관식 답변
  const answerQuestion = useCallback(
    async (choiceId) => {
      if (mode !== 'mcq' || !current || isAnswered) return;
      setSelectedChoiceId(choiceId);
      setIsAnswered(true);

      try {
        const res = await submitMcqAnswer({
          questionId: current.id,
          choiceId,
        });

        const { isCorrect: serverCorrect, wrongAnswerLog } = res;
        setIsCorrect(serverCorrect);
        if (serverCorrect) {
          setScore((prev) => prev + 1);
        } else if (wrongAnswerLog) {
          setWrongAnswerLogs((prev) => [...prev, wrongAnswerLog]);
        }
      } catch (e) {
        console.error(e);
        // 실패 시: 여기서는 그냥 무시
      }
    },
    [mode, current, isAnswered]
  );

  const goNext = useCallback(() => {
    if (currentIndex >= total - 1) {
      setIsFinished(true);
      return;
    }
    setCurrentIndex((prev) => prev + 1);
    setSelectedChoiceId(null);
    setIsAnswered(false);
    setIsCorrect(null);
  }, [currentIndex, total]);

  const goPrev = useCallback(() => {
    if (currentIndex <= 0) return;
    setCurrentIndex((prev) => prev - 1);
    setSelectedChoiceId(null);
    setIsAnswered(false);
    setIsCorrect(null);
  }, [currentIndex]);

  const finishQuiz = useCallback(() => {
    setIsFinished(true);
  }, []);

  // 카드 전용: 플립/알았다/모르겠다
  const toggleFlip = useCallback(() => {
    if (mode !== 'card') return;
    setIsFlipped((prev) => !prev);
  }, [mode]);

  const moveNextCard = useCallback(() => {
    if (currentIndex >= total - 1) {
      setIsFinished(true);
      return;
    }
    setCurrentIndex((prev) => prev + 1);
    setIsFlipped(false);
  }, [currentIndex, total]);

  const markKnown = useCallback(async () => {
    if (mode !== 'card' || !current) return;
    setKnownCount((prev) => prev + 1);
    moveNextCard();

    try {
      await submitCardResult({ wordId: current.wordId, result: 'known' });
    } catch (e) {
      console.error(e);
    }
  }, [mode, current, moveNextCard]);

  const markUnknown = useCallback(async () => {
    if (mode !== 'card' || !current) return;

    // 현재 카드 정보를 지역 변수로 담아놓고 사용
    const item = current;

    setUnknownCount((prev) => prev + 1);

    // 이번 세션 "헷갈린 단어" 목록에 추가
    setUnknownWords((prev) => {
      if (!item) return prev;

      const wordId = item.wordId ?? item.id ?? null;
      const text = item.word ?? item.frontText ?? item.text ?? '';
      const meaning = item.meaning ?? item.backText ?? '';

      if (!wordId && !text) return prev;

      const key = wordId ?? text;

      // 중복 방지
      const exists = prev.some((w) => {
        const wKey = w.wordId ?? w.text;
        return wKey === key;
      });
      if (exists) return prev;

      const payload = {
        wordId,
        text,
        meaning,
        partOfSpeech: item.partOfSpeech ?? item.pos ?? '',
        level: item.level ?? item.wordLevel ?? null,
        wrongWordId: item.wrongWordId ?? null,
      };

      return [...prev, payload];
    });

    moveNextCard();

    try {
      const res = await submitCardResult({ wordId: item.wordId, result: 'unknown' });
      if (res?.wrongAnswerLog) {
        setWrongAnswerLogs((prev) => [...prev, res.wrongAnswerLog]);
      }
    } catch (e) {
      console.error(e);
    }
  }, [mode, current, moveNextCard]);

  return {
    // 공통
    items,
    currentIndex,
    current,
    total,
    progress,
    loading,
    error,
    isFinished,
    goNext,
    goPrev,
    finishQuiz,

    // mcq 전용
    selectedChoiceId,
    isAnswered,
    isCorrect,
    score,
    wrongAnswerLogs,
    answerQuestion,

    // card 전용
    isFlipped,
    knownCount,
    unknownCount,
    toggleFlip,
    markKnown,
    markUnknown,
    unknownWords, // 🔹 카드 결과 페이지에서 사용하는 "헷갈린 단어" 목록
  };
}
