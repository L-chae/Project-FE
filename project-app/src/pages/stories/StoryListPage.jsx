// src/pages/story/StoryListPage.jsx
import { ChevronRight, Search, FileQuestion } from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import Input from "../../components/common/Input";
import Spinner from "../../components/common/Spinner";
import PageHeader from "../../components/common/PageHeader";
import Pagination from "../../components/common/Pagination";
import EmptyState from "../../components/common/EmptyState";
import { getStoryList } from "../../api/storyApi";

import "./StoryListPage.css";

const PAGE_SIZE = 6;

const StoryListPage = ({ stories = [] }) => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [searchValue, setSearchValue] = useState("");
  const [serverStories, setServerStories] = useState([]);
  const [loading, setLoading] = useState(true);

  // 현재 페이지 인덱스 (URL 쿼리스트링 기준, 0-based)
  const currentPageIndex = Number(searchParams.get("page") || 0);

  const handleSelectStory = (story) => navigate(`/stories/${story.id}`);

  const handleGoLearning = () => {
    navigate("/learning");
  };

  // 서버에서 스토리 목록 로딩
  useEffect(() => {
    const fetchStories = async () => {
      try {
        const res = await getStoryList();
        const mapped = (res || []).map((item) => ({
          id: item.storyId,
          title: item.title,
          excerpt: item.storyEn?.slice(0, 120) || "",
          date: item.createdAt?.slice(0, 10) || "",
          words: item.keywords || [],
        }));
        setServerStories(mapped);
      } catch (e) {
        console.error("스토리 목록 로딩 실패:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchStories();
  }, []);

  // 전체 데이터 (서버 데이터 우선, 없으면 props 사용)
  const sourceStories = useMemo(() => {
    const base = serverStories.length > 0 ? serverStories : stories;
    return [...base].sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [serverStories, stories]);

  // 검색 필터링
  const filteredStories = useMemo(() => {
    if (searchValue.trim().length === 0) return sourceStories;

    const q = searchValue.toLowerCase();
    return sourceStories.filter((story) => {
      return (
        story.title?.toLowerCase().includes(q) ||
        story.excerpt?.toLowerCase().includes(q) ||
        (story.words || []).some((w) => w.toLowerCase().includes(q))
      );
    });
  }, [sourceStories, searchValue]);

  // 페이지네이션 계산
  const totalPages = Math.max(1, Math.ceil(filteredStories.length / PAGE_SIZE));
  const safeIndex = Math.min(Math.max(currentPageIndex, 0), totalPages - 1);

  const startIdx = safeIndex * PAGE_SIZE;
  const endIdx = startIdx + PAGE_SIZE;

  const pagedStories = useMemo(
    () => filteredStories.slice(startIdx, endIdx),
    [filteredStories, startIdx, endIdx]
  );

  const hasAnyStories = !loading && sourceStories.length > 0;
  const hasFilteredStories = !loading && filteredStories.length > 0;

  // 페이지 변경
  const handlePageChange = (nextIndex) => {
    setSearchParams((prev) => {
      const params = new URLSearchParams(prev);
      params.set("page", String(nextIndex));
      return params;
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // 검색 변경
  const handleSearchChange = (e) => {
    setSearchValue(e.target.value);
    setSearchParams((prev) => {
      const params = new URLSearchParams(prev);
      params.set("page", "0");
      return params;
    });
  };

  // 검색 초기화
  const handleResetSearch = () => {
    setSearchValue("");
    setSearchParams((prev) => {
      const params = new URLSearchParams(prev);
      params.set("page", "0");
      return params;
    });
  };

  return (
    <div className="page-container story-list-page">
      <PageHeader
        title="AI"
        highlight="스토리"
        description="내가 학습한 단어로 만든 나만의 이야기입니다."
      />

      {/* 스토리가 있을 때만 검색창 노출 */}
      {hasAnyStories && (
        <section className="story-controls">
          <div className="search-wrapper">
            <Search className="search-icon" size={18} />
            <Input
              search
              size="md"
              fullWidth
              placeholder="스토리 검색..."
              value={searchValue}
              onChange={handleSearchChange}
              aria-label="스토리 검색"
            />
          </div>
        </section>
      )}

      <section className="story-grid">
        {/* 로딩 상태 */}
        {loading && (
          <div className="status-msg loading">
            <Spinner
              fullHeight={false}
              message="스토리를 불러오는 중입니다..."
            />
          </div>
        )}

        {/* 스토리가 아예 없을 때 */}
        {!loading && !hasAnyStories && (
          <EmptyState
            icon={FileQuestion}
            title="AI 스토리가 아직 없습니다."
            description="학습하기에서 퀴즈를 풀고, 나온 오답 단어들로 AI 스토리를 만들어 보세요."
            actionLabel="학습하러 가기"
            onAction={handleGoLearning}
            variant="page"
          />
        )}

        {/* 스토리는 있는데, 검색/필터 결과가 없을 때 */}
        {!loading && hasAnyStories && !hasFilteredStories && (
          <EmptyState
            icon={FileQuestion}
            title="조건에 맞는 AI 스토리가 없습니다."
            description="검색어를 변경하거나, 검색어를 지우고 전체 스토리를 확인해 보세요."
            actionLabel="검색 초기화"
            onAction={handleResetSearch}
            variant="page"
          />
        )}

        {/* 목록 렌더링 */}
        {hasFilteredStories &&
          pagedStories.map((story) => (
            <article
              key={story.id}
              className="story-card"
              onClick={() => handleSelectStory(story)}
              role="button"
              tabIndex={0}
            >
              <div className="story-card-top">
                <h3 className="story-title">{story.title}</h3>
                <p className="story-excerpt">{story.excerpt}</p>
              </div>

              {story.words && story.words.length > 0 && (
                <div className="story-tags">
                  {story.words.slice(0, 4).map((word, idx) => (
                    <span key={idx} className="story-tag">
                      #{word}
                    </span>
                  ))}
                  {story.words.length > 4 && (
                    <span className="story-tag">...</span>
                  )}
                </div>
              )}

              <div className="story-card-bottom">
                <span className="story-date">{story.date}</span>
                <div className="read-more">
                  Read Story <ChevronRight size={14} />
                </div>
              </div>
            </article>
          ))}
      </section>

      {hasFilteredStories && (
        <Pagination
          page={safeIndex}
          totalPages={totalPages}
          onChange={handlePageChange}
        />
      )}
    </div>
  );
};

export default StoryListPage;
