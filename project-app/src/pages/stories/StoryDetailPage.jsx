// src/pages/stories/StoryDetailPage.jsx
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Hash,
  Quote,
} from "lucide-react";
import { getStoryDetail } from "../../api/storyApi";
import "./StoryDetailPage.css";

const StoryDetailPage = () => {
  const { id } = useParams(); // /story/:id
  const navigate = useNavigate();
  const location = useLocation();

  // 목록에서 넘어온 스토리가 있으면 그대로 사용
  const initialStory = location.state?.story ?? null;

  const [story, setStory] = useState(initialStory);
  const [loading, setLoading] = useState(!initialStory);

  useEffect(() => {
    if (!id || initialStory) return;

    const fetchStory = async () => {
      try {
        setLoading(true);
        const data = await getStoryDetail(id);
        setStory(data);
      } catch (error) {
        console.error("스토리 로딩 실패:", error);
        alert("스토리를 불러올 수 없습니다.");
        navigate("/stories");
      } finally {
        setLoading(false);
      }
    };

    fetchStory();
  }, [id, initialStory, navigate]);

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/stories");
    }
  };

  // 로딩 상태
  if (loading) {
    return (
      <div className="story-detail-container story-detail-loading">
        <p className="story-detail-loading-text">
          스토리를 불러오는 중입니다...
        </p>
      </div>
    );
  }

  // 데이터 없음
  if (!story) {
    return (
      <div className="story-detail-empty">
        <div className="story-detail-empty-inner">
          <p>스토리 정보를 찾을 수 없습니다.</p>
          <button
            type="button"
            className="story-detail-empty-button"
            onClick={() => navigate("/stories")}
          >
            스토리 목록으로
          </button>
        </div>
      </div>
    );
  }

  const {
    title,
    date,
    readTime,
    words = [],
    content = "",
    translation = "",
  } = story;

  const lines = content ? content.split("\n") : [];

  return (
    <div className="story-detail-container">
      {/* 상단 네비게이션 */}
      <div className="story-detail-nav">
        <button type="button" onClick={handleBack} className="back-button">
          <div className="back-button-icon">
            <ArrowLeft className="icon-16" />
          </div>
          <span className="back-button-text">목록으로</span>
        </button>

        <div className="story-detail-nav-right">
          <span className="badge-original">AI 스토리</span>
        </div>
      </div>

      <div className="story-detail-layout">
        {/* 왼쪽 패널: 단어 목록 */}
        <aside className="vocab-sidebar">
          <div className="vocab-header">
            <div className="vocab-header-icon">
              <Hash className="icon-20" />
            </div>
            <div>
              <h2 className="vocab-title">단어 목록</h2>
              <p className="vocab-subtitle">이 스토리에 사용된 단어들</p>
            </div>
          </div>

          <div className="word-list">
            {words.length > 0 ? (
              words.map((item, idx) => {
                // 문자열 배열/객체 배열 모두 대응
                const isString = typeof item === "string";
                const text = isString ? item : item.text || item.word || "";
                const pos = !isString ? item.pos || item.type || "" : "";
                const meaning = !isString ? item.meaning || item.kor || "" : "";

                return (
                  <div key={idx} className="word-card">
                    <div className="word-card-inner">
                      <div className="word-card-main">
                        <span className="word-card-text">{text}</span>
                        {pos && (
                          <span className="word-pos-badge">{pos}</span>
                        )}
                      </div>
                      {meaning && (
                        <p className="word-meaning">{meaning}</p>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="word-list-empty">등록된 단어가 없습니다.</p>
            )}
          </div>
        </aside>

        {/* 오른쪽 패널: 스토리 본문 */}
        <section className="story-panel">
          <Quote className="story-panel-quote icon-96" />

          <div className="story-header">
            <h1 className="story-title">{title}</h1>
            <div className="story-meta">
              {date && (
                <span className="story-meta-item">
                  <Calendar className="icon-16" />
                  {date}
                </span>
              )}
              {date && readTime && <span className="story-meta-dot" />}
              {readTime && (
                <span className="story-meta-item">
                  <Clock className="icon-16" />
                  {readTime}
                </span>
              )}
            </div>
          </div>

          <div className="story-body">
            {/* 영어 스토리 */}
            <div className="story-content">
              {lines.length > 0 ? (
                lines.map((line, i) => (
                  <p
                    key={i}
                    className="story-content-text"
                    style={{ minHeight: line ? "auto" : "1rem" }}
                  >
                    {line}
                  </p>
                ))
              ) : (
                <p className="story-content-text story-content-empty">
                  스토리 본문이 없습니다.
                </p>
              )}
            </div>

            {/* 한국어 번역 */}
            <div className="translation-card">
              <div className="translation-label">한국어 번역</div>
              <p className="translation-text">
                {translation || "한국어 번역이 아직 제공되지 않았습니다."}
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default StoryDetailPage;
