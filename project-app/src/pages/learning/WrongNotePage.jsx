// src/pages/wrongnote/WrongNotePage.jsx
import {
  ChevronDown,
  RotateCcw,
  FileQuestion,
  Layers,
  BookOpen,
} from "lucide-react";

import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getWrongList } from "../../api/wrongApi";
import FilterDropdown from "../../components/common/FilterDropdown";
import Pagination from "../../components/common/Pagination";
import { WrongNoteItem } from "./components/WrongNoteItem";

import "./WrongNotePage.css";

const PAGE_SIZE = 10;

const STORY_FILTER_OPTIONS = [
  { label: "스토리 전체", value: "" },
  { label: "미사용", value: "N" },
  { label: "사용됨", value: "Y" },
];

const SORT_FILTER_OPTIONS = [
  { label: "최신순", value: "latest" },
  { label: "오래된순", value: "oldest" },
  { label: "많이 틀린순", value: "mostWrong" },
];

// 스토리 사용 여부 판별
const isUsedInStory = (item) =>
  item?.isUsedInStory === "Y" ||
  item?.isUsedInStory === "y" ||
  item?.isUsedInStory === true;

// 오답 횟수
const getWrongCount = (item) =>
  item?.totalWrong ?? item?.wrongCount ?? item?.wrong ?? 0;

// 마지막 오답 시각 (정렬용)
const getLastWrongTime = (item) => {
  const raw = item?.lastWrongAt || item?.wrongAt || item?.wrong_at;
  if (!raw) return 0;
  const t = new Date(raw).getTime();
  return Number.isNaN(t) ? 0 : t;
};

