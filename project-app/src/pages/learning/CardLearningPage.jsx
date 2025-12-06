// src/pages/learning/CardLearningPage.jsx
import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { X, Circle } from "lucide-react";

import { useLearningEngine } from "./hooks/useLearningEngine";
import { Flashcard } from "./components/Flashcard";
import { ProgressBar } from "./components/ProgressBar";
import "./CardLearningPage.css";

const MAX_UNKNOWN_DISPLAY = 20;

export default function CardLearningPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const source = searchParams.get("source") || "card";
  const clusterId = searchParams.get("clusterId") || undefined;
  const wordIdsParam = searchParams.get("wordIds");
  const wordIds = wordIdsParam
    ? wordIdsParam.split(",").map((x) => Number(x))
    : undefined;
  const limit = Number(searchParams.get("limit") || 20);

  const {
    current,
    currentIndex,
    total,
    loading,
    error,
    isFinished,
    isFlipped,
    knownCount,
    unknownCount,
    toggleFlip,
    markKnown,
    markUnknown,
    // hook에서 지원하면 사용, 아니면 기본값 빈 배열
    unknownWords = [],
  } = useLearningEngine({
    mode: "card",
    source,
    wordIds,
    clusterId,
    limit,
  });

  const isWrongMode = source === "wrong-note";

  const [animateBars, setAnimateBars] = useState(false);

  useEffect(() => {
    if (isFinished) {
      const id = setTimeout(() => setAnimateBars(true), 50);
      return () => clearTimeout(id);
    }
    setAnimateBars(false);
  }, [isFinished]);

  const safeTotal = total || 1;
  const displayIndex = total > 0 ? Math.min(currentIndex + 1, total) : 0;
  const unknownWordsSafe = Array.isArray(unknownWords) ? unknownWords : [];

  const pageClassName = `card-page ${isWrongMode ? "card-page--wrong" : ""}`;

  const handleGoHome = () => {
    navigate("/learning");
  };

  const handleGoQuiz = () => {
    const quizSource = source === "wrong-note" ? "wrong-note" : "quiz";
    navigate(`/learning/quiz?source=${quizSource}&limit=10`);
  };

  if (loading) {
    return <div className="card-page card-page--loading">로딩 중...</div>;
  }

  if (error) {
    return (
      <div className="card-page card-page--error">
        카드 데이터를 불러오는 중 오류가 발생했습니다.
      </div>
    );
  }

  const resultTitle = isWrongMode ? "오답 카드 학습 완료" : "카드 학습 완료";
  const resultSubtitle = isWrongMode
    ? "이번에 헷갈렸던 단어들을 위주로 다시 확인해보세요."
    : "알았던 단어와 모르는 단어를 나눠서 한 번 더 점검해보면 좋습니다.";

  return (
    <div className={pageClassName}>
      {/* 진행 중 화면 */}
      {!isFinished ? (
        <section
          className={`card-learning ${
            isWrongMode ? "card-learning--wrong" : ""
          }`}
        >
          <header className="cl-header">
            <h1 className="cl-title">
              {isWrongMode ? "오답 카드 학습" : "카드 학습"}
              <span
                className={`cl-badge ${
                  isWrongMode ? "badge-orange" : "badge-purple"
                }`}
              >
                {isWrongMode ? "복습" : "학습"}
              </span>
            </h1>

            <p className="cl-subtitle">
              {isWrongMode
                ? "틀렸던 단어들만 골라 카드를 뒤집으며 복습합니다."
                : "플래시 카드로 암기하고 퀴즈로 확인하세요."}
            </p>

            <div className="cl-progress-area">
              <span className="cl-progress-count">
                {displayIndex} / {total}
              </span>

              <ProgressBar
                current={displayIndex}
                total={safeTotal}
                variant={isWrongMode ? "warning" : "primary"}
                showLabel={false}
                className="cl-progress-bar"
              />
            </div>
          </header>

          <div className="cl-main">
            <Flashcard
              front={current?.frontText}
              back={current?.backText}
              isFlipped={isFlipped}
              onToggle={toggleFlip}
            />

            <footer className="cl-actions actions-ox">
              <button
                type="button"
                className="btn-unknown"
                onClick={markUnknown}
                aria-label="모르겠다"
              >
                <X size={32} />
              </button>
              <button
                type="button"
                className="btn-known"
                onClick={markKnown}
                aria-label="알겠다"
              >
                <Circle size={28} strokeWidth={3} />
              </button>
            </footer>
          </div>
        </section>
      ) : (
        // 결과 화면
        <section
          className={`card-learning-result ${
            isWrongMode ? "card-learning--wrong" : ""
          }`}
        >
          {/* 상단 제목/설명 - 중앙 정렬 */}
          <header className="cl-header">
            <h1 className="cl-title">{resultTitle}</h1>
            <p className="cl-subtitle">{resultSubtitle}</p>
          </header>

          {/* 좌측: 헷갈린 단어 목록 / 우측: 통계 카드 */}
          <div className="learning-result-grid">
            {/* 헷갈린 단어 목록 */}
            <section className="learning-unknown-card">
              <div className="unknown-header">
                <h2 className="unknown-title">헷갈린 단어</h2>
                <p className="unknown-subtitle">
                  이번 학습에서 &quot;모르겠다&quot;로 표시한 단어들입니다.
                </p>
              </div>

              {unknownWordsSafe.length === 0 ? (
                <p className="unknown-empty">
                  헷갈린 단어 없이 모두 알고 있었어요.
                </p>
              ) : (
                <ul className="unknown-list">
                  {unknownWordsSafe.slice(0, MAX_UNKNOWN_DISPLAY).map((w, i) => {
                    const key = w.wordId ?? w.id ?? w.text ?? i;
                    const wordText = w.text || w.word || "";
                    const meaning = w.meaning || w.korean || w.meaningKo || "";
                    const pos = w.partOfSpeech || w.pos || "";

                    return (
                      <li className="unknown-item" key={key}>
                        <div className="unknown-main">
                          <span className="unknown-word">{wordText}</span>
                          {meaning && (
                            <span className="unknown-meaning">{meaning}</span>
                          )}
                        </div>
                        {(pos || w.level) && (
                          <div className="unknown-meta">
                            {pos && <span className="unknown-tag">{pos}</span>}
                            {w.level && (
                              <span className="unknown-tag">Lv.{w.level}</span>
                            )}
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}

              {unknownWordsSafe.length > MAX_UNKNOWN_DISPLAY && (
                <p className="unknown-more-hint">
                  그 외 {unknownWordsSafe.length - MAX_UNKNOWN_DISPLAY}
                  개 단어는 오답 노트에서 계속 확인할 수 있어요.
                </p>
              )}
            </section>

            {/* 통계 카드 */}
            <section className="stats-card">
              <div className="stat-row">
                <span className="stat-label">알았다</span>
                <span className="stat-value stat-known">{knownCount}개</span>
              </div>
              <ProgressBar
                value={animateBars ? (knownCount / safeTotal) * 100 : 0}
                variant="primary"
                showLabel={false}
                className="stat-progress"
              />

              <div className="stat-row">
                <span className="stat-label">모르겠다</span>
                <span className="stat-value stat-unknown">
                  {unknownCount}개
                </span>
              </div>
              <ProgressBar
                value={animateBars ? (unknownCount / safeTotal) * 100 : 0}
                variant="warning"
                showLabel={false}
                className="stat-progress"
              />

              <div className="stat-row simple">
                <span className="stat-label">총 학습 단어</span>
                <span className="stat-value">{total}개</span>
              </div>
            </section>
          </div>

          {/* 액션 버튼 */}
          <div className="result-buttons result-buttons--inline">
            <button
              className="result-btn secondary"
              onClick={handleGoHome}
            >
              학습 홈으로 이동
            </button>

            <button
              className="result-btn primary"
              onClick={handleGoQuiz}
            >
              {isWrongMode ? "오답 퀴즈 풀기" : "객관식 퀴즈 풀기"}
            </button>
          </div>
        </section>
      )}
    </div>
  );
}
