import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getWordDetail,
  addFavorite,
  removeFavorite,
  toggleProgress,
} from "../../api/wordApi";
import "./WordDetailPage.css";

function WordDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [word, setWord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [favLoading, setFavLoading] = useState(false);
  const [progressLoading, setProgressLoading] = useState(false);

  // API 호출
  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    const fetchWord = async () => {
      try {
        setLoading(true);
        const data = await getWordDetail(id);
        if (cancelled) return;
        setWord(data);
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
    return () => { cancelled = true; };
  }, [id]);

  // 핸들러: 즐겨찾기
  const handleToggleFavorite = async () => {
    if (!word || favLoading) return;
    setFavLoading(true);
    const current = word.isFavorite;

    // UI 낙관적 업데이트
    setWord((prev) => (prev ? { ...prev, isFavorite: !current } : prev));

    try {
      current ? await removeFavorite(word.wordId) : await addFavorite(word.wordId);
    } catch (e) {
      console.error("즐겨찾기 실패", e);
      setWord((prev) => (prev ? { ...prev, isFavorite: current } : prev)); // 롤백
      alert("오류가 발생했습니다.");
    } finally {
      setFavLoading(false);
    }
  };

  // 핸들러: 학습 상태
  const handleToggleProgress = async () => {
    if (!word || progressLoading) return;
    setProgressLoading(true);
    const current = word.isCompleted;

    // UI 낙관적 업데이트
    setWord((prev) => (prev ? { ...prev, isCompleted: !current } : prev));

    try {
      await toggleProgress(word.wordId);
    } catch (e) {
      console.error("학습 상태 실패", e);
      setWord((prev) => (prev ? { ...prev, isCompleted: current } : prev)); // 롤백
      alert("오류가 발생했습니다.");
    } finally {
      setProgressLoading(false);
    }
  };

  const handleBack = () => navigate(-1);

  if (loading) return <div className="detail-loading">로딩 중... ⏳</div>;
  if (error) return <div className="detail-error">{error}</div>;
  if (!word) return null;

  const {
    word: text,
    meaning,
    partOfSpeech,
    domain,
    level,
    exampleSentence,
    isFavorite,
    isCompleted,
  } = word;

  return (
    <div className="page-container detail-page-container">
      {/* 1. 상단 네비게이션 */}
      <div className="detail-nav">
        <button onClick={handleBack} className="back-btn">
          ← 목록으로
        </button>
      </div>

      {/* 2. 메인 헤더 카드 (단어 + 태그 + 액션) */}
      <section className="detail-header-card">
        <div className="header-left">
          <h1 className="detail-word">{text}</h1>
          <div className="detail-tags">
            {partOfSpeech && <span className="tag tag-pos">{partOfSpeech}</span>}
            {domain && <span className="tag tag-domain">{domain}</span>}
            <span className="tag tag-level">Lv.{level}</span>
          </div>
        </div>
        
        <div className="header-right">
          {/* 학습 상태 토글 버튼 */}
          <button 
            className={`status-toggle-btn ${isCompleted ? 'completed' : ''}`}
            onClick={handleToggleProgress}
            disabled={progressLoading}
          >
            {isCompleted ? "학습완료 취소" : "학습완료로 표시"}
          </button>

          {/* 즐겨찾기 별 */}
          <button 
            className={`fav-star-btn ${isFavorite ? 'active' : ''}`} 
            onClick={handleToggleFavorite}
            disabled={favLoading}
          >
            {isFavorite ? "★" : "☆"}
          </button>
        </div>
      </section>

      {/* 3. 본문 레이아웃 (Grid: 좌측 컨텐츠 / 우측 사이드바) */}
      <div className="detail-content-grid">
        
        {/* 좌측: 뜻 & 예문 */}
        <div className="detail-main-col">
          {/* 뜻 카드 */}
          <section className="content-card meaning-card">
            <h3 className="section-title">뜻</h3>
            <p className="meaning-text">{meaning}</p>
          </section>

          {/* 예문 카드 */}
          <section className="content-card example-card">
            <h3 className="section-title">예문</h3>
            <div className="example-content">
              <p className="example-en">• {exampleSentence}</p>
              {/* 예문 한글 해석이 있다면 여기에 추가 (현재 API에는 없을 수 있음) */}
              <p className="example-ko">예문 해석이 여기에 표시됩니다.</p> 
            </div>
            
            {/* 예문 추가 (더미) */}
            <div className="example-content">
              <p className="example-en">• Would you like some coffee?</p>
              <p className="example-ko">커피 한 잔 드릴까요?</p>
            </div>
          </section>
        </div>

        {/* 우측: 연관 단어 클러스터 */}
        <div className="detail-side-col">
          <section className="content-card cluster-card">
            <div className="cluster-header">
              <h3 className="section-title">연관 단어 클러스터</h3>
              <div className="cluster-tabs">
                <span className="tab active">전체</span>
                <span className="tab">의미 비슷</span>
                <span className="tab">반대 의미</span>
              </div>
            </div>

            {/* 그룹 1: 의미가 비슷한 단어 */}
            <div className="cluster-group">
              <div className="group-header">
                <h4>의미가 비슷한 단어</h4>
                <span className="add-all">모두 추가 ▸</span>
              </div>
              <p className="group-desc">비슷한 의미로 같이 외우면 좋은 단어</p>
              
              <div className="chip-list">
                <div className="word-chip">
                  <span className="chip-text">Drink</span>
                  <span className="chip-level">Lv.1</span>
                  <span className="chip-status">내 단어장</span>
                </div>
                <div className="word-chip">
                  <span className="chip-text">Beverage</span>
                  <span className="chip-level">Lv.2</span>
                  <span className="chip-add">+ 추가</span>
                </div>
                <div className="word-chip">
                  <span className="chip-text">Espresso</span>
                  <span className="chip-level">Lv.3</span>
                  <span className="chip-add">+ 추가</span>
                </div>
              </div>
            </div>

            <div className="divider"></div>

            {/* 그룹 2: 같은 주제 단어 */}
            <div className="cluster-group">
              <div className="group-header">
                <h4>같은 주제 단어</h4>
                <span className="add-all">모두 추가 ▸</span>
              </div>
              <p className="group-desc">카페/음료와 관련된 단어</p>
              
              <div className="chip-list">
                <div className="word-chip">
                  <span className="chip-text">Tea</span>
                  <span className="chip-level">Lv.1</span>
                  <span className="chip-status">내 단어장</span>
                </div>
                <div className="word-chip">
                  <span className="chip-text">Barista</span>
                  <span className="chip-level">Lv.3</span>
                  <span className="chip-add">+ 추가</span>
                </div>
                <div className="word-chip">
                  <span className="chip-text">Bakery</span>
                  <span className="chip-level">Lv.2</span>
                  <span className="chip-add">+ 추가</span>
                </div>
              </div>
            </div>

          </section>
        </div>
      </div>
    </div>
  );
}

export default WordDetailPage;