export default function WrongNotePage() {
  const navigate = useNavigate();

  // 원본 데이터
  const [rawItems, setRawItems] = useState([]);

  // 필터 상태
  const [filters, setFilters] = useState({
    isUsedInStory: "", // "", "Y", "N"
    sortBy: "latest",  // latest | oldest | mostWrong
  });

  // 필터 활성 여부 (초기화 버튼 노출 조건)
  const isFilterActive =
    filters.isUsedInStory !== "" || filters.sortBy !== "latest";

  // UI 상태
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]); // wrongWordId[]
  const [page, setPage] = useState(0);
  const [openDropdown, setOpenDropdown] = useState(null); // "story" | "sort" | null
  const [activeAction, setActiveAction] = useState("none"); // quiz | card | story | none

  // 데이터 로딩
  const refresh = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await getWrongList();
      setRawItems(Array.isArray(data) ? data : []);
      setSelectedIds([]);
      setPage(0);
    } catch (e) {
      console.error("오답 목록 조회 실패:", e);
      setError("오답 기록을 불러오는 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  // 필터 변경
  const handleChangeFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(0);
  };

  // 드롭다운 토글
  const handleDropdownToggle = (id) => {
    setOpenDropdown((prev) => (prev === id ? null : id));
  };

  // 드롭다운 값 변경
  const handleDropdownChange = (id, nextValue) => {
    if (id === "story") {
      handleChangeFilter("isUsedInStory", nextValue);
    } else if (id === "sort") {
      handleChangeFilter("sortBy", nextValue);
    }
    setOpenDropdown(null);
  };

  // 필터 초기화
  const handleResetFilters = () => {
    setFilters({
      isUsedInStory: "",
      sortBy: "latest",
    });
    setPage(0);
    setOpenDropdown(null);
  };

  // 필터 + 정렬 적용
  const processedItems = useMemo(() => {
    const { isUsedInStory: usedFilter, sortBy } = filters;

    const filtered = rawItems.filter((item) => {
      const used = isUsedInStory(item);
      if (usedFilter === "Y") return used;
      if (usedFilter === "N") return !used;
      return true;
    });

    const sorted = [...filtered].sort((a, b) => {
      const aDate = getLastWrongTime(a);
      const bDate = getLastWrongTime(b);
      const aWrong = getWrongCount(a);
      const bWrong = getWrongCount(b);

      switch (sortBy) {
        case "oldest":
          return aDate - bDate;
        case "mostWrong":
          if (bWrong !== aWrong) return bWrong - aWrong;
          return bDate - aDate;
        case "latest":
        default:
          return bDate - aDate;
      }
    });

    return sorted;
  }, [rawItems, filters]);

  // 페이지네이션
  const totalPages = useMemo(
    () => Math.ceil(processedItems.length / PAGE_SIZE) || 0,
    [processedItems.length]
  );

  const pagedItems = useMemo(() => {
    const start = page * PAGE_SIZE;
    return processedItems.slice(start, start + PAGE_SIZE);
  }, [processedItems, page]);

  // 현재 page가 범위를 넘어가면 보정
  useEffect(() => {
    if (page > 0 && page >= totalPages) {
      setPage(Math.max(0, totalPages - 1));
    }
  }, [page, totalPages]);

  // 선택 처리
  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const selectedCount = selectedIds.length;

  // 액션: 퀴즈
  const handleReviewAsQuiz = () => {
    if (selectedCount === 0) return;
    const ids = selectedIds.join(",");
    navigate(
      `/learning/quiz?source=wrong-note&wrongWordIds=${encodeURIComponent(ids)}`
    );
  };

  // 액션: 카드
  const handleReviewAsCard = () => {
    if (selectedCount === 0) return;
    const ids = selectedIds.join(",");
    navigate(
      `/learning/card?source=wrong-note&wrongWordIds=${encodeURIComponent(ids)}`
    );
  };

  // 액션: 스토리 만들기
  const handleCreateStory = () => {
    if (selectedCount === 0) return;

    const candidateItems = rawItems.filter(
      (item) => selectedIds.includes(item.wrongWordId) && !isUsedInStory(item)
    );

    if (candidateItems.length === 0) {
      alert("스토리에 사용되지 않은 단어를 선택해 주세요.");
      return;
    }

    const ids = candidateItems.map((i) => i.wrongWordId).join(",");
    navigate(`/stories/create?wrongWordIds=${encodeURIComponent(ids)}`);
  };

  const handleRowClick = (item) => {
    console.log("row clicked:", item);
  };

  return (
   <div className="page-container wrongnote-page">
      {/* 헤더 */}
      <header className="wrongnote-header">
        <h1>오답 노트</h1>
        <p className="wrongnote-header__subtitle">
          틀렸던 단어들을 모아서 다시 학습합니다.
        </p>
      </header>

      {/* 헤더 하단 필터 + 초기화 버튼 */}
     <section className="wrongnote-header__filters">
  <FilterDropdown
    id="story"
    label="스토리"
    options={STORY_FILTER_OPTIONS}
    value={filters.isUsedInStory}
    isOpen={openDropdown === "story"}
    onToggle={handleDropdownToggle}
    onChange={handleDropdownChange}
  />

  <FilterDropdown
    id="sort"
    label="정렬"
    options={SORT_FILTER_OPTIONS}
    value={filters.sortBy}
    isOpen={openDropdown === "sort"}
    onToggle={handleDropdownToggle}
    onChange={handleDropdownChange}
  />

  {isFilterActive && (
    <button
      type="button"
      className="filter-reset-btn"
      onClick={handleResetFilters}
      title="필터 초기화"
    >
      <RotateCcw size={16} />
    </button>
  )}
</section>

      {/* 선택 단어 액션 영역 */}
 <section className="wrongnote-actions">
  <div className="wrongnote-actions__left">
    <span className="wrongnote-selected-count">
      선택한 오답 {selectedCount}개
    </span>
  </div>

  <div className="wrongnote-actions__right">
    <button
      type="button"
      disabled={selectedCount === 0}
      className={`sl-btn sl-btn--quiz ${activeAction === "quiz" ? "sl-btn-primary" : "" }`}
      onClick={() => {
        handleReviewAsQuiz();
        setActiveAction("quiz");
      }}
    >
      <FileQuestion size={16} />
      <span>퀴즈 풀기</span>
    </button>

    <button
      type="button"
      disabled={selectedCount === 0}
      className={`sl-btn sl-btn--card ${activeAction === "card" ? "sl-btn-primary" : ""}`}
      onClick={() => {
        handleReviewAsCard();
        setActiveAction("card");
      }}
    >
      <Layers size={16} />
      <span>카드로 보기</span>
    </button>

    <button
      type="button"
      disabled={selectedCount === 0}
      className={`sl-btn sl-btn--story ${activeAction === "story" ? "sl-btn-primary" : ""}`}
      onClick={() => {
        handleCreateStory();
        setActiveAction("story");
      }}
    >
      <BookOpen size={16} />
      <span>스토리 만들기</span>
    </button>
  </div>
</section>

      {/* 리스트 영역 */}
      <section className="wrongnote-list">
        {loading && (
          <div className="wrongnote-list__loading">로딩 중...</div>
        )}

        {error && <div className="wrongnote-list__error">{error}</div>}

        {!loading && !error && processedItems.length === 0 && (
          <div className="wrongnote-list__empty">오답 기록이 없습니다.</div>
        )}

        {!loading && !error && processedItems.length > 0 && (
          <table className="wrongnote-table">
            <thead>
              <tr>
                <th>
                  {/* 현재 페이지 전체 선택/해제 */}
                  <input
                    type="checkbox"
                    className="sl-checkbox"
                    checked={
                      pagedItems.length > 0 &&
                      pagedItems.every((item) =>
                        selectedIds.includes(item.wrongWordId)
                      )
                    }
                    onChange={(e) => {
                      const { checked } = e.target;
                      setSelectedIds((prev) => {
                        if (checked) {
                          const idsToAdd = pagedItems
                            .map((i) => i.wrongWordId)
                            .filter((id) => !prev.includes(id));
                          return [...prev, ...idsToAdd];
                        } else {
                          const pageIds = pagedItems.map(
                            (i) => i.wrongWordId
                          );
                          return prev.filter((id) => !pageIds.includes(id));
                        }
                      });
                    }}
                  />
                </th>
                <th>단어</th>
                <th>뜻</th>
                <th>난이도</th>
                <th>마지막 오답</th>
                <th>오답 횟수</th>
                <th>스토리</th>
              </tr>
            </thead>

            <tbody>
              {pagedItems.map((item) => (
                <WrongNoteItem
                  key={item.wrongWordId}
                  item={item}
                  selected={selectedIds.includes(item.wrongWordId)}
                  onToggleSelect={(e) => {
                    e.stopPropagation();
                    toggleSelect(item.wrongWordId);
                  }}
                  onClick={() => handleRowClick(item)}
                />
              ))}
            </tbody>
          </table>
        )}
      </section>

      {/* 페이지네이션 */}
      <div className="wrongnote-pagination">
        <Pagination page={page} totalPages={totalPages} onChange={setPage} />
      </div>
    </div>
  );
}
