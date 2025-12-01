import { BookOpen, ChevronRight, Plus, Search } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

// 공통 컴포넌트 (이전 단계에서 만든 헤더 사용)
import PageHeader from "../../components/common/PageHeader"; 
import "./StoryListPage.css";

const MOCK_STORIES = [
  {
    id: 1,
    title: "First Snow in Seoul",
    excerpt: "On the first snowy morning, I finally used every word I had studied this week.",
    date: "2025-11-26",
    words: ["snow", "memory", "whisper", "lantern"],
  },
  {
    id: 2,
    title: "The Coffee Shop",
    excerpt: "The aroma of roasted beans filled the air as I waited for my order.",
    date: "2025-11-26",
    words: ["aroma", "roasted", "wait", "order"],
  },
  {
    id: 3,
    title: "Midnight Study",
    excerpt: "It was quiet, only the sound of turning pages could be heard.",
    date: "2025-11-25",
    words: ["quiet", "sound", "turn", "page", "focus"],
  },
];

const StoryListPage = ({ stories = [] }) => {
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState("");

  const handleSelectStory = (story) => navigate(`/story/${story.id}`);
  const handleCreateNew = () => navigate("/story/create");

  const sourceStories = (stories.length > 0 ? stories : MOCK_STORIES)
    .slice()
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  const filteredStories =
    searchValue.trim().length === 0
      ? sourceStories
      : sourceStories.filter((story) => {
          const q = searchValue.toLowerCase();
          return (
            story.title?.toLowerCase().includes(q) ||
            story.excerpt?.toLowerCase().includes(q) ||
            (story.words || []).some((w) => w.toLowerCase().includes(q))
          );
        });

  const hasAnyStories = sourceStories.length > 0;
  const hasFilteredStories = filteredStories.length > 0;

  return (
    <div className="page-container">
      <div className="story-list-page">
            {/* 1. 공통 헤더 컴포넌트 적용 */}
      <PageHeader 
        title="AI" 
        highlight="스토리" 
        description="내가 학습한 단어로 만든 나만의 이야기입니다." 
      />

      {/* 2. 컨트롤 영역: 검색(좌) + 생성버튼(우) */}
      <section className="story-controls">
        <div className="search-wrapper">
          <Search className="search-icon" />
          <input
            className="search-input"
            placeholder="스토리 검색..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
          />
        </div>

        <button className="create-story-btn" onClick={handleCreateNew}>
          <BookOpen size={18} />
          <span>새 스토리 만들기</span>
        </button>
      </section>

      {/* 3. 스토리 그리드 */}
      <section className="story-grid">
        {/* (1) 검색 결과 없음 */}
        {hasAnyStories && !hasFilteredStories && (
          <div className="empty-msg">
            <p>검색 결과가 없습니다. 🍂</p>
          </div>
        )}

        {/* (2) 데이터 없음 (초기 상태) */}
        {!hasAnyStories && (
          <article 
            className="story-card add-card"
            onClick={handleCreateNew}
            role="button" 
            tabIndex={0}
          >
            <div className="add-icon-wrapper">
              <Plus size={32} />
            </div>
            <h3 className="add-card-title">첫 번째 스토리 만들기</h3>
            <p className="add-card-desc">학습한 단어를 활용해 문장을 만들어보세요.</p>
          </article>
        )}

        {/* (3) 리스트 렌더링 */}
        {hasFilteredStories &&
          filteredStories.map((story) => (
            <article
              key={story.id}
              className="story-card"
              onClick={() => handleSelectStory(story)}
              role="button"
              tabIndex={0}
            >
              {/* 상단: 제목 & 요약 */}
              <div className="story-card-top">
                <h3 className="story-title">{story.title}</h3>
                <p className="story-excerpt">{story.excerpt}</p>
              </div>

              {/* 중단: 단어 태그 */}
              {story.words && story.words.length > 0 && (
                <div className="story-tags">
                  {story.words.slice(0, 4).map((word, idx) => (
                    <span key={idx} className="story-tag">#{word}</span>
                  ))}
                  {story.words.length > 4 && <span className="story-tag">...</span>}
                </div>
              )}

              {/* 하단: 날짜 & 읽기 버튼 */}
              <div className="story-card-bottom">
                <span className="story-date">{story.date}</span>
                <div className="read-more">
                  Read Story <ChevronRight size={14} />
                </div>
              </div>
            </article>
          ))}
      </section>
    </div></div>  
  );
};

export default StoryListPage;