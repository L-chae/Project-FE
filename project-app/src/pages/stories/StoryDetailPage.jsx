import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Book,
  Quote,
} from "lucide-react";
import { getStoryDetail } from "../../api/storyApi";
import "./StoryDetailPage.css";

const StoryDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // 목록에서 넘어온 데이터가 있으면 우선 사용 (로딩 최소화)
  const initialStory = location.state?.story ?? null;
  const [story, setStory] = useState(initialStory);
  const [loading, setLoading] = useState(!initialStory);

  useEffect(() => {
    // ID가 없거나, 이미 데이터가 있으면 로딩 스킵
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

  // --- 하이라이트 로직 ---
  // 1. 단어 목록에서 텍스트만 추출
  const keywords = story?.words 
    ? story.words.map((w) => (typeof w === "string" ? w : w.text || w.word))
    : [];

  // 2. 본문 텍스트 내 키워드 하이라이트 함수
  const highlightKeywords = (text) => {
    if (!keywords.length || !text) return text;

    // 정규식: 단어 경계(\b) 포함, 대소문자 무시(i)
    const regex = new RegExp(`\\b(${keywords.join("|")})\\b`, "gi");
    const parts = text.split(regex);

    return parts.map((part, i) => {
      // 키워드와 일치하면 span으로 감쌈
      if (keywords.some((k) => k.toLowerCase() === part.toLowerCase())) {
        return (
          <span key={i} className="highlighted-word">
            {part}
          </span>
        );
      }
      return part;
    });
  };

  if (loading) {
    return (
      <div className="story-detail-loading">
        <p>스토리를 불러오는 중입니다... ⏳</p>
      </div>
    );
  }

  if (!story) return null;

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
    <div className="page-container story-detail-page">
      
      {/* 1. 상단 네비게이션 */}
      <nav className="story-nav">
        <button type="button" onClick={handleBack} className="nav-back-btn">
          <ArrowLeft size={18} />
          <span>목록으로</span>
        </button>
        <span className="nav-badge">AI Story</span>
      </nav>

      <div className="story-layout">
        
        {/* 2. 좌측 사이드바: 단어장 */}
        <aside className="vocab-sidebar">
          <div className="vocab-header">
            <div className="vocab-icon">
              <Book size={18} />
            </div>
            <div className="vocab-title-wrap">
              <h3>학습 단어</h3>
              <p>{words.length}개의 단어가 사용됨</p>
            </div>
          </div>

          <div className="vocab-list">
            {words.length > 0 ? (
              words.map((item, idx) => {
                // 데이터 형식이 문자열인지 객체인지 확인하여 처리
                const isString = typeof item === "string";
                const text = isString ? item : item.text || item.word || "";
                const pos = !isString ? item.pos || item.type || "Word" : "Word";
                const meaning = !isString ? item.meaning || item.kor || "" : "";

                return (
                  <div key={idx} className="mini-word-card">
                    <div className="mini-word-header">
                      <span className="mini-word-text">{text}</span>
                      <span className="mini-word-pos">{pos}</span>
                    </div>
                    {meaning && <p className="mini-word-meaning">{meaning}</p>}
                  </div>
                );
              })
            ) : (
              <p className="vocab-empty">등록된 단어가 없습니다.</p>
            )}
          </div>
        </aside>

        {/* 3. 우측 메인: 스토리 본문 */}
        <main className="story-main">
          {/* 배경 장식 아이콘 */}
          <Quote className="bg-quote-icon" />

          <header className="story-main-header">
            <h1 className="story-main-title">{title}</h1>
            <div className="story-meta-row">
              {date && (
                <span className="meta-item">
                  <Calendar size={14} /> {date}
                </span>
              )}
              {date && readTime && <span className="meta-divider">·</span>}
              {readTime && (
                <span className="meta-item">
                  <Clock size={14} /> {readTime}
                </span>
              )}
            </div>
          </header>

          <article className="story-article">
            {/* 영문 파트 (하이라이트 적용) */}
            <div className="story-english">
              {lines.map((line, i) => (
                <p key={i} className="en-paragraph">
                  {highlightKeywords(line)}
                </p>
              ))}
            </div>

            <hr className="story-divider" />

            {/* 한글 번역 파트 */}
            <div className="story-korean">
              <div className="ko-label">한국어 번역</div>
              <p className="ko-paragraph">
                {translation || "번역이 제공되지 않았습니다."}
              </p>
            </div>
          </article>
        </main>
      </div>
    </div>
  );
};

export default StoryDetailPage;