// src/pages/words/WordDetailPage.jsx
import {
  ArrowLeft,
  BookOpen,
  CheckCircle,
  Star,
  Share2,
  BarChart3,
  Layers,
} from "lucide-react";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";

import {
  addFavorite,
  getFavoriteList,
  getWordDetail,
  removeFavorite,
  getStudyLog,
} from "../../api/wordApi";
import { getStudyStatus } from "../../api/studyApi";
import { getClustersByCenter, createCluster } from "@/api/wordClusterApi";
import Button from "@/components/common/Button";
import Spinner from "@/components/common/Spinner";
import Card from "@/components/common/Card";
import "./WordDetailPage.css";

const WORDS_QUERY_KEY = ["words", "list"];

// ================================
// 표시용 라벨(품사/분야) 변환 유틸
// ================================
const POS_TO_GROUP = {
  noun: "NOUN",

  verb: "VERB",
  "linking verb": "VERB",
  "modal verb": "VERB",

  adjective: "ADJ_ADV",
  adverb: "ADJ_ADV",

  pronoun: "FUNC",
  preposition: "FUNC",
  conjunction: "FUNC",
  determiner: "FUNC",
  "definite article": "FUNC",
  "indefinite article": "FUNC",
  "infinitive marker": "FUNC",

  number: "NUM",
  "ordinal number": "NUM",

  exclamation: "ETC",
};

const getPosGroup = (posRaw) => {
  const pos = String(posRaw ?? "").trim().toLowerCase();
  return POS_TO_GROUP[pos] ?? "ETC";
};

const POS_GROUP_LABEL = {
  NOUN: "명사",
  VERB: "동사",
  ADJ_ADV: "형용사·부사",
  FUNC: "기능어",
  NUM: "수·서수",
  ETC: "감탄·기타",
};

const getPosLabel = (posRaw) =>
  POS_GROUP_LABEL[getPosGroup(posRaw)] ?? "감탄·기타";

const DOMAIN_LABEL = {
  "Daily Life": "일상생활",
  "People & Feelings": "사람/감정",
  Business: "직장/비즈니스",
  "School & Learning": "학교/학습",
  Travel: "여행/교통",
  "Food & Health": "음식/건강",
  Technology: "기술/IT",
};

const getDomainLabel = (v) => DOMAIN_LABEL[v] ?? v;

// ================================
// 학습 완료 판정 유틸
// ================================
const normalizeStudyStatus = (raw) => String(raw ?? "none").trim().toLowerCase();

const isStudyCompleted = (rawStatus) => {
  const s = normalizeStudyStatus(rawStatus);
  return s === "correct" || s === "learned" || s === "completed" || s === "done";
};

// ================================
// Cluster timeout
// ================================
const CLUSTER_TIMEOUT_MS = 8000;

const withTimeout = (promise, ms = CLUSTER_TIMEOUT_MS) =>
  Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), ms)),
  ]);

// ---- Chip 컴포넌트 (memo) ----
const ClusterChip = React.memo(function ClusterChip({ item, onOpen }) {
  return (
    <button
      type="button"
      className={`word-chip ${item.inMyList ? "word-chip--selected" : "word-chip--unselected"}`}
      onClick={() => onOpen(item)}
      title="단어 상세로 이동"
    >
      <div className="chip-main">
        <div className="chip-header-row">
          <span className="chip-word">{item.text}</span>
          <span className="chip-meaning-inline" title={item.meaning || ""}>
            {item.meaning?.trim() ? item.meaning : "-"}
          </span>
        </div>
      </div>
    </button>
  );
});

function WordDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [word, setWord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [favLoading, setFavLoading] = useState(false);

  const [studyLog, setStudyLog] = useState(null);
  const [studyLogLoading, setStudyLogLoading] = useState(false);

  const [clusterTab, setClusterTab] = useState("전체");
  const [clusterData, setClusterData] = useState({ similar: [], opposite: [] });
  const [clusterStatus, setClusterStatus] = useState("idle");
  const [clusterError, setClusterError] = useState(null);

  const clusterReqSeqRef = useRef(0);
  const autoCreateTriedRef = useRef(new Set());

  const queryClient = useQueryClient();

  // ------------------------------
  // 단어 상세 로드
  // ------------------------------
  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    const fetchBase = async () => {
      try {
        setLoading(true);

        const [detailRes, favoriteRes, studyRes] = await Promise.all([
          getWordDetail(id),
          getFavoriteList().catch(() => []),
          getStudyStatus(id).catch(() => ({ status: "none" })),
        ]);

        if (cancelled) return;

        const detail = detailRes || {};
        const wordId = Number(detail.wordId);

        const favoriteIds = new Set((favoriteRes || []).map((f) => Number(f.wordId)));

        const rawStudyStatus = normalizeStudyStatus(studyRes?.status);

        setWord({
          ...detail,
          isFavorite: favoriteIds.has(wordId) || !!detail.isFavorite,
          isCompleted: isStudyCompleted(rawStudyStatus),
          studyStatus: rawStudyStatus, // ✅ 원본 상태 보관(재학습 분기용)
        });
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

  // ✅ 학습하고 뒤로 돌아왔을 때 완료 상태 재동기화
  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    (async () => {
      try {
        const studyRes = await getStudyStatus(id).catch(() => ({ status: "none" }));
        if (cancelled) return;

        const rawStudyStatus = normalizeStudyStatus(studyRes?.status);

        setWord((prev) =>
          prev
            ? {
                ...prev,
                isCompleted: isStudyCompleted(rawStudyStatus),
                studyStatus: rawStudyStatus,
              }
            : prev
        );
      } catch (e) {
        console.error("학습 상태 갱신 실패", e);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [id, location.key]);

  // ------------------------------
  // id 변경 시 클러스터 초기화
  // ------------------------------
  useEffect(() => {
    if (!id) return;

    clusterReqSeqRef.current += 1;
    setClusterData({ similar: [], opposite: [] });
    setClusterStatus("idle");
    setClusterError(null);
    setClusterTab("전체");
  }, [id]);

  // ------------------------------
  // 학습 통계 조회
  // ------------------------------
  useEffect(() => {
    const wordId = Number(word?.wordId);
    if (!wordId || Number.isNaN(wordId)) return;

    let cancelled = false;

    const fetchStudyLog = async () => {
      try {
        setStudyLogLoading(true);
        const logData = await getStudyLog(wordId);
        if (cancelled) return;
        setStudyLog(logData);
      } catch (e) {
        if (cancelled) return;
        console.error("학습 통계 조회 실패:", e);
        setStudyLog(null);
      } finally {
        if (!cancelled) setStudyLogLoading(false);
      }
    };

    fetchStudyLog();
    return () => {
      cancelled = true;
    };
  }, [word?.wordId]);

  // ------------------------------
  // 클러스터 조회
  // ------------------------------
  const fetchClusters = useCallback(
    async ({ useCache = true, centerId = id } = {}) => {
      if (!centerId) return null;

      const mySeq = ++clusterReqSeqRef.current;

      try {
        setClusterError(null);
        setClusterStatus("loading");

        const grouped = await withTimeout(getClustersByCenter(centerId, { useCache }));

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
        setClusterError(
          e?.message === "timeout"
            ? "연관 단어 로딩이 지연되고 있어요. 다시 시도해 주세요."
            : "연관 단어를 불러오지 못했습니다."
        );
        setClusterStatus("error");
        return null;
      }
    },
    [id]
  );

  // ------------------------------
  // 클러스터 생성
  // ------------------------------
  const runCreateCluster = useCallback(
    async (centerId = id) => {
      if (!centerId) return null;

      const mySeq = ++clusterReqSeqRef.current;

      try {
        setClusterError(null);
        setClusterStatus("creating");

        const grouped = await withTimeout(createCluster(centerId));

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

        console.error("연관 단어 생성 실패", e);
        setClusterError(
          e?.message === "timeout"
            ? "연관 단어 생성이 지연되고 있어요. 잠시 후 다시 시도해 주세요."
            : "연관 단어 생성 중 오류가 발생했습니다."
        );
        setClusterStatus("error");
        return null;
      }
    },
    [id]
  );

  // 자동: GET -> empty면 POST
  useEffect(() => {
    if (!id) return;

    let cancelled = false;

    const run = async () => {
      const grouped = await fetchClusters({ useCache: true, centerId: id });
      if (cancelled) return;

      if (!grouped) {
        await fetchClusters({ useCache: false, centerId: id });
        return;
      }

      const empty =
        (grouped.similar?.length ?? 0) === 0 && (grouped.opposite?.length ?? 0) === 0;

      if (!empty) return;

      if (autoCreateTriedRef.current.has(String(id))) return;
      autoCreateTriedRef.current.add(String(id));

      await runCreateCluster(id);
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [id, fetchClusters, runCreateCluster]);

  // ------------------------------
  // 즐겨찾기 토글
  // ------------------------------
  const handleToggleFavorite = async () => {
    if (!word || favLoading) return;
    const wordId = Number(word.wordId);
    if (!wordId) return;

    setFavLoading(true);
    const current = !!word.isFavorite;

    setWord((prev) => (prev ? { ...prev, isFavorite: !current } : prev));

    const previousWords = queryClient.getQueryData(WORDS_QUERY_KEY);
    if (previousWords) {
      queryClient.setQueryData(WORDS_QUERY_KEY, (old = []) =>
        old.map((w) => (Number(w.wordId) === wordId ? { ...w, isFavorite: !current } : w))
      );
    }

    try {
      if (current) await removeFavorite(wordId);
      else await addFavorite(wordId);
      queryClient.invalidateQueries({ queryKey: WORDS_QUERY_KEY });
    } catch (e) {
      console.error("즐겨찾기 실패", e);
      setWord((prev) => (prev ? { ...prev, isFavorite: current } : prev));
      if (previousWords) queryClient.setQueryData(WORDS_QUERY_KEY, previousWords);
      alert("오류가 발생했습니다.");
    } finally {
      setFavLoading(false);
    }
  };

  // ✅ 연관 단어 클릭 -> 상세 페이지 이동
  const handleOpenClusterWord = useCallback(
    (item) => {
      const targetId = item?.wordId ?? item?.id;
      if (targetId) {
        navigate(`/words/${targetId}`, {
          state: { from: "word-detail", search: location.state?.search || "" },
        });
        return;
      }

      const text = String(item?.text || "").trim();
      if (text) navigate(`/words?search=${encodeURIComponent(text)}`);
    },
    [navigate, location.state]
  );

  const handleBack = () => {
    const fromList = location.state?.from === "word-list";
    const search = location.state?.search || "";
    if (fromList) navigate(`/words${search}`);
    else navigate("/words");
  };

  const hasSimilar = (clusterData.similar?.length ?? 0) > 0;
  const hasOpposite = (clusterData.opposite?.length ?? 0) > 0;
  const hasAnyCluster = hasSimilar || hasOpposite;

  const availableTabs = useMemo(() => {
    const tabs = ["전체"];
    if (hasSimilar) tabs.push("similar");
    if (hasOpposite) tabs.push("opposite");
    return tabs;
  }, [hasSimilar, hasOpposite]);

  useEffect(() => {
    const allowed = new Set(availableTabs);
    if (!allowed.has(clusterTab)) setClusterTab("전체");
  }, [availableTabs, clusterTab]);

  const viewSimilar = useMemo(() => {
    if (!hasSimilar) return [];
    return clusterTab === "전체" || clusterTab === "similar" ? clusterData.similar : [];
  }, [clusterTab, clusterData.similar, hasSimilar]);

  const viewOpposite = useMemo(() => {
    if (!hasOpposite) return [];
    return clusterTab === "전체" || clusterTab === "opposite" ? clusterData.opposite : [];
  }, [clusterTab, clusterData.opposite, hasOpposite]);

  if (loading)
    return (
      <div className="detail-loading">
        <Spinner fullHeight={false} message="단어장을 불러오는 중입니다..." />
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
    studyStatus,
  } = word;

  const displayDomain = domain || category || "";
  const displayLevel = typeof level === "number" ? level : "-";

  // ✅ 재학습 예정 판단(완료였는데 다시 틀린 케이스 포함)
  const totalCorrect = Number(studyLog?.totalCorrect || 0);
  const totalWrong = Number(studyLog?.totalWrong || 0);
  const hasHistory = totalCorrect + totalWrong > 0;

  const needsReview =
    !isCompleted &&
    (
      // 백엔드가 wrong/review 같은 값을 주면 즉시 반영
      ["wrong", "review", "relearn", "retry"].includes(normalizeStudyStatus(studyStatus)) ||
      // 백엔드 상태가 애매해도 "과거 정답 이력" 있으면 재학습으로 분기
      totalCorrect > 0
    );

  const statusType = isCompleted ? "done" : needsReview ? "review" : "todo";
  const statusText = isCompleted ? "학습 완료" : needsReview ? "재학습 예정" : "학습 예정";

  const QuickStudyButtons = (
    <div className="quick-actions">
      <Button
        type="button"
        variant="outline"
        size="sm"
        full
        onClick={() => navigate("/learning/quiz?source=word&wordIds=" + word.wordId)}
      >
        <span className="btn__icon btn__icon--left">
          <BookOpen size={18} />
        </span>
        퀴즈 풀기
      </Button>

      <Button
        type="button"
        variant="outline"
        size="sm"
        full
        onClick={() => navigate("/learning/card?source=word&wordIds=" + word.wordId)}
      >
        <span className="btn__icon btn__icon--left">
          <Layers size={18} />
        </span>
        카드 학습
      </Button>
    </div>
  );

  return (
    <div className="page-container">
      <div className="detail-page">
        <div className="detail-nav">
          <button onClick={handleBack} className="back-btn" type="button">
            <ArrowLeft size={18} />
            <span className="back-label">목록으로</span>
          </button>
        </div>

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
              <Star size={26} fill={isFavorite ? "currentColor" : "none"} strokeWidth={1.6} />
            </button>
          </div>

          <div className="header-bottom-row">
            <div className="detail-tags-row">
              {typeof level === "number" && <span className="tag tag-level">Lv.{displayLevel}</span>}
              {partOfSpeech && <span className="tag tag-pos">{getPosLabel(partOfSpeech)}</span>}
              {displayDomain && <span className="tag tag-domain">{getDomainLabel(displayDomain)}</span>}
            </div>

            {/* ✅ done / review / todo */}
            <div className={`status-badge ${statusType}`}>
              <CheckCircle size={16} />
              <span className="status-label">{statusText}</span>
            </div>
          </div>

          <div className="header-divider" />

          <div className="header-example">
            <div className="header-example-label">
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
          </div>
        </header>

        <div className="detail-grid">
          <div className="detail-left-col">
            <Card
              className="wd-card cluster-card"
              title={
                <span className="wd-card-title">
                  <Share2 size={16} />
                  <span>연관 단어</span>
                </span>
              }
              meta={
                <span className="cluster-tabs">
                  {availableTabs.map((tab) => (
                    <button
                      key={tab}
                      className={`cluster-tab ${clusterTab === tab ? "active" : ""}`}
                      onClick={() => setClusterTab(tab)}
                      type="button"
                    >
                      {tab === "전체" ? "All" : tab === "similar" ? "유의어" : "반의어"}
                    </button>
                  ))}
                </span>
              }
            >
              <div className="cluster-content">
                {(clusterStatus === "loading" || clusterStatus === "creating") && (
                  <div className="cluster-loading">
                    <div className="mini-spinner" />
                    <span>
                      {clusterStatus === "creating"
                        ? "연관 단어를 생성하는 중입니다..."
                        : "연관 단어를 불러오는 중입니다..."}
                    </span>
                  </div>
                )}

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

                {clusterStatus === "ready" && hasAnyCluster && (
                  <>
                    {(clusterTab === "전체" || clusterTab === "similar") && hasSimilar && (
                      <div className="cluster-group">
                        <div className="group-title-row">
                          <h4>유의어</h4>
                        </div>
                        <div className="chip-grid">
                          {viewSimilar.map((item) => (
                            <ClusterChip
                              key={item.wordId ?? item.id ?? item.text}
                              item={item}
                              onOpen={handleOpenClusterWord}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {(clusterTab === "전체" || clusterTab === "opposite") && hasOpposite && (
                      <div className="cluster-group">
                        <div className="group-title-row">
                          <h4>반의어</h4>
                        </div>
                        <div className="chip-grid">
                          {viewOpposite.map((item) => (
                            <ClusterChip
                              key={item.wordId ?? item.id ?? item.text}
                              item={item}
                              onOpen={handleOpenClusterWord}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}

                {clusterStatus === "idle" && (
                  <div className="cluster-loading">
                    <div className="mini-spinner" />
                    <span>연관 단어 준비 중...</span>
                  </div>
                )}
              </div>
            </Card>
          </div>

          <div className="detail-right-col">
            <Card
              className="wd-card study-card"
              title={
                <span className="wd-card-title">
                  <BarChart3 size={16} />
                  <span>학습 통계</span>
                </span>
              }
            >
              {studyLogLoading ? (
                <p className="no-data-text">불러오는 중...</p>
              ) : studyLog && hasHistory ? (
                <div className="study-stats-content">
                  {/* ✅ 카드 박스 제거: pill/inline 형태 */}
                  <div className="score-row">
                    <div className="score-pill score-pill--correct">
                      <div className="score-left">
                        <span className="score-dot score-dot--correct" />
                        <span className="score-label">정답</span>
                      </div>
                      <div className="score-right">
                        <span className="score-number">{totalCorrect}</span>
                        <span className="score-unit">회</span>
                      </div>
                    </div>

                    <div className="score-pill score-pill--wrong">
                      <div className="score-left">
                        <span className="score-dot score-dot--wrong" />
                        <span className="score-label">오답</span>
                      </div>
                      <div className="score-right">
                        <span className="score-number">{totalWrong}</span>
                        <span className="score-unit">회</span>
                      </div>
                    </div>
                  </div>

                  {(() => {
                    const total = totalCorrect + totalWrong;
                    const accuracy = total > 0 ? Math.round((totalCorrect / total) * 100) : 0;
                    const barStyle = { width: `${accuracy}%` };

                    let barClass = "accuracy-bar";
                    let textClass = "accuracy-text";
                    if (accuracy >= 80) {
                      barClass += " accuracy-bar--success";
                      textClass += " accuracy-text--success";
                    } else if (accuracy >= 50) {
                      barClass += " accuracy-bar--warning";
                      textClass += " accuracy-text--warning";
                    } else {
                      barClass += " accuracy-bar--danger";
                      textClass += " accuracy-text--danger";
                    }

                    return (
                      <div className="accuracy-section">
                        <div className="accuracy-top-row">
                          <span className="accuracy-label">정답률</span>
                          <span className={textClass}>{accuracy}%</span>
                        </div>

                        <div className="accuracy-bar-container" aria-label={`정답률 ${accuracy}%`}>
                          <div className={barClass} style={barStyle} />
                        </div>
                      </div>
                    );
                  })()}

                  {studyLog.lastStudyAt && (
                    <div className="last-study-date">
                      마지막 학습:{" "}
                      {new Date(studyLog.lastStudyAt).toLocaleDateString("ko-KR", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </div>
                  )}

                  {QuickStudyButtons}
                </div>
              ) : (
                <div className="study-stats-content">
                  <p className="no-data-text">아직 학습 기록이 없습니다.</p>
                  {QuickStudyButtons}
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default WordDetailPage;
