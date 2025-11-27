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
        // 실패하면 최소한 정답 표시를 안 믿는 쪽으로 처리해도 되고, 여기서는 그냥 무시
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
    setUnknownCount((prev) => prev + 1);
    moveNextCard();

    try {
      const res = await submitCardResult({ wordId: current.wordId, result: 'unknown' });
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
  };
}
