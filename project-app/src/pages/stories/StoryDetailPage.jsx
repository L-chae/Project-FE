// src/pages/story/StoryDetailPage.jsx
import { deleteStory, getStoryDetail, getStoryWords } from "@/api/storyApi";
import { ArrowLeft, Book, Calendar, Clock, Quote } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { toKoreanPOS } from "@/utils/posUtils";
import { Trash2 } from "lucide-react";
import "./StoryDetailPage.css";

/* 특수문자 escape */
const escapeRegExp = (str = "") =>
  str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/* 읽기 시간 계산 */
const estimateReadTime = (text = "") => {
  if (!text.trim()) return "";
  const words = text.trim().split(/\s+/).length;
  const minutes = Math.max(1, Math.round(words / 150));
  return `${minutes} min read`;
};

/* 단어 객체 → 문자열 변환 안전처리 */
const toSafeWord = (item) => {
  if (!item) return "";
  if (typeof item === "string") return item;

  return item.text || item.word || "";
};

export default function StoryDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const initialStory = location.state?.story;
  const [story, setStory] = useState(initialStory);
  const [loading, setLoading] = useState(!initialStory);

  const [words, setWords] = useState(initialStory?.words || []);
  const [activeWord, setActiveWord] = useState(null);

  /** 스토리 & 단어 fetch */
  useEffect(() => {
    if (!id || initialStory) return;

    const load = async () => {
      try {
        setLoading(true);
        const detail = await getStoryDetail(id);
        const wordList = await getStoryWords(id);

        setStory(detail);
        setWords(wordList || []);
      } catch (e) {
        alert("스토리를 불러올 수 없습니다.");
        navigate("/stories");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  const handleBack = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate("/stories");
  };

  const handleDelete = async () => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;
    try {
      await deleteStory(id);
      alert("삭제되었습니다.");
      navigate("/stories");
    } catch {
      alert("삭제에 실패했습니다.");
    }
  };

  /* 단어 하이라이트 처리 */
  const keywords = words
    ?.map(toSafeWord)
    .filter((w) => typeof w === "string" && w.trim().length > 0)
    .map((w) => w.toLowerCase());

  const highlightKeywords = (text) => {
    if (!keywords.length) return text;

    const pattern = keywords.map(escapeRegExp).join("|");
    const regex = new RegExp(`\\b(${pattern})\\b`, "gi");
    const parts = text.split(regex);

    return parts.map((part, i) => {
      const normalized = part.toLowerCase();
      const isWord = keywords.includes(normalized);

      if (!isWord) return part;

      const active = activeWord === normalized;
      return (
        <span
          key={`${part}-${i}`}
          className={`highlighted-word ${
            active ? "highlighted-word--active" : ""
          }`}
        >
          {part}
        </span>
      );
    });
  };

  if (loading) return <div className="story-detail-loading">AI 스토리 불러오는 중...</div>;
  if (!story) return null;

  const { title, storyEn, storyKo, createdAt } = story;

  return (
    <div className="page-container">
      <div className="story-page story-detail-page">

        {/* 🔹 상단 네비 */}
        <nav className="story-nav">
          <button className="nav-back-btn" onClick={handleBack}>
            <ArrowLeft size={18} />
            <span>목록으로</span>
          </button>
          <span className="nav-badge">AI Story</span>
        </nav>

        <div className="story-layout">

          {/* 🔹 좌측 단어 사이드바 */}
          <aside className="story-sidebar vocab-sidebar">
            <div className="vocab-header">
              <h3>
                <Book size={18} className="text-primary-500" /> 학습 단어
              </h3>
              <span className="nav-badge">{words.length}</span>
            </div>

            <p className="vocab-desc">
              스토리에 등장한 단어들이에요.<br />
              품사와 의미를 확인해보세요.
            </p>

            <div className="vocab-list">
              {words.length ? (
                words.map((item, i) => {
                  const raw = toSafeWord(item);
                  const text = raw ?? "";
                  const normalized = text.toLowerCase();

                  const pos = toKoreanPOS(item?.pos || item?.type || "");
                  const meaning = item?.meaning || item?.kor || "";

                  return (
                    <div
                      key={i}
                      className="mini-word-card"
                      onMouseEnter={() => setActiveWord(normalized)}
                      onMouseLeave={() => setActiveWord(null)}
                    >
                      <div className="mini-word-header">
                        <span className="mini-word-text">{text}</span>
                        <span className="mini-word-pos">{pos}</span>
                      </div>

                      {meaning && (
                        <p className="mini-word-meaning">{meaning}</p>
                      )}
                    </div>
                  );
                })
              ) : (
                <p className="vocab-empty">단어 정보가 없습니다.</p>
              )}
            </div>
          </aside>

          {/* 🔹 우측 스토리 본문 */}
          <main className="story-main-card story-main">
            <Quote className="bg-quote-icon" />

            <header className="story-main-header">
              <h1 className="story-main-title">{title}</h1>

              <div className="story-meta-row">
                {createdAt && (
                  <span className="meta-item">
                    <Calendar size={14} /> {createdAt.slice(0, 10)}
                  </span>
                )}
                <span className="meta-divider">·</span>
                <span className="meta-item">
                  <Clock size={14} /> {estimateReadTime(storyEn)}
                </span>
              </div>
            </header>

            {/* 🔸 영어 스토리 */}
            <article className="story-article">
              <div className="story-english">
                {(storyEn || "").split("\n").map((line, i) => (
                  <p key={i} className="en-paragraph">
                    {highlightKeywords(line)}
                  </p>
                ))}
              </div>

              {/* 구분선 */}
              <hr className="story-divider" />

              {/* 🔸 한국어 번역 */}
              <div className="story-korean">
                <div className="ko-label">한국어 번역</div>
                <p className="ko-paragraph">
                  {storyKo || "번역이 제공되지 않았습니다."}
                </p>
              </div>
            </article>

            {/* 🔹 삭제 버튼 */}
            <div className="story-main-footer">
              <button className="story-delete-btn" onClick={handleDelete}>
                <Trash2 size={16} />
              </button>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
