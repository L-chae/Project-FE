// src/pages/quiz/QuizPage.jsx
import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { ArrowLeft, AlertCircle } from "lucide-react";

import Button from "../../components/common/Button";
import Spinner from "../../components/common/Spinner";
import { ProgressBar } from "./components/ProgressBar";
import { QuizQuestion } from "./components/QuizQuestion";
import "./QuizPage.css";

import { fetchQuizzes, submitQuizResult } from "../../api/quizApi";

const MAX_WRONG_DISPLAY = 20;

// 문제 객체에서 단어만 추출
const extractWordFromQuestion = (q) => {
  if (!q) return "";

  if (typeof q.word === "string" && q.word.trim().length > 0) {
    return q.word.trim();
  }

  const src =
    (typeof q.question === "string" && q.question) ||
    (typeof q.questionText === "string" && q.questionText) ||
    "";

  if (!src) return "";

  const singleMatch = src.match(/'([^']+)'/);
  if (singleMatch && singleMatch[1]) {
    return singleMatch[1].trim();
  }

  const doubleMatch = src.match(/"([^"]+)"/);
  if (doubleMatch && doubleMatch[1]) {
    return doubleMatch[1].trim();
  }

  return src
    .split(/\s+/)[0]
    .replace(/^[\[\(]+/, "")
    .replace(/[\]\)\?:]+$/, "")
    .trim();
};

const QuizPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const source = searchParams.get("source"); // "quiz" | "wrong-note"
  const limit = searchParams.get("limit") || 10;
  const rawLevel = searchParams.get("level");
  const levelLabel = rawLevel === "all" || !rawLevel ? "All" : rawLevel;
  const levelForApi = rawLevel === "all" || !rawLevel ? "1" : rawLevel;

  const isWrongMode = source === "wrong-note";

  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [wrongQuizWords, setWrongQuizWords] = useState([]);

  const [animateBars, setAnimateBars] = useState(false);

  useEffect(() => {
    if (isFinished) {
      const id = setTimeout(() => setAnimateBars(true), 60);
      return () => clearTimeout(id);
    }
    setAnimateBars(false);
  }, [isFinished]);

  // 퀴즈 데이터 로드
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const data = await fetchQuizzes({
          source,
          limit: Number(limit),
          level: levelForApi,
        });

        if (!data || data.length === 0) {
          throw new Error("풀 수 있는 문제가 없습니다.");
        }

        setQuestions(data);
        setCurrentIndex(0);
        setSelectedOption(null);
        setScore(0);
        setIsFinished(false);
        setWrongQuizWords([]);
      } catch (err) {
        console.error("❌ 퀴즈 로드 실패:", err);
        setError("문제를 불러오는 중 오류가 발생했습니다.");
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [source, limit, levelForApi]);

  const wrapperClassName = `quiz-page-wrapper ${
    isWrongMode ? "quiz-page-wrapper--wrong" : ""
  }`.trim();

  // 로딩: 공통 Spinner 사용
  if (isLoading) {
    return (
      <div className={wrapperClassName}>
        <div className="quiz-layout">
          <Spinner
            fullHeight={true}
            message="퀴즈를 불러오는 중입니다..."
          />
        </div>
      </div>
    );
  }

  // 에러
  if (error) {
    return (
      <div className={wrapperClassName}>
        <div className="quiz-layout">
          <div className="quiz-page quiz-page--error">
            <AlertCircle size={40} className="quiz-error-icon" />
            <h3>오류 발생</h3>
            <p>{error}</p>
            <div className="quiz-error-actions">
              <Button
                variant="secondary"
                size="md"
                onClick={() => navigate(-1)}
              >
                뒤로 가기
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const themeClass = isWrongMode ? "quiz-page--wrong" : "";
  const totalCount = questions.length || 1;
  const currentStep = Math.min(currentIndex + 1, totalCount);
  const incorrectCount = totalCount - score;
  const accuracy = totalCount > 0 ? Math.round((score / totalCount) * 100) : 0;

  const isAnswered = selectedOption !== null;
  const currentQuestion = !isFinished ? questions[currentIndex] : null;

  const resultTitle = isWrongMode ? "오답 퀴즈 결과" : "퀴즈 결과";
  const resultSubtitle = isWrongMode
    ? "이번에 틀린 문제를 기준으로 약한 단어를 다시 정리해 보세요."
    : "이번 퀴즈에서 헷갈렸던 단어를 중심으로 한 번 더 복습해 보세요.";

  const wrongSafe = Array.isArray(wrongQuizWords) ? wrongQuizWords : [];

  const handleOptionClick = (choiceIndex) => {
    if (selectedOption !== null) return;

    const currentQ = questions[currentIndex];
    setSelectedOption(choiceIndex);

    const isCorrect = choiceIndex === currentQ.answer;

    if (isCorrect) {
      setScore((prev) => prev + 1);
    } else {
      setWrongQuizWords((prev) => {
        const wordText = extractWordFromQuestion(currentQ);
        const normalized = (wordText || "").trim();
        if (!normalized) return prev;

        const lower = normalized.toLowerCase();
        if (prev.some((w) => w.text.toLowerCase() === lower)) {
          return prev;
        }

        // 한글 뜻 저장 (백엔드 필드 여러 형태 대응)
        const meaning =
          currentQ.meaningKo ||
          currentQ.meaning_ko ||
          currentQ.meaning ||
          currentQ.korean ||
          "";

        const newItem = {
          text: normalized,
          wordId: currentQ.wordId,
          wrongWordId: currentQ.wrongWordId,
          meaning,
          meaningKo:
            currentQ.meaningKo || currentQ.meaning_ko || currentQ.korean || "",
        };

        return [...prev, newItem];
      });
    }
  };

  const handleNext = async () => {
    if (selectedOption === null) return;

    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
    } else {
      try {
        await submitQuizResult({
          mode: isWrongMode ? "wrong" : "normal",
          score,
          total: questions.length,
          timestamp: new Date().toISOString(),
        });
      } catch (err) {
        console.error("❌ 결과 전송 실패:", err);
      }
      setIsFinished(true);
    }
  };

  return (
    <div className={wrapperClassName}>
      <div className="quiz-layout">
        {/* 진행 화면 */}
        {!isFinished && currentQuestion ? (
          <>
            {/* 헤더 (카드 밖) */}
            <header className="quiz-header">
              <div className="quiz-header-top">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate("/learning")}
                  aria-label="학습 홈으로"
                  className="quiz-back-btn"
                >
                  <ArrowLeft size={20} />
                </Button>
              </div>

              <h1 className="quiz-title">
                {isWrongMode ? "오답 객관식 퀴즈" : "실전 객관식 퀴즈"}
                <span
                  className={`quiz-badge ${
                    isWrongMode ? "badge-orange" : "badge-purple"
                  }`}
                >
                  {`Lv.${levelLabel}`}
                </span>
              </h1>

              <p className="quiz-subtitle">
                {isWrongMode
                  ? "틀렸던 단어들만 다시 객관식으로 점검합니다."
                  : "객관식 문제로 오늘 학습한 단어를 한 번 더 확인해 보세요."}
              </p>

              <div className="quiz-progress-area">
                <span className="quiz-progress-count">
                  {currentStep} / {totalCount}
                </span>
                <ProgressBar
                  current={currentStep}
                  total={totalCount}
                  variant={isWrongMode ? "warning" : "primary"}
                  showLabel={false}
                  className="quiz-progress-bar"
                />
              </div>
            </header>

            {/* 문제/보기 카드 */}
            <div className={`quiz-page ${themeClass}`}>
              <section className="quiz-learning">
                <main className="quiz-main">
                  <section className="quiz-question-box">
                    <h2 className="quiz-question-text">
                      {currentQuestion.question}
                    </h2>
                  </section>

                  <section className="quiz-options-section">
                    <QuizQuestion
                      question={{
                        choices: currentQuestion.options.map((text, index) => ({
                          id: index,
                          text,
                        })),
                        answerId: currentQuestion.answer,
                      }}
                      selectedChoiceId={selectedOption}
                      isAnswered={isAnswered}
                      isCorrect={
                        isAnswered && selectedOption === currentQuestion.answer
                      }
                      onSelect={handleOptionClick}
                    />
                  </section>

                  <footer className="quiz-footer">
                    {isAnswered && (
                      <Button
                        variant="primary"
                        full
                        size="lg"
                        onClick={handleNext}
                      >
                        {currentIndex + 1 === questions.length
                          ? "결과 보기"
                          : "다음 문제"}
                      </Button>
                    )}
                  </footer>
                </main>
              </section>
            </div>
          </>
        ) : (
          /* 결과 화면 */
          <section className="quiz-learning-result">
            <header className="quiz-result-header">
              <h1 className="quiz-result-title">{resultTitle}</h1>
              <p className="quiz-result-subtitle">{resultSubtitle}</p>
            </header>

            <div className="quiz-result-grid">
              {/* 왼쪽: 헷갈린 단어 */}
              <section className="quiz-unknown-card">
                <div className="quiz-unknown-header">
                  <h2 className="quiz-unknown-title">이번에 헷갈렸던 단어</h2>
                  <p className="quiz-unknown-subtitle">
                    이번 퀴즈에서 틀린 문제에 등장한 단어들입니다.
                  </p>
                </div>

                {wrongSafe.length === 0 ? (
                  <p className="quiz-unknown-empty">
                    헷갈린 단어 없이 모두 정확히 맞혔어요.
                  </p>
                ) : (
                  <ul className="quiz-unknown-list">
                    {wrongSafe.slice(0, MAX_WRONG_DISPLAY).map((w, i) => {
                      const key = w.wordId ?? w.text ?? i;
                      const wordText = w.text || w.word || "";
                      const meaning =
                        w.meaningKo ||
                        w.meaning_ko ||
                        w.meaning ||
                        w.korean ||
                        "";

                      return (
                        <li className="quiz-unknown-item" key={key}>
                          <div className="quiz-unknown-main">
                            <span className="quiz-unknown-word">
                              {wordText}
                            </span>
                            {meaning && (
                              <span className="quiz-unknown-meaning">
                                {meaning}
                              </span>
                            )}
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}

                {wrongSafe.length > MAX_WRONG_DISPLAY && (
                  <p className="quiz-unknown-more-hint">
                    그 외 {wrongSafe.length - MAX_WRONG_DISPLAY}
                    개 단어는 오답 노트에서 계속 확인할 수 있어요.
                  </p>
                )}
              </section>

              {/* 오른쪽: 통계 */}
              <section className="quiz-stats-card">
                <div className="quiz-stat-row">
                  <span className="quiz-stat-label">맞은 문제</span>
                  <span className="quiz-stat-value quiz-stat-correct">
                    {score}문제
                  </span>
                </div>
                {/* 맞은 문제: 항상 보라색 (primary) */}
                <ProgressBar
                  value={animateBars ? (score / (totalCount || 1)) * 100 : 0}
                  variant="primary"
                  showLabel={false}
                  className="quiz-stat-progress"
                />

                <div className="quiz-stat-row">
                  <span className="quiz-stat-label">틀린 문제</span>
                  <span className="quiz-stat-value quiz-stat-wrong">
                    {incorrectCount}문제
                  </span>
                </div>
                {/* 틀린 문제: 항상 주황색 (warning) */}
                <ProgressBar
                  value={
                    animateBars
                      ? (incorrectCount / (totalCount || 1)) * 100
                      : 0
                  }
                  variant="warning"
                  showLabel={false}
                  className="quiz-stat-progress"
                />

                <div className="quiz-stat-row quiz-stat-row-simple">
                  <span className="quiz-stat-label">정답률</span>
                  <span className="quiz-stat-value">{accuracy}%</span>
                </div>
              </section>
            </div>

            {/* 버튼: AI 스토리 = primary / 학습 홈 = secondary(흰색, 덜 강조) */}
            <div className="result-buttons result-buttons--inline">
              <button
                className="result-btn secondary"
                onClick={() => navigate("/learning")}
              >
                학습 홈으로 이동
              </button>

              <button
                className="result-btn primary"
                onClick={() => {
                  const wrongWordsPayload = wrongSafe
                    .filter((w) => w.text && w.text.trim().length > 0)
                    .map((w) => ({
                      text: w.text.trim(),
                      word: w.text.trim(),
                      wordId: w.wordId ?? null,
                      wrongWordId: w.wrongWordId ?? null,
                      meaning:
                        w.meaningKo ||
                        w.meaning_ko ||
                        w.meaning ||
                        w.korean ||
                        "",
                    }));

                  navigate("/stories/create", {
                    state: {
                      from: isWrongMode ? "wrong-quiz" : "quiz",
                      mode: isWrongMode ? "wrong" : "normal",
                      score,
                      total: questions.length,
                      wrongWords: wrongWordsPayload,
                    },
                  });
                }}
              >
                AI 스토리 생성하기
              </button>
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default QuizPage;
