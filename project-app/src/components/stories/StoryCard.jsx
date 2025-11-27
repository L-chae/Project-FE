import React, { memo, useCallback } from "react";
import PropTypes from "prop-types";
import { Calendar, Clock, ChevronRight } from "lucide-react";

import "../Card.css"; // card, card--interactive, card-header 등 공통 스타일
import "./StoryCard.css";

const StoryCard = ({
  story,
  onClick,
  showTags = true,
  className = "",
  size = "default", // "default" | "compact"
}) => {
  const {
    title,
    excerpt,
    date,
    readTime,
    words = [],
    label = "Original",
  } = story || {};

  const interactive = typeof onClick === "function";

  const handleClick = useCallback(() => {
    if (interactive) onClick(story);
  }, [interactive, onClick, story]);

  const handleKeyDown = useCallback(
    (e) => {
      if (!interactive) return;
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onClick(story);
      }
    },
    [interactive, onClick, story]
  );

  const rootClassName = [
    "card",
    "story-card",
    interactive && "card--interactive",
    size === "compact" && "card--compact",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <article
      className={rootClassName}
      onClick={interactive ? handleClick : undefined}
      onKeyDown={interactive ? handleKeyDown : undefined}
      role={interactive ? "button" : undefined}
      tabIndex={interactive ? 0 : undefined}
    >
      {/* 헤더 */}
      <div className="card-header">
        <div className="card-header-main">
          {label && <span className="card-eyebrow">{label}</span>}

          <div className="card-title-block">
            <h3 className="card-title">{title}</h3>
            {excerpt && (
              <p className="card-subtitle story-card-excerpt">{excerpt}</p>
            )}
          </div>
        </div>

        {(date || readTime) && (
          <div className="card-header-meta">
            {date && (
              <span className="card-meta story-card-meta">
                <Calendar className="icon-xs" />
                {date}
              </span>
            )}
            {readTime && (
              <span className="card-meta story-card-meta">
                <Clock className="icon-xs" />
                {readTime}
              </span>
            )}
          </div>
        )}
      </div>

      {/* 본문 */}
      {(showTags && words.length > 0) && (
        <div className="card-body">
          <div className="story-card-tags">
            {words.map((word, idx) => (
              <span key={idx} className="story-card-tag">
                #{word}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 푸터 */}
      {interactive && (
        <div className="card-footer">
          <button
            type="button"
            className="story-card-readmore"
            tabIndex={-1} // parent에서 포커스 처리
          >
            Read
            <ChevronRight className="icon-sm" />
          </button>
        </div>
      )}
    </article>
  );
};

StoryCard.propTypes = {
  story: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    title: PropTypes.string.isRequired,
    excerpt: PropTypes.string,
    date: PropTypes.string,
    readTime: PropTypes.string,
    words: PropTypes.arrayOf(PropTypes.string),
    label: PropTypes.string,
  }).isRequired,
  onClick: PropTypes.func,
  showTags: PropTypes.bool,
  className: PropTypes.string,
  size: PropTypes.oneOf(["default", "compact"]),
};

export default memo(StoryCard);
