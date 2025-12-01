import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {  Search } from "lucide-react";
import {
  addFavorite,
  getWordList,
  removeFavorite,
  toggleProgress,
} from "../../api/wordApi";
import PageHeader from "../../components/common/PageHeader"; // 경로에 맞게 수정해주세요
import "./WordListPage.css";
import { CheckCircle, Clock } from "lucide-react";
import Pagination from "../../components/common/Pagination";



// --- 아이콘 자원 (SVG) ---
const Icons = {
  all: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
      <polyline points="14 2 14 8 20 8"></polyline>
      <line x1="16" y1="13" x2="8" y2="13"></line>
      <line x1="16" y1="17" x2="8" y2="17"></line>
      <polyline points="10 9 9 9 8 9"></polyline>
    </svg>
  ),
  favorite: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="none">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
    </svg>
  ),
  learning: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20h9"></path>
      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
    </svg>
  ),
  completed: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
      <polyline points="22 4 12 14.01 9 11.01"></polyline>
    </svg>
  ),
};

// --- 필터 옵션 상수 ---
const CATEGORY_OPTIONS = [
  { label: "전체", value: "All" },
  { label: "명사 (Noun)", value: "Noun" },
  { label: "동사 (Verb)", value: "Verb" },
  { label: "형용사 (Adj)", value: "Adj" },
  { label: "부사 (Adv)", value: "Adv" },
];
const DOMAIN_OPTIONS = [
  { label: "전체", value: "All" },
  { label: "일상생활", value: "Daily Life" },
  { label: "사람/감정", value: "People & Feelings" },
  { label: "직장/비즈니스", value: "Business" },
  { label: "학교/학습", value: "School & Learning" },
  { label: "여행/교통", value: "Travel" },
  { label: "음식/건강", value: "Food & Health" },
  { label: "기술/IT", value: "Technology" },
];
const LEVEL_OPTIONS = [
  { label: "전체 난이도", value: "All" },
  { label: "Lv.1", value: 1 },
  { label: "Lv.2", value: 2 },
  { label: "Lv.3", value: 3 },
  { label: "Lv.4", value: 4 },
  { label: "Lv.5", value: 5 },
  { label: "Lv.6", value: 6 },
];
const FILTER_INITIAL = { category: "All", domain: "All", level: "All" };

