// src/pages/wrongnote/WrongNotePage.jsx
import { RotateCcw, FileQuestion, Layers, BookOpen } from "lucide-react";
import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import { getWrongList } from "../../api/wrongApi";
import FilterDropdown from "../../components/common/FilterDropdown";
import Pagination from "../../components/common/Pagination";
import EmptyState from "../../components/common/EmptyState";
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

// 스토리 사용 여부 판별 (normalize 기준: "Y" / "N")
const isUsedInStory = (item) => item?.isUsedInStory === "Y";

// 오답 횟수 (normalize 기준)
const getWrongCount = (item) => item?.totalWrong ?? 0;

// 마지막 오답 시각 (정렬용, normalize 기준: wrongAt)
const getLastWrongTime = (item) => {
  const raw = item?.wrongAt;
  if (!raw) return 0;
  const t = new Date(raw).getTime();
  return Number.isNaN(t) ? 0 : t;
};

export default function WrongNotePage() {
  const navigate = useNavigate();

  // 필터 상태
  const [filters, setFilters] = useState({
    isUsedInStory: "", // "", "Y", "N"
    sortBy: "latest", // latest | oldest | mostWrong
  });

  // UI 상태
  const [selectedIds, setSelectedIds] = useState([]); // wrongWordId[]
  const [page, setPage] = useState(0);
  const [openDropdown, setOpenDropdown] = useState(null); // "story" | "sort" | null
  const [activeAction, setActiveAction] = useState("none"); // quiz | card | story | none

  // “이미 스토리에 사용된 단어 포함” 안내 모달 상태
  const [usedStoryModal, setUsedStoryModal] = useState({
    open: false,
    onlyUsed: false,
    usedWords: [],
  });

  // React Query: 오답 목록 조회
  const {
    data: rawItems = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["wrongNotes", "list"],
    queryFn: getWrongList,
  });

  // 선택된 wrongWordId → wordId 리스트 변환 (퀴즈/카드용)
  const selectedWordIds = useMemo(() => {
    if (!selectedIds.length || !rawItems.length) return [];
    const idSet = new Set(selectedIds);
    return rawItems
      .filter((item) => idSet.has(item.wrongWordId))
      .map((item) => Number(item.wordId))
      .filter((id) => !Number.isNaN(id));
  }, [selectedIds, rawItems]);

  const selectedCount = selectedIds.length;

  // 필터 활성 여부 (초기화 버튼 노출 조건)
  const isFilterActive =
    filters.isUsedInStory !== "" || filters.sortBy !== "latest";

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

  // 페이지네이션 계산
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

  // 액션: 퀴즈 (선택한 wordId 기반)
  const handleReviewAsQuiz = () => {
    if (selectedWordIds.length === 0) return;
    const ids = selectedWordIds.join(",");
    navigate(
      `/learning/quiz?source=wrong-note&wordIds=${encodeURIComponent(ids)}`
    );
  };

  // 액션: 카드 (선택한 wordId 기반)
  const handleReviewAsCard = () => {
    if (selectedWordIds.length === 0) return;
    const ids = selectedWordIds.join(",");
    navigate(
      `/learning/card?source=wrong-note&wordIds=${encodeURIComponent(ids)}`
    );
  };

  // 액션: 스토리 만들기 (wrongWordId 기반)
  const handleCreateStory = () => {
    if (selectedCount === 0) return;

    const selectedItems = rawItems.filter((item) =>
      selectedIds.includes(item.wrongWordId)
    );

    const usedSelected = selectedItems.filter((item) =>
      isUsedInStory(item)
    );
    const unusedSelected = selectedItems.filter(
      (item) => !isUsedInStory(item)
    );

    // 1) 선택한 것 중에 이미 스토리에 사용된 단어가 하나라도 있으면 → 모달로 안내 후 생성 막기
    if (usedSelected.length > 0) {
      setUsedStoryModal({
        open: true,
        onlyUsed: unusedSelected.length === 0,
        usedWords: usedSelected
          .map((item) => item.word)
          .filter((w) => typeof w === "string" && w.trim().length > 0),
      });
      return;
    }

    // 2) 사용된 단어는 없고, 미사용 단어만 선택된 경우에만 실제 생성 진행
    if (unusedSelected.length === 0) {
      // 여기까지 왔는데 이 케이스는 거의 없지만, 안전상 한 번 더 방어
      return;
    }

    const ids = unusedSelected.map((i) => i.wrongWordId).join(",");
    navigate(`/stories/create?wrongWordIds=${encodeURIComponent(ids)}`);
  };

  const handleRowClick = (item) => {
    console.log("row clicked:", item);
  };

  // Empty / 표시 상태 계산
  const hasAnyItems = rawItems.length > 0;
  const hasProcessedItems = processedItems.length > 0;

  const showEmptyNoData = !isLoading && !isError && !hasAnyItems;
  const showEmptyFiltered =
    !isLoading && !isError && hasAnyItems && !hasProcessedItems;
  const showTable = !isLoading && !isError && hasProcessedItems;

  const closeUsedStoryModal = () => {
    setUsedStoryModal((prev) => ({
      ...prev,
      open: false,
    }));
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

      {/* 필터 / 액션 영역 (리스트 있을 때만 노출) */}
      {showTable && (
        <>
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
                className={`sl-btn sl-btn--quiz ${
                  activeAction === "quiz" ? "sl-btn-primary" : ""
                }`}
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
                className={`sl-btn sl-btn--card ${
                  activeAction === "card" ? "sl-btn-primary" : ""
                }`}
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
                className={`sl-btn sl-btn--story ${
                  activeAction === "story" ? "sl-btn-primary" : ""
                }`}
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
        </>
      )}

      {/* 로딩 / 에러 */}
      {isLoading && (
        <div className="wrongnote-list__loading">로딩 중...</div>
      )}

      {isError && !isLoading && (
        <div className="wrongnote-list__error">
          <p>오답 기록을 불러오는 중 오류가 발생했습니다.</p>
          <button className="retry-btn" onClick={() => refetch()}>
            다시 시도
          </button>
        </div>
      )}

      {/* Empty 상태 */}
      {!isLoading && !isError && showEmptyNoData && (
        <EmptyState
          icon={FileQuestion}
          title="오답 기록이 없습니다."
          description="퀴즈나 학습을 진행하면, 틀린 단어들이 여기에 모입니다."
          actionLabel="이전 페이지로 돌아가기"
          onAction={() => navigate(-1)}
          variant="page"
        />
      )}

      {!isLoading && !isError && showEmptyFiltered && (
        <EmptyState
          icon={FileQuestion}
          title="조건에 맞는 오답 기록이 없습니다."
          description="스토리 / 정렬 조건을 변경하거나, 다른 목록으로 이동해 보세요."
          actionLabel="이전 페이지로 돌아가기"
          onAction={() => navigate(-1)}
          variant="page"
        />
      )}

      {/* 리스트 + 테이블 */}
      {showTable && (
        <>
          <section className="wrongnote-list">
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
                            return prev.filter(
                              (id) => !pageIds.includes(id)
                            );
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
          </section>

          {/* 페이지네이션 */}
          {totalPages > 0 && (
            <div className="wrongnote-pagination">
              <Pagination
                page={page}
                totalPages={totalPages}
                onChange={setPage}
              />
            </div>
          )}
        </>
      )}

      {/* “이미 스토리에 사용된 단어 포함” 안내 모달 */}
      {usedStoryModal.open && (
        <div className="wrongnote-modal-backdrop">
          <div className="wrongnote-modal">
            <h2 className="wrongnote-modal__title">스토리를 만들 수 없어요</h2>

            <p className="wrongnote-modal__body">
              {usedStoryModal.onlyUsed
                ? "선택한 단어가 모두 이미 스토리에 사용된 단어예요.\n새 스토리를 만들려면, 아직 스토리에 쓰지 않은 오답 단어를 선택해 주세요."
                : "선택한 단어 중에 이미 스토리에 사용된 단어가 있어요.\n새 스토리는 ‘스토리에 미사용’ 단어만 넣을 수 있어요.\n아래 단어를 선택 해제한 뒤 다시 시도해 주세요."}
            </p>

            {usedStoryModal.usedWords.length > 0 && (
              <ul className="wrongnote-modal__list">
                {usedStoryModal.usedWords.map((w) => (
                  <li key={w}>{w}</li>
                ))}
              </ul>
            )}

            <button
              type="button"
              className="wrongnote-modal__button"
              onClick={closeUsedStoryModal}
            >
              확인
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
