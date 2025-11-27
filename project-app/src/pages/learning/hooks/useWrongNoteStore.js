import { useEffect, useState, useCallback } from 'react';
import { fetchWrongNotes } from './../../../api/learningApi';

export function useWrongNoteStore(initialFilters = {}) {
  const [items, setItems] = useState([]);
  const [filters, setFilters] = useState({
    fromDate: '',
    toDate: '',
    tag: '',
    isUsedInStory: '',
    page: 1,
    pageSize: 20,
    ...initialFilters,
  });
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    pageSize: 20,
  });
  const [loading, setLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchWrongNotes(filters);
      // 응답 형태는 백엔드에 맞게 수정
      setItems(res.items || []);
      setPagination({
        total: res.total || 0,
        page: res.page || filters.page,
        pageSize: res.pageSize || filters.pageSize,
      });
    } catch (e) {
      console.error(e);
      setError(e);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    load();
  }, [load]);

  const setPage = (page) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const clearSelection = () => setSelectedIds([]);

  return {
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
    refresh: load,
  };
}
