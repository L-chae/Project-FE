// src/pages/learning/components/LearningResultSection.jsx
import React from "react";
import "./LearningResultSection.css";

/**
 * 학습 결과 공통 레이아웃
 *
 * - 왼쪽: 헷갈린 단어 리스트
 * - 오른쪽: 통계 카드 (상단 2개 + 하단 1개)
 * - 하단: 액션 버튼 (secondary, primary)
 *
 * ProgressBar는 상위에서 생성해서 primaryProgress / secondaryProgress로 넘긴다.
 */
export function LearningResultSection({
  // 헷갈린 단어 카드
  unknownTitle,
  unknownSubtitle,
  emptyUnknownMessage,
  unknownItems,
  maxUnknownDisplay = 20,
  getUnknownKey,
  getUnknownWord,
  getUnknownMeaning,
  getUnknownMetaTags,
  buildMoreHintMessage,

  // 통계 카드
  primaryLabel,
  primaryValue,
  primaryProgress,
  primaryValueClassName = "stat-known",
  secondaryLabel,
  secondaryValue,
  secondaryProgress,
  secondaryValueClassName = "stat-unknown",
  extraLabel,
  extraValue,

  // 버튼
  primaryButtonLabel,
  onPrimaryButtonClick,
  secondaryButtonLabel,
  onSecondaryButtonClick,
}) {
  const items = Array.isArray(unknownItems) ? unknownItems : [];
  const limited = items.slice(0, maxUnknownDisplay);
  const restCount =
    items.length > maxUnknownDisplay ? items.length - maxUnknownDisplay : 0;

  return (
    <>
      {/* 좌/우 카드 그리드 */}
      <div className="learning-result-grid">
        {/* 헷갈린 단어 카드 */}
        <section className="learning-unknown-card">
          <div className="unknown-header">
            <h2 className="unknown-title">{unknownTitle}</h2>
            {unknownSubtitle && (
              <p className="unknown-subtitle">{unknownSubtitle}</p>
            )}
          </div>

          {limited.length === 0 ? (
            <p className="unknown-empty">{emptyUnknownMessage}</p>
          ) : (
            <ul className="unknown-list">
              {limited.map((item, index) => {
                const key = getUnknownKey ? getUnknownKey(item, index) : index;
                const word = getUnknownWord ? getUnknownWord(item) : "";
                const meaning = getUnknownMeaning
                  ? getUnknownMeaning(item)
                  : "";
                const metaTags = getUnknownMetaTags
                  ? getUnknownMetaTags(item) || []
                  : [];

                return (
                  <li className="unknown-item" key={key}>
                    <div className="unknown-main">
                      <span className="unknown-word">{word}</span>
                      {meaning && (
                        <span className="unknown-meaning">{meaning}</span>
                      )}
                    </div>

                    {metaTags.length > 0 && (
                      <div className="unknown-meta">
                        {metaTags.map((tag, i) => (
                          <span key={i} className="unknown-tag">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}

          {restCount > 0 && (
            <p className="unknown-more-hint">
              {buildMoreHintMessage
                ? buildMoreHintMessage(restCount)
                : `그 외 ${restCount}개 단어는 오답 노트에서 계속 확인할 수 있어요.`}
            </p>
          )}
        </section>

        {/* 통계 카드 */}
        <section className="stats-card">
          <div className="stat-row">
            <span className="stat-label">{primaryLabel}</span>
            <span className={`stat-value ${primaryValueClassName}`}>
              {primaryValue}
            </span>
          </div>
          {primaryProgress && primaryProgress}

          <div className="stat-row">
            <span className="stat-label">{secondaryLabel}</span>
            <span className={`stat-value ${secondaryValueClassName}`}>
              {secondaryValue}
            </span>
          </div>
          {secondaryProgress && secondaryProgress}

          {extraLabel && extraValue && (
            <div className="stat-row simple">
              <span className="stat-label">{extraLabel}</span>
              <span className="stat-value">{extraValue}</span>
            </div>
          )}
        </section>
      </div>

      {/* 액션 버튼 (공통 스타일: result-btn 사용) */}
      {(primaryButtonLabel || secondaryButtonLabel) && (
        <div className="result-buttons result-buttons--inline">
          {secondaryButtonLabel && onSecondaryButtonClick && (
            <button
              type="button"
              className="result-btn secondary"
              onClick={onSecondaryButtonClick}
            >
              {secondaryButtonLabel}
            </button>
          )}

          {primaryButtonLabel && onPrimaryButtonClick && (
            <button
              type="button"
              className="result-btn primary"
              onClick={onPrimaryButtonClick}
            >
              {primaryButtonLabel}
            </button>
          )}
        </div>
      )}
    </>
  );
}