function WordListPage() {
  const navigate = useNavigate();

  // --- 상태 관리 ---
  const [words, setWords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [mode, setMode] = useState("all");
  const [filter, setFilter] = useState(FILTER_INITIAL);
  const [sortKey, setSortKey] = useState("default");
  const [openDropdown, setOpenDropdown] = useState(null);

  // --- 초기 데이터 로딩 ---
  useEffect(() => {
    let cancelled = false;
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await getWordList(0, 100);
        if (cancelled) return;
        setWords(Array.isArray(data?.content) ? data.content : data || []);
        setError(null);
      } catch (err) {
        console.error(err);
        if (cancelled) return;
        setError("단어장을 불러오지 못했습니다.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchData();
    return () => { cancelled = true; };
  }, []);

  // --- 핸들러 ---
  const handleCardClick = (wordId) => navigate(`/words/${wordId}`);

  const handleToggleFavorite = async (word, e) => {
    e.stopPropagation();
    const originalWords = words;
    const currentStatus = word.isFavorite;
    setWords((prev) => prev.map((w) => w.wordId === word.wordId ? { ...w, isFavorite: !currentStatus } : w));
    try {
      currentStatus ? await removeFavorite(word.wordId) : await addFavorite(word.wordId);
    } catch (err) {
      console.error("즐겨찾기 실패", err);
      setWords(originalWords);
    }
  };

  const handleToggleComplete = async (wordId, e) => {
    e.stopPropagation();
    const originalWords = words;
    setWords((prev) => prev.map((w) => w.wordId === wordId ? { ...w, isCompleted: !w.isCompleted } : w));
    try {
      await toggleProgress(wordId);
    } catch (err) {
      console.error("학습 상태 실패", err);
      setWords(originalWords);
    }
  };

  const handleModeChange = (type) => setMode(type);
  const toggleDropdown = (name) => setOpenDropdown((prev) => (prev === name ? null : name));
  const selectFilterOption = (type, value) => {
    setFilter((prev) => ({ ...prev, [type]: value }));
    setOpenDropdown(null);
  };
  const getFilterLabel = (type, options) => {
    const current = filter[type];
    const found = options.find((opt) => opt.value === current);
    return found ? found.label : options[0].label;
  };
  const resetFilters = () => {
    setFilter(FILTER_INITIAL);
    setSearch("");
    setSortKey("default");
    setMode("all");
  };

  // --- 파생 상태 ---
  const favoriteCount = useMemo(() => words.filter((w) => w.isFavorite).length, [words]);
  const learningCount = useMemo(() => words.filter((w) => !w.isCompleted).length, [words]);
  const completedCount = useMemo(() => words.filter((w) => w.isCompleted).length, [words]);

  const statItems = [
    { key: "all", label: "전체 단어", count: words.length, icon: Icons.all, color: "purple" },
    { key: "favorite", label: "즐겨찾기", count: favoriteCount, icon: Icons.favorite, color: "yellow" },
    { key: "learning", label: "학습 중", count: learningCount, icon: Icons.learning, color: "blue" },
    { key: "completed", label: "학습완료", count: completedCount, icon: Icons.completed, color: "green" },
  ];

  const filteredAndSortedWords = useMemo(() => {
    let result = words.filter((w) => {
      if (mode === "favorite" && !w.isFavorite) return false;
      if (mode === "learning" && w.isCompleted) return false;
      if (mode === "completed" && !w.isCompleted) return false;
      return true;
    });

    result = result.filter((w) => {
      if (filter.category !== "All" && w.partOfSpeech !== filter.category) return false;
      if (filter.domain !== "All" && w.domain !== filter.domain) return false;
      if (filter.level !== "All" && w.level !== filter.level) return false;
      if (search && !w.word.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });

    if (sortKey === "alphabet") {
      result.sort((a, b) => (a.word || "").localeCompare(b.word || "", "en", { sensitivity: "base" }));
    } else if (sortKey === "level") {
      result.sort((a, b) => {
        const la = typeof a.level === "number" ? a.level : 999;
        const lb = typeof b.level === "number" ? b.level : 999;
        return la - lb;
      });
    }
    return result;
  }, [words, mode, filter, search, sortKey]);

  const isEmptyAll = !loading && !error && words.length === 0;
// =======================
// 페이지네이션 계산 로직
// =======================
const PAGE_SIZE = 12; // 3열 × 4줄 = 12개

const totalPages = Math.max(1, Math.ceil(filteredAndSortedWords.length / PAGE_SIZE));

const [searchParams, setSearchParams] = useState(new URLSearchParams());
const currentPageIndex = Number(searchParams.get("page") || 0);
const safeIndex = Math.min(Math.max(currentPageIndex, 0), totalPages - 1);

const startIdx = safeIndex * PAGE_SIZE;
const endIdx = startIdx + PAGE_SIZE;

const pagedWords = filteredAndSortedWords.slice(startIdx, endIdx);

const handlePageChange = (nextIndex) => {
  const params = new URLSearchParams(searchParams);
  params.set("page", String(nextIndex));
  setSearchParams(params);
  window.scrollTo(0, 0);
};


  return (
    <div className="page-container wordlist-page">
 {/* 1. 헤더: 제목(공통 컴포넌트) + 통계(중앙) */}
      <header className="wordlist-header">
        
        {/* 공통 타이틀 컴포넌트 적용 */}
        <PageHeader 
          title="나의" 
          highlight="단어장" 
          description="오늘의 학습을 시작하세요." 
        />

        <div className="wordlist-stats-wrapper">
          <nav className="word-stats" aria-label="학습 현황 필터">
            <div className="word-stats-list">
              {statItems.map(({ key, label, count, icon, color }) => (
                <button
                  key={key}
                  type="button"
                  className={`stat-card no-select ${mode === key ? "active" : ""} ${color}`}
                  onClick={() => handleModeChange(key)}
                >
                  <div className={`stat-icon-wrapper bg-${color}`}>
                    {icon}
                  </div>
                  <div className="stat-info">
                    <span className="stat-label">{label}</span>
                    <span className="stat-count">{count}</span>
                  </div>
                </button>
              ))}
            </div>
          </nav>
        </div>
      </header>
      {/* 2. 컨트롤: 필터(좌) + 검색(우) */}
      <section className="wordlist-controls">
        <div className="controls-left">
          <div className="filter-container">
            {/* 품사 */}
            <div className="filter-group">
              <span className="filter-label">품사</span>
              <div className="dropdown-box">
                <button
                  type="button"
                  className={`dropdown-btn no-select ${filter.category !== "All" ? "selected" : ""}`}
                  onClick={() => toggleDropdown("category")}
                >
                  {getFilterLabel("category", CATEGORY_OPTIONS)}
                  <span className="arrow">▾</span>
                </button>
                {openDropdown === "category" && (
                  <div className="dropdown-menu">
                    {CATEGORY_OPTIONS.map((opt) => (
                      <div key={opt.value} className="dropdown-item" onClick={() => selectFilterOption("category", opt.value)}>
                        {opt.label}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            {/* 분야 */}
            <div className="filter-group">
              <span className="filter-label">분야</span>
              <div className="dropdown-box">
                <button
                  type="button"
                  className={`dropdown-btn no-select ${filter.domain !== "All" ? "selected" : ""}`}
                  onClick={() => toggleDropdown("domain")}
                >
                  {getFilterLabel("domain", DOMAIN_OPTIONS)}
                  <span className="arrow">▾</span>
                </button>
                {openDropdown === "domain" && (
                  <div className="dropdown-menu">
                    {DOMAIN_OPTIONS.map((opt) => (
                      <div key={opt.value} className="dropdown-item" onClick={() => selectFilterOption("domain", opt.value)}>
                        {opt.label}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            {/* 난이도 */}
            <div className="filter-group">
              <span className="filter-label">난이도</span>
              <div className="dropdown-box">
                <button
                  type="button"
                  className={`dropdown-btn no-select ${filter.level !== "All" ? "selected" : ""}`}
                  onClick={() => toggleDropdown("level")}
                >
                  {getFilterLabel("level", LEVEL_OPTIONS)}
                  <span className="arrow">▾</span>
                </button>
                {openDropdown === "level" && (
                  <div className="dropdown-menu">
                    {LEVEL_OPTIONS.map((opt) => (
                      <div key={opt.label} className="dropdown-item" onClick={() => selectFilterOption("level", opt.value)}>
                        {opt.label}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="controls-right">
          <div className="search-wrapper">
            <Search className="search-icon" />
            <input
              className="search-input"
              placeholder="단어 검색..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </section>

      {/* 3. 리스트 (Word Card) */}
      <section className="wordlist-content">
        {loading && <div className="loading-msg">단어장을 불러오는 중입니다... ⏳</div>}
        {!loading && error && <div className="error-msg">{error}</div>}
        
        {!loading && !error && isEmptyAll && (
          <div className="empty-msg">저장된 단어가 없습니다. 📭</div>
        )}

        {!loading && !error && !isEmptyAll && (
          <>
             {filteredAndSortedWords.length > 0 ? (
              <div className="wordlist-grid">
                {pagedWords.map((w) => {
                  const meaningPreview = w.meaning ? String(w.meaning).slice(0, 80) : "";
                  
                  return (
                    <article
                      key={w.wordId}
                      className={`word-card ${w.isCompleted ? "completed" : ""}`}
                      onClick={() => handleCardClick(w.wordId)}
                      role="button"
                      tabIndex={0}
                    >
                      {/* 1. 상단: 영단어 + 우측(배지/별) */}
                      <div className="word-card-top">
                        <h3 className={`word-card-title ${w.word.length > 12 ? "small-title" : ""}`}>{w.word}</h3>
                        <div className="word-card-actions">
                         <button
                            type="button"
                            className={`status-icon-btn no-select ${w.isCompleted ? "done" : "learning"}`}
                            onClick={(e) => handleToggleComplete(w.wordId, e)}
                          >
                            {w.isCompleted ? (
                              <CheckCircle size={18} strokeWidth={2.5} />
                            ) : (
                              <Clock size={18} strokeWidth={2.5} />
                            )}
                          </button>

                          <button
                            type="button"
                            className={`star-btn no-select ${w.isFavorite ? "active" : ""}`}
                            onClick={(e) => handleToggleFavorite(w, e)}
                          >
                            {w.isFavorite ? "★" : "☆"}
                          </button>
                        </div>
                      </div>

                      {/* 2. 태그 영역 (단어 바로 아래로 이동) */}
                      <div className="word-tags-row">
                        {w.partOfSpeech && <span className="tag tag-pos">{w.partOfSpeech}</span>}
                        {w.domain && <span className="tag tag-domain">{w.domain}</span>}
                        {typeof w.level === "number" && <span className="tag tag-level">Lv.{w.level}</span>}
                      </div>

                      {/* 3. 뜻 영역 */}
                      <div className="word-meaning-row">
                        <p className="word-meaning">{meaningPreview}</p>
                      </div>

                      {/* 4. 하단: 자세히 보기 버튼 (우측 정렬) */}
                      <div className="word-card-bottom">
                        <div className="view-detail">
                          자세히 보기 <span className="arrow">▶</span>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className="empty-msg">
                <p>조건에 맞는 단어가 없습니다. 🍂</p>
                <button className="reset-btn" onClick={resetFilters}>필터 초기화</button>
              </div>
            )}
          </>
        )}
      </section>
      {!loading && !error && filteredAndSortedWords.length > 0 && (
        <Pagination
          page={safeIndex}
          totalPages={totalPages}
          onChange={handlePageChange}
        />
)}

    </div>
  );
}

export default WordListPage;