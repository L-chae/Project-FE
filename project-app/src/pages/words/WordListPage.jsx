import React, { useEffect, useState } from "react";
// API 함수들 (경로 확인 필수!)
import { getWordList, addFavorite, removeFavorite, toggleProgress } from "../../api/wordApi";
import WordCard from "./components/WordCard";
import "./WordListPage.css";

function WordListPage() {
  // 상태 관리
  const [words, setWords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ⭐ 카드 확장 상태 (현재 열려있는 카드의 ID)
  const [expandedId, setExpandedId] = useState(null);

  // 검색 및 필터 상태
  const [search, setSearch] = useState("");
  const [mode, setMode] = useState("all"); // 'all' or 'favorite'
  
  const [filters, setFilters] = useState({
    category: "All",
    field: "All",
    level: "All",
  });

  const [dropdown, setDropdown] = useState({
    category: false,
    field: false,
    level: false,
  });

  // 1. 초기 데이터 로딩
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // API 호출 (페이지네이션 등은 추후 확장 가능)
        const data = await getWordList(1, 100);
        setWords(data.content || []);
      } catch (err) {
        console.error(err);
        setError("단어장을 불러오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // 2. 즐겨찾기 토글 (Boolean 방식)
  const handleToggleFavorite = async (word, e) => {
    e.stopPropagation(); // ⭐ 중요: 카드 클릭(펼치기) 이벤트가 발생하지 않도록 막음

    const originalWords = [...words];
    const currentStatus = word.isFavorite; // 현재 상태 (true/false)

    // 낙관적 업데이트 (UI 먼저 변경)
    setWords((prev) =>
      prev.map((w) =>
        w.wordId === word.wordId ? { ...w, isFavorite: !currentStatus } : w
      )
    );

    try {
      if (currentStatus) {
        // True였으면 -> 삭제 요청
        await removeFavorite(word.wordId);
      } else {
        // False였으면 -> 추가 요청
        await addFavorite(word.wordId);
      }
    } catch (err) {
      console.error("즐겨찾기 변경 실패", err);
      setWords(originalWords); // 에러 시 롤백
      alert("오류가 발생했습니다.");
    }
  };

  // 3. 학습 완료 토글
  const handleToggleComplete = async (wordId, e) => {
    e.stopPropagation(); // 카드 클릭 방지

    // UI 먼저 변경
    setWords((prev) =>
      prev.map((w) =>
        w.wordId === wordId ? { ...w, isCompleted: !w.isCompleted } : w
      )
    );

    try {
      await toggleProgress(wordId);
    } catch (err) {
      console.error("학습 상태 변경 실패", err);
      // 필요 시 롤백 로직 추가
    }
  };

  // 4. 카드 클릭 핸들러 (Accordion 효과)
  const handleCardClick = (wordId) => {
    // 이미 열려있으면 닫고(null), 아니면 해당 ID로 설정
    setExpandedId((prev) => (prev === wordId ? null : wordId));
  };

  // UI 핸들러들
  const handleModeChange = (type) => setMode(type);
  
  const toggleDropdown = (key) => {
    setDropdown((prev) => ({
      category: false, field: false, level: false, // 다른 건 닫고
      [key]: !prev[key], // 선택한 것만 토글
    }));
  };

  const selectFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setDropdown({ category: false, field: false, level: false }); // 선택 후 닫기
  };

  // 5. 최종 필터링 로직
  const filteredWords = words.filter((w) => {
    // 즐겨찾기 모드 체크
    if (mode === "favorite" && !w.isFavorite) return false;

    // 드롭다운 필터 체크
    if (filters.category !== "All" && w.partOfSpeech !== filters.category) return false;
    if (filters.field !== "All" && w.category !== filters.field) return false;
    if (filters.level !== "All" && `Lv.${w.level}` !== filters.level) return false;

    // 검색어 체크
    if (search && !w.word.toLowerCase().includes(search.toLowerCase())) return false;

    return true;
  });

  // 로딩/에러 화면
  if (loading) return <div className="loading-msg">단어장을 불러오는 중... ⏳</div>;
  if (error) return <div className="error-msg">{error}</div>;

  return (
    <div className="wordlist-wrapper">
      <h2 className="page-title">나의 단어장</h2>
      <p className="page-sub">저장된 단어들을 관리하고 복습하세요.</p>

      {/* 통계 및 모드 전환 */}
      <div className="stats-row">
        <div className="stats-boxes">
          <div
            className={`stats-card ${mode === "all" ? "active" : ""}`}
            onClick={() => handleModeChange("all")}
          >
            <div className="stats-icon-box purple">📘</div>
            <div className="stats-text">
              <span className="stats-label">전체 단어</span>
              <span className="stats-count">{words.length}</span>
            </div>
          </div>

          <div
            className={`stats-card ${mode === "favorite" ? "active" : ""}`}
            onClick={() => handleModeChange("favorite")}
          >
            <div className="stats-icon-box yellow">⭐</div>
            <div className="stats-text">
              <span className="stats-label">즐겨찾기</span>
              <span className="stats-count">
                {words.filter((w) => w.isFavorite).length}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 필터 및 검색 */}
      <div className="filter-search-row">
        <div className="filter-row">
          {/* 1. 카테고리 (품사) */}
          <div className="dropdown-box">
            <button
              className={`dropdown-btn ${dropdown.category ? "open" : ""} ${filters.category !== "All" ? "selected" : ""}`}
              onClick={() => toggleDropdown("category")}
            >
              {filters.category === "All" ? "카테고리" : filters.category} <span className="arrow">▾</span>
            </button>
            {dropdown.category && (
              <div className="dropdown-menu">
                {["All", "Noun", "Verb", "Adj"].map((item) => (
                  <div key={item} className="dropdown-item" onClick={() => selectFilter("category", item)}>
                    {item}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 2. 분야 */}
          <div className="dropdown-box">
            <button
              className={`dropdown-btn ${dropdown.field ? "open" : ""} ${filters.field !== "All" ? "selected" : ""}`}
              onClick={() => toggleDropdown("field")}
            >
               {filters.field === "All" ? "분야" : filters.field} <span className="arrow">▾</span>
            </button>
            {dropdown.field && (
              <div className="dropdown-menu">
                {["All", "General", "Business", "IT", "Arts", "Literature"].map((item) => (
                  <div key={item} className="dropdown-item" onClick={() => selectFilter("field", item)}>
                    {item}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 3. 난이도 */}
          <div className="dropdown-box">
            <button
              className={`dropdown-btn ${dropdown.level ? "open" : ""} ${filters.level !== "All" ? "selected" : ""}`}
              onClick={() => toggleDropdown("level")}
            >
               {filters.level === "All" ? "난이도" : filters.level} <span className="arrow">▾</span>
            </button>
            {dropdown.level && (
              <div className="dropdown-menu">
                {["All", "Lv.1", "Lv.2", "Lv.3", "Lv.4", "Lv.5", "Lv.6"].map((item) => (
                  <div key={item} className="dropdown-item" onClick={() => selectFilter("level", item)}>
                    {item}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 검색창 */}
        <div className="search-container">
          <div className="search-wrapper">
            <span className="search-icon">🔍</span>
            <input
              className="search-input"
              placeholder="단어 검색…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* 카드 리스트 */}
      <div className="card-grid">
        {filteredWords.length > 0 ? (
          filteredWords.map((w) => (
            <div key={w.wordId} onClick={() => handleCardClick(w.wordId)}>
              {/* WordCard 컴포넌트에 필요한 모든 Props 전달 */}
              <WordCard
                word={w}
                isExpanded={expandedId === w.wordId} // ⭐ 확장 여부 전달
                onToggleFavorite={(e) => handleToggleFavorite(w, e)}
                onToggleComplete={(e) => handleToggleComplete(w.wordId, e)}
              />
            </div>
          ))
        ) : (
          <div className="empty-msg">
            <p>조건에 맞는 단어가 없습니다. 🍂</p>
            <button className="reset-btn" onClick={() => {
                setFilters({ category: "All", field: "All", level: "All" });
                setSearch("");
            }}>
                필터 초기화
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default WordListPage;