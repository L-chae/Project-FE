import React, { useState } from "react";
import "./WordCard.css";

function WordCard({ word, onToggleFavorite, onToggleComplete }) {
  const [open, setOpen] = useState(false);
  const [animate, setAnimate] = useState(false);

  const toggleDetail = () => setOpen(!open);

  const handleFavorite = (e) => {
    e.stopPropagation();
    setAnimate(true);
    setTimeout(() => setAnimate(false), 250);
    onToggleFavorite(word.wordId);
  };

  const handleComplete = (e) => {
    e.stopPropagation();
    onToggleComplete(word.wordId);
  };

  return (
    <div
      className={`word-card ${word.completed ? "completed" : ""}`}
      onClick={toggleDetail}
    >
      {/* 완료 배지 */}
      {word.completed && (
        <span className="complete-badge">✓ 완료</span>
      )}

      {/* 상단 */}
      <div className="card-header">
        <h3 className="word-title">{word.word}</h3>
        <span
          className={`star-icon ${word.favorite ? "active" : ""} ${animate ? "pop" : ""}`}
          onClick={handleFavorite}
        >
          ★
        </span>
      </div>

      <p className="meaning">{word.meaning}</p>

      <div className="tag-row">
        <span className="tag">{word.partOfSpeech}</span>
        <span className="tag">{word.category}</span>
        <span className="tag level">Lv.{word.level}</span>
      </div>

      {/* 상세보기 (애니메이션) */}
      <div className={`detail-box ${open ? "open" : "closed"}`}>
        <div className="detail-inner">
          <div className="detail-title">EXAMPLE</div>
          <p className="example">"{word.exampleSentence}"</p>

          {/* 학습 완료 버튼 */}
          <button
            className={`complete-btn ${word.completed ? "done" : ""}`}
            onClick={handleComplete}
          >
            {word.completed ? "학습 완료됨" : "학습 완료하기"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default WordCard;
