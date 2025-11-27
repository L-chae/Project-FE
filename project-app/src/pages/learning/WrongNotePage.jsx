import { useNavigate } from 'react-router-dom';
import { useWrongNoteStore } from './hooks/useWrongNoteStore';
import { WrongNoteItem } from './components/WrongNoteItem';
import './WrongNotePage.css';

export default function WrongNotePage() {
  const navigate = useNavigate();
  const {
    items,
    filters,
    setFilters,
    pagination,
    setPage,
    loading,
    error,
    selectedIds,
    toggleSelect,
    clearSelection,
    refresh,
  } = useWrongNoteStore();

  const handleChangeFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  const handleReviewAsQuiz = () => {
    if (selectedIds.length === 0) return;
    const ids = selectedIds.join(',');
    navigate(`/learning/quiz?source=wrong-notes&wrongWordIds=${encodeURIComponent(ids)}`);
  };

  const handleReviewAsCard = () => {
    if (selectedIds.length === 0) return;
    const ids = selectedIds.join(',');
    navigate(`/learning/card?source=wrong-notes&wrongWordIds=${encodeURIComponent(ids)}`);
  };

  const handleCreateStory = () => {
    if (selectedIds.length === 0) return;
    const ids = selectedIds.join(',');
    navigate(`/stories/create?wrongWordIds=${encodeURIComponent(ids)}`);
  };

  const handleRowClick = (item) => {
    // 상세 모달 or 단어 상세 페이지로 연결
    // 예: navigate(`/words/${item.wordId}`);
  };

  return (
    <div className="wrongnote-page">
      <header className="wrongnote-header">
        <h1>오답 노트</h1>
        <p className="wrongnote-header__subtitle">
          틀렸던 단어들을 모아서 다시 학습합니다.
        </p>
      </header>

      <section className="wrongnote-filters">
        <div className="wrongnote-filter-group">
          <label>
            시작일
            <input
              type="date"
              value={filters.fromDate || ''}
              onChange={(e) => handleChangeFilter('fromDate', e.target.value)}
            />
          </label>
          <label>
            종료일
            <input
              type="date"
              value={filters.toDate || ''}
              onChange={(e) => handleChangeFilter('toDate', e.target.value)}
            />
          </label>
          <label>
            TAG
            <select
              value={filters.tag}
              onChange={(e) => handleChangeFilter('tag', e.target.value)}
            >
              <option value="">전체</option>
              <option value="quiz">퀴즈</option>
              <option value="card">카드</option>
              <option value="exam">모의고사</option>
            </select>
          </label>
          <label>
            스토리 사용 여부
            <select
              value={filters.isUsedInStory}
              onChange={(e) => handleChangeFilter('isUsedInStory', e.target.value)}
            >
              <option value="">전체</option>
              <option value="N">스토리 미사용</option>
              <option value="Y">스토리 사용됨</option>
            </select>
          </label>
          <button type="button" onClick={refresh}>
            필터 적용
          </button>
        </div>
      </section>

      <section className="wrongnote-actions">
        <button
          type="button"
          disabled={selectedIds.length === 0}
          onClick={handleReviewAsQuiz}
        >
          선택 단어 퀴즈로 복습
        </button>
        <button
          type="button"
          disabled={selectedIds.length === 0}
          onClick={handleReviewAsCard}
        >
          선택 단어 카드로 복습
        </button>
        <button
          type="button"
          disabled={selectedIds.length === 0}
          onClick={handleCreateStory}
        >
          선택 오답으로 AI 스토리 생성
        </button>
        {selectedIds.length > 0 && (
          <button type="button" onClick={clearSelection}>
            선택 해제
          </button>
        )}
      </section>

      <section className="wrongnote-list">
        {loading && <div className="wrongnote-list__loading">로딩 중...</div>}
        {error && (
          <div className="wrongnote-list__error">오답 기록을 불러오는 중 오류 발생</div>
        )}
        {!loading && !error && items.length === 0 && (
          <div className="wrongnote-list__empty">오답 기록이 없습니다.</div>
        )}

        {!loading && !error && items.length > 0 && (
          <table className="wrongnote-table">
            <thead>
              <tr>
                <th />
                <th>단어</th>
                <th>뜻</th>
                <th>마지막 오답</th>
                <th>정답/오답</th>
                <th>상태</th>
                <th>TAG</th>
                <th>스토리</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
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

        {/* 단순 페이지네이션 예시 */}
        {pagination.total > pagination.pageSize && (
          <div className="wrongnote-pagination">
            <button
              type="button"
              disabled={pagination.page <= 1}
              onClick={() => setPage(pagination.page - 1)}
            >
              이전
            </button>
            <span>
              {pagination.page} /{' '}
              {Math.ceil(pagination.total / pagination.pageSize)}
            </span>
            <button
              type="button"
              disabled={
                pagination.page >=
                Math.ceil(pagination.total / pagination.pageSize)
              }
              onClick={() => setPage(pagination.page + 1)}
            >
              다음
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
