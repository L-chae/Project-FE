// src/pages/words/WordDetailPage.jsx
import { ArrowLeft, BookOpen, Check, CheckCircle, Plus, Star } from "lucide-react";
import { useEffect, useRef, useState, useMemo } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";

import {
  addFavorite,
  getCompletedList,
  getFavoriteList,
  getWordDetail,
  removeFavorite,
  addWordFromCluster,
} from "../../api/wordApi";
import { getClustersByCenter, createCluster } from "../../api/wordClusterApi";
import Button from "../../components/common/Button";
import "./WordDetailPage.css";

function WordDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // ------------------------------
  // 기본 단어 정보
  // ------------------------------
  const [word, setWord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [favLoading, setFavLoading] = useState(false);

  // ------------------------------
  // 클러스터 상태 (정돈: 상태 머신)
  // ------------------------------
  const [clusterTab, setClusterTab] = useState("전체");
  const [clusterData, setClusterData] = useState({ similar: [], opposite: [] });
  const [clusterStatus, setClusterStatus] = useState("idle"); // "idle" | "loading" | "creating" | "ready" | "error"
  const [clusterError, setClusterError] = useState(null);

  // 같은 id에 대해 자동 로딩 중복 방지
  const autoClusterLoadedRef = useRef(null);

  // ✅ stale 응답 방지 토큰
  const clusterReqSeqRef = useRef(0);

  // ✅ empty라서 auto-create는 id당 1회만
  const autoCreateTriedRef = useRef(new Set());

  // ------------------------------------------------
  // 단어 상세 + 즐겨찾기/학습완료
  // ------------------------------------------------
  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    const fetchBase = async () => {
      try {
        setLoading(true);

        const [detailRes, favoriteRes, completedRes] = await Promise.all([
          getWordDetail(id),
          getFavoriteList().catch(() => []),
          getCompletedList().catch(() => []),
        ]);

        if (cancelled) return;

        const detail = detailRes || {};
        const wordId = Number(detail.wordId);

        const favoriteIds = new Set((favoriteRes || []).map((f) => Number(f.wordId)));
        const completedIds = new Set((completedRes || []).map((c) => Number(c.wordId)));

        const merged = {
          ...detail,
          isFavorite: favoriteIds.has(wordId) || !!detail.isFavorite,
          isCompleted: completedIds.has(wordId) || !!detail.isCompleted,
        };

        setWord(merged);
        setError(null);
      } catch (e) {
        if (cancelled) return;
        console.error(e);
        setError("단어 정보를 불러오지 못했습니다.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchBase();

    return () => {
      cancelled = true;
    };
  }, [id]);

  // ------------------------------------------------
  // 즐겨찾기 캐시 데이터 낙관적 업데이트
  // ------------------------------------------------
  const queryClient = useQueryClient();
  const WORDS_QUERY_KEY = useMemo(() => ["words", "list"], []);

  // ------------------------------------------------
  // ✅ id 변경 시 클러스터 요청 무효화 + 상태 초기화
  // ------------------------------------------------
  useEffect(() => {
    if (!id) return;

    // 진행 중/대기 중이던 모든 클러스터 요청을 stale 처리
    clusterReqSeqRef.current += 1;

    // 새 단어로 이동 시 잔상 제거
    setClusterData({ similar: [], opposite: [] });
    setClusterStatus("idle");
    setClusterError(null);

    // 자동 로딩 중복 방지 키 초기화
    autoClusterLoadedRef.current = null;
  }, [id]);

  // ------------------------------------------------
  // 클러스터 조회 (GET)
  // ------------------------------------------------
  const fetchClusters = async ({ useCache = true, centerId = id } = {}) => {
    if (!centerId) return null;

    const mySeq = ++clusterReqSeqRef.current;

    try {
      setClusterError(null);
      setClusterStatus("loading");

      const grouped = await getClustersByCenter(centerId, { useCache });

      if (mySeq !== clusterReqSeqRef.current) return null;
      if (String(centerId) !== String(id)) return null;

      setClusterData({
        similar: grouped?.similar || [],
        opposite: grouped?.opposite || [],
      });

      setClusterStatus("ready");
      return grouped;
    } catch (e) {
      if (mySeq !== clusterReqSeqRef.current) return null;
      if (String(centerId) !== String(id)) return null;

      console.error("연관 단어 로딩 실패", e);
      setClusterError("연관 단어를 불러오지 못했습니다.");
      setClusterStatus("error");
      return null;
    }
  };

  // ------------------------------------------------
  // 클러스터 생성 (POST -> GET)
  // ------------------------------------------------
  const runCreateCluster = async (centerId = id) => {
    if (!centerId) return null;

    const mySeq = ++clusterReqSeqRef.current;

    try {
      setClusterError(null);
      setClusterStatus("creating");

      const grouped = await createCluster(centerId);

      if (mySeq !== clusterReqSeqRef.current) return null;
      if (String(centerId) !== String(id)) return null;

      setClusterData({
        similar: grouped?.similar || [],
        opposite: grouped?.opposite || [],
      });

      setClusterStatus("ready");
      return grouped;
    } catch (e) {
      if (mySeq !== clusterReqSeqRef.current) return null;

      console.error("연관 단어 생성 실패", e);
      setClusterError("연관 단어 생성 중 오류가 발생했습니다.");
      setClusterStatus("error");
      return null;
    }
  };

  // ------------------------------------------------
  // ✅ 페이지 진입 시 자동 처리: GET -> empty면 자동 POST
  // (요청하신대로: "연관 단어 생성하기" 버튼 제거)
  // ------------------------------------------------
  useEffect(() => {
    if (!id) return;
    if (loading) return; // 상세 렌더 우선

    // 같은 id에서 중복 자동 호출 방지
    if (autoClusterLoadedRef.current === String(id)) return;
    autoClusterLoadedRef.current = String(id);

    let cancelled = false;
    let idleHandle = null;
    let timeoutHandle = null;

    const run = async () => {
      if (cancelled) return;

      const grouped = await fetchClusters({ useCache: true, centerId: id });
      if (!grouped) return;

      const empty =
        (grouped.similar?.length ?? 0) === 0 && (grouped.opposite?.length ?? 0) === 0;

      if (!empty) return;

      // empty면 자동 생성 (id당 1회만)
      if (autoCreateTriedRef.current.has(String(id))) return;
      autoCreateTriedRef.current.add(String(id));

      await runCreateCluster(id);
    };

    if (typeof window !== "undefined" && "requestIdleCallback" in window) {
      idleHandle = window.requestIdleCallback(run, { timeout: 1200 });
    } else {
      timeoutHandle = window.setTimeout(run, 150);
    }

    return () => {
      cancelled = true;
      if (idleHandle && "cancelIdleCallback" in window) {
        window.cancelIdleCallback(idleHandle);
      }
      if (timeoutHandle) window.clearTimeout(timeoutHandle);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, loading]);

  // ------------------------------------------------
  // 즐겨찾기 토글 (낙관적 업데이트 + 롤백)
  // ------------------------------------------------
  const handleToggleFavorite = async () => {
    if (!word || favLoading) return;
    const wordId = Number(word.wordId);
    if (!wordId) return;

    setFavLoading(true);
    const current = !!word.isFavorite;

    // WordDetail 낙관적 업데이트
    setWord((prev) => (prev ? { ...prev, isFavorite: !current } : prev));

    // WordList 캐시도 낙관적 업데이트 (캐시가 있을 때만)
    const previousWords = queryClient.getQueryData(WORDS_QUERY_KEY);
    if (previousWords) {
      queryClient.setQueryData(WORDS_QUERY_KEY, (old = []) =>
        old.map((w) => (Number(w.wordId) === wordId ? { ...w, isFavorite: !current } : w))
      );
    }

    try {
      if (current) await removeFavorite(wordId);
      else await addFavorite(wordId);

      // 서버와 동기화(백그라운드)
      queryClient.invalidateQueries({ queryKey: WORDS_QUERY_KEY });
    } catch (e) {
      console.error("즐겨찾기 실패", e);

      // 롤백
      setWord((prev) => (prev ? { ...prev, isFavorite: current } : prev));
      if (previousWords) queryClient.setQueryData(WORDS_QUERY_KEY, previousWords);

      alert("오류가 발생했습니다.");
    } finally {
      setFavLoading(false);
    }
  };

  // ------------------------------------------------
  // 연관 단어 → 단어장에 추가
  // ------------------------------------------------
  const handleAddClusterWord = async (targetWord, level = 1) => {
    try {
      await addWordFromCluster({ text: targetWord, level });

      setClusterData((prev) => {
        const updateGroup = (group) =>
          group.map((item) =>
            item.text === targetWord ? { ...item, inMyList: true } : item
          );

        return {
          ...prev,
          similar: updateGroup(prev.similar),
          opposite: updateGroup(prev.opposite),
        };
      });

      alert(`${targetWord} 단어를 단어장에 추가했습니다!`);
    } catch (err) {
      console.error("연관 단어 추가 실패", err);
      alert("단어 추가 실패!");
    }
  };

  const handleAddAll = (groupKey) => {
    const group = clusterData[groupKey];
    if (!group) return;

    group
      .filter((w) => !w.inMyList)
      .forEach((w) => {
        handleAddClusterWord(w.text, w.level);
      });
  };

  const handleBack = () => {
    const fromList = location.state?.from === "word-list";
    const search = location.state?.search || "";

    if (fromList) navigate(`/words${search}`);
    else navigate("/words");
  };

  // ------------------------------------------------
  // 로딩 / 에러 처리
  // ------------------------------------------------
  if (loading)
    return (
      <div className="detail-loading">
        <div className="spinner" />
      </div>
    );
  if (error) return <div className="detail-error">{error}</div>;
  if (!word) return null;

  const {
    word: text,
    meaning,
    partOfSpeech,
    domain,
    category,
    level,
    exampleSentenceEn,
    exampleSentenceKo,
    isFavorite,
    isCompleted,
  } = word;

  const displayDomain = domain || category || "";
  const displayLevel = typeof level === "number" ? level : "-";

  const hasAnyCluster =
    (clusterData.similar?.length ?? 0) > 0 || (clusterData.opposite?.length ?? 0) > 0;

  // ------------------------------------------------
  // 렌더링
  // ------------------------------------------------
  return (
    <div className="page-container">
      <div className="detail-page">
        {/* 상단 네비게이션 */}
        <div className="detail-nav">
          <button onClick={handleBack} className="back-btn">
            <ArrowLeft size={18} />
            <span className="back-label">목록으로</span>
          </button>
        </div>

        {/* 메인 헤더 */}
        <header className="detail-header">
          <div className="header-top-row">
            <div className="header-content">
              <h1 className="detail-word-title">{text}</h1>
              {meaning && <p className="detail-meaning">{meaning}</p>}
            </div>

            <button
              type="button"
              className={`fav-action-btn ${isFavorite ? "active" : ""}`}
              onClick={handleToggleFavorite}
              disabled={favLoading}
              title={isFavorite ? "즐겨찾기 해제" : "즐겨찾기 추가"}
            >
              <Star
                size={26}
                fill={isFavorite ? "currentColor" : "none"}
                strokeWidth={1.6}
              />
            </button>
          </div>

          <div className="header-bottom-row">
            <div className="detail-tags-row">
              {typeof level === "number" && (
                <span className="tag tag-level">Lv.{displayLevel}</span>
              )}
              {partOfSpeech && <span className="tag tag-pos">{partOfSpeech}</span>}
              {displayDomain && <span className="tag tag-domain">{displayDomain}</span>}
            </div>

            <div className={`status-badge ${isCompleted ? "done" : "todo"}`}>
              <CheckCircle size={16} />
              <span className="status-label">{isCompleted ? "학습 완료" : "학습 예정"}</span>
            </div>
          </div>
        </header>

        {/* 본문 2단 그리드 */}
        <div className="detail-grid">
          {/* 왼쪽: 예문 */}
          <div className="detail-left-col">
            <section className="detail-card example-section">
              <div className="card-label">
                <BookOpen size={16} />
                <span>예문</span>
              </div>
              {exampleSentenceEn || exampleSentenceKo ? (
                <div className="example-box">
                  {exampleSentenceEn && <p className="example-en">{exampleSentenceEn}</p>}
                  {exampleSentenceKo && <p className="example-ko">{exampleSentenceKo}</p>}
                </div>
              ) : (
                <p className="no-data-text">등록된 예문이 없습니다.</p>
              )}
            </section>
          </div>

          {/* 오른쪽: 연관 단어(클러스터) */}
          <div className="detail-right-col">
            <section className="detail-card cluster-section">
              <div className="cluster-header">
                <h3>연관 단어</h3>
                <div className="cluster-tabs">
                  {["전체", "similar", "opposite"].map((tab) => (
                    <button
                      key={tab}
                      className={`cluster-tab ${clusterTab === tab ? "active" : ""}`}
                      onClick={() => setClusterTab(tab)}
                    >
                      {tab === "전체" ? "All" : tab === "similar" ? "유의어" : "반의어"}
                    </button>
                  ))}
                </div>
              </div>

              <div className="cluster-content">
                {/* 로딩/생성 스피너 */}
                {(clusterStatus === "loading" || clusterStatus === "creating") && (
                  <div className="cluster-loading">
                    <div className="spinner small" />
                    <span>
                      {clusterStatus === "creating"
                        ? "연관 단어를 생성하는 중입니다..."
                        : "연관 단어를 불러오는 중입니다..."}
                    </span>
                  </div>
                )}

                {/* 에러 */}
                {clusterStatus === "error" && (
                  <div className="cluster-empty-box">
                    <p className="no-data-text">{clusterError || "오류가 발생했습니다."}</p>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => fetchClusters({ useCache: false, centerId: id })}
                    >
                      다시 시도
                    </Button>
                  </div>
                )}

                {/* 성공: 데이터 없음 */}
                {clusterStatus === "ready" && !hasAnyCluster && (
                  <div className="cluster-empty-box">
                    <p className="no-data-text">연관 단어가 없습니다.</p>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => fetchClusters({ useCache: false, centerId: id })}
                    >
                      새로고침
                    </Button>
                  </div>
                )}

                {/* 성공: 데이터 있음 */}
                {clusterStatus === "ready" && hasAnyCluster && (
                  <>
                    {/* 유의어 */}
                    {(clusterTab === "전체" || clusterTab === "similar") && (
                      <div className="cluster-group">
                        <div className="group-title-row">
                          <h4>유의어 (Similar)</h4>
                          <button
                            className="text-btn-small"
                            onClick={() => handleAddAll("similar")}
                          >
                            모두 추가
                          </button>
                        </div>
                        <div className="chip-grid">
                          {clusterData.similar.map((item) => (
                            <div
                              className={`word-chip ${
                                item.inMyList ? "word-chip--selected" : "word-chip--unselected"
                              }`}
                              key={item.id ?? item.text}
                            >
                              <div className="chip-main">
                                <div className="chip-header-row">
                                  <span className="chip-word">{item.text}</span>
                                  {typeof item.level === "number" && (
                                    <span className={`chip-lv chip-lv--${item.level}`}>
                                      Lv.{item.level}
                                    </span>
                                  )}
                                </div>
                                {item.meaning && <p className="chip-meaning">{item.meaning}</p>}
                              </div>

                              {item.inMyList ? (
                                <span className="chip-check">
                                  <Check size={14} />
                                </span>
                              ) : (
                                <button
                                  className="chip-add-btn"
                                  onClick={() => handleAddClusterWord(item.text, item.level)}
                                >
                                  <Plus size={14} />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 반의어 */}
                    {(clusterTab === "전체" || clusterTab === "opposite") && (
                      <div className="cluster-group">
                        <div className="group-title-row">
                          <h4>반의어 (Opposite)</h4>
                          <button
                            className="text-btn-small"
                            onClick={() => handleAddAll("opposite")}
                          >
                            모두 추가
                          </button>
                        </div>
                        <div className="chip-grid">
                          {clusterData.opposite.map((item) => (
                            <div
                              className={`word-chip ${
                                item.inMyList ? "word-chip--selected" : "word-chip--unselected"
                              }`}
                              key={item.id ?? item.text}
                            >
                              <div className="chip-main">
                                <div className="chip-header-row">
                                  <span className="chip-word">{item.text}</span>
                                  {typeof item.level === "number" && (
                                    <span className={`chip-lv chip-lv--${item.level}`}>
                                      Lv.{item.level}
                                    </span>
                                  )}
                                </div>
                                {item.meaning && <p className="chip-meaning">{item.meaning}</p>}
                              </div>

                              {item.inMyList ? (
                                <span className="chip-check">
                                  <Check size={14} />
                                </span>
                              ) : (
                                <button
                                  className="chip-add-btn"
                                  onClick={() => handleAddClusterWord(item.text, item.level)}
                                >
                                  <Plus size={14} />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}

                {/* idle */}
                {clusterStatus === "idle" && (
                  <div className="cluster-loading">
                    <div className="spinner small" />
                    <span>연관 단어 준비 중...</span>
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

export default WordDetailPage;