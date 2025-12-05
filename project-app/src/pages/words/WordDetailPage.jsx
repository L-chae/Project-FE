// src/pages/words/WordDetailPage.jsx
import {
  ArrowLeft,
  BookOpen,
  Check,
  CheckCircle,
  Plus,
  Star,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  addFavorite,
  getCompletedList,
  getFavoriteList,
  getWordDetail,
  removeFavorite,
  addWordFromCluster, // 연관 단어 추가 (mock용)
} from "../../api/wordApi";
import "./WordDetailPage.css";

// --------------------------------------------------
// 연관 단어 초기 더미 데이터
// --------------------------------------------------
const INITIAL_CLUSTER_DATA = {
  similar: [
    { text: "Drink", level: 1, inMyList: false },
    { text: "Beverage", level: 2, inMyList: false },
    { text: "Espresso", level: 3, inMyList: true },
  ],
  opposite: [
    { text: "Refuse", level: 3, inMyList: false },
    { text: "Reject", level: 2, inMyList: false },
  ],
};

function WordDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  // ------------------------------------------------
  // 상태
  // ------------------------------------------------
  const [word, setWord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [favLoading, setFavLoading] = useState(false);

  // 연관 단어 탭 / 데이터
  const [clusterTab, setClusterTab] = useState("전체");
  const [clusterData, setClusterData] = useState(INITIAL_CLUSTER_DATA);

  // ------------------------------------------------
  // 단어 상세 + 즐겨찾기/학습완료 상태 로딩
  // ------------------------------------------------
  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    const fetchWord = async () => {
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

        const favoriteIds = new Set(
          (favoriteRes || []).map((f) => Number(f.wordId))
        );
        const completedIds = new Set(
          (completedRes || []).map((c) => Number(c.wordId))
        );

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

    fetchWord();
    return () => {
      cancelled = true;
    };
  }, [id]);

  // ------------------------------------------------
  // 즐겨찾기 토글
  // ------------------------------------------------
  const handleToggleFavorite = async () => {
    if (!word || favLoading) return;
    const wordId = Number(word.wordId);
    if (!wordId) return;

    setFavLoading(true);
    const current = !!word.isFavorite;
    setWord((prev) => (prev ? { ...prev, isFavorite: !current } : prev));

    try {
      if (current) await removeFavorite(wordId);
      else await addFavorite(wordId);
    } catch (e) {
      console.error("즐겨찾기 실패", e);
      setWord((prev) => (prev ? { ...prev, isFavorite: current } : prev));
      alert("오류가 발생했습니다.");
    } finally {
      setFavLoading(false);
    }
  };

  // ------------------------------------------------
  // 연관 단어 → 단어장에 추가 (mockWordList에 push + UI 갱신)
  // ------------------------------------------------
  const handleAddClusterWord = async (targetWord, level = 1) => {
    try {
      // mock 모드에서는 mockWordList에 실제 추가됨 (wordApi.addWordFromCluster)
      await addWordFromCluster({ text: targetWord, level });

      // UI 상태(inMyList) 갱신
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

  // "모두 추가" 버튼
  const handleAddAll = (groupKey) => {
    const group = clusterData[groupKey];
    if (!group) return;

    group
      .filter((w) => !w.inMyList)
      .forEach((w) => {
        handleAddClusterWord(w.text, w.level);
      });
  };

  const handleBack = () => navigate(-1);

  // ------------------------------------------------
  // 로딩 / 에러 처리
  // ------------------------------------------------
  if (loading)
    return (
      <div className="detail-loading">
        <div className="spinner"></div>
      </div>
    );
  if (error) return <div className="detail-error">{error}</div>;
  if (!word) return null;

  // ------------------------------------------------
  // 구조 분해
  // ------------------------------------------------
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
            목록으로
          </button>
        </div>

        {/* 메인 헤더 (단어, 뜻, 태그, 즐겨찾기) */}
        <header className="detail-header">
          <div className="header-top-row">
            <div className="header-content">
              <h1 className="detail-word-title">{text}</h1>
              <p className="detail-meaning">{meaning}</p>

              <div className="detail-tags-row">
                {typeof level === "number" && (
                  <span className="tag tag-level">Lv.{displayLevel}</span>
                )}
                {partOfSpeech && (
                  <span className="tag tag-pos">{partOfSpeech}</span>
                )}
                {displayDomain && (
                  <span className="tag tag-domain">{displayDomain}</span>
                )}
              </div>
            </div>

            <div className="header-actions">
              <button
                type="button"
                className={`fav-action-btn ${isFavorite ? "active" : ""}`}
                onClick={handleToggleFavorite}
                disabled={favLoading}
                title={isFavorite ? "즐겨찾기 해제" : "즐겨찾기 추가"}
              >
                <Star
                  size={28}
                  fill={isFavorite ? "currentColor" : "none"}
                  strokeWidth={1.5}
                />
              </button>
            </div>
          </div>

          <div className="detail-separator" />

          {/* 학습 상태 배지 */}
          <div className="header-status-row">
            <div className={`status-badge ${isCompleted ? "done" : "todo"}`}>
              <CheckCircle size={16} />
              {isCompleted ? "학습 완료" : "학습 예정"}
            </div>
          </div>
        </header>

        {/* 본문 2단 그리드 */}
        <div className="detail-grid">
          {/* 왼쪽: 예문 */}
          <div className="detail-left-col">
            <section className="detail-card example-section">
              <div className="card-label">
                <BookOpen size={16} /> 예문
              </div>
              {exampleSentenceEn || exampleSentenceKo ? (
                <div className="example-box">
                  {exampleSentenceEn && (
                    <p className="example-en">{exampleSentenceEn}</p>
                  )}
                  {exampleSentenceKo && (
                    <p className="example-ko">{exampleSentenceKo}</p>
                  )}
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
                      className={`cluster-tab ${
                        clusterTab === tab ? "active" : ""
                      }`}
                      onClick={() => setClusterTab(tab)}
                    >
                      {tab === "전체"
                        ? "All"
                        : tab === "similar"
                        ? "유의어"
                        : "반의어"}
                    </button>
                  ))}
                </div>
              </div>

              <div className="cluster-content">
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
                        <div className="word-chip" key={item.text}>
                          <div className="chip-info">
                            <span className="chip-word">{item.text}</span>
                            <span className="chip-lv">Lv.{item.level}</span>
                          </div>
                          {item.inMyList ? (
                            <span className="chip-check">
                              <Check size={14} />
                            </span>
                          ) : (
                            <button
                              className="chip-add-btn"
                              onClick={() =>
                                handleAddClusterWord(item.text, item.level)
                              }
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
                        <div className="word-chip" key={item.text}>
                          <div className="chip-info">
                            <span className="chip-word">{item.text}</span>
                            <span className="chip-lv">Lv.{item.level}</span>
                          </div>
                          {item.inMyList ? (
                            <span className="chip-check">
                              <Check size={14} />
                            </span>
                          ) : (
                            <button
                              className="chip-add-btn"
                              onClick={() =>
                                handleAddClusterWord(item.text, item.level)
                              }
                            >
                              <Plus size={14} />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
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
