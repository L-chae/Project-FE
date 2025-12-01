import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, Layers, Edit3, CheckSquare, AlertCircle } from "lucide-react";

// 공통 헤더 컴포넌트 사용 (앞서 만든 컴포넌트 활용)
import PageHeader from "../../components/common/PageHeader";
import "./LearningHomePage.css";

function LearningHomePage() {
  const navigate = useNavigate();
  const [questionCount, setQuestionCount] = useState(10);
  const [level, setLevel] = useState("all");

  const handleChangeQuestionCount = (e) => {
    // 5~50 사이 값만 허용
    const val = Number(e.target.value);
    if (val < 5) setQuestionCount(5);
    else if (val > 50) setQuestionCount(50);
    else setQuestionCount(val);
  };

  // 쿼리 파라미터 생성
  const buildParams = () => `limit=${questionCount}&level=${level}`;

  // 네비게이션 핸들러
  const handleNavigate = (path) => navigate(path);

  return (
    <div className="page-container ">
      <div className="learning-home-page">

        {/* 1. 헤더 */}
        <PageHeader
          title="학습하기"
          description="학습 방식을 선택하고, 단어를 복습해 보세요."
        />

        {/* 2. 컨트롤 패널 (문항 수 & 난이도) */}
        <section className="learning-controls">
          <div className="control-row">
            <div className="control-item">
              <label htmlFor="q-count">문항 수</label>
              <input
                id="q-count"
                type="number"
                min="5"
                max="50"
                step="5"
                value={questionCount}
                onChange={(e) => setQuestionCount(Number(e.target.value))}
                className="control-input"
              />
            </div>
            <div className="control-item">
              <label htmlFor="level-select">난이도</label>
              <select
                id="level-select"
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                className="control-select"
              >
                <option value="all">전체 난이도</option>
                <option value="1">Lv.1 (초급)</option>
                <option value="2">Lv.2 (중급)</option>
                <option value="3">Lv.3 (고급)</option>
              </select>
            </div>
          </div>
          <p className="control-desc">
            선택한 문항 수와 난이도가 모든 학습 모드에 공통으로 적용됩니다.
          </p>
        </section>

        {/* 3. 메인 학습 모드 (2컬럼 그리드) */}
        <section className="learning-mode-grid">

          {/* [왼쪽] 일반 학습 */}
          <div className="mode-column">
            <h3 className="column-title">일반 학습</h3>
            <div className="card-row">
              {/* 퀴즈 풀기 */}
              <div className="learning-card">
                <div className="card-icon-wrapper icon-blue">
                  <BookOpen size={32} strokeWidth={1.5} />
                  <div className="icon-badge">A</div>
                </div>
                <button
                  className="action-btn btn-blue"
                  onClick={() => handleNavigate(`/learning/quiz?source=quiz&${buildParams()}`)}
                >
                  퀴즈 풀기
                </button>
              </div>

              {/* 카드 학습 */}
              <div className="learning-card">
                <div className="card-icon-wrapper icon-purple">
                  <Layers size={32} strokeWidth={1.5} />
                  <div className="icon-badge">ABC</div>
                </div>
                <button
                  className="action-btn btn-purple"
                  onClick={() => handleNavigate(`/learning/card?source=card&${buildParams()}`)}
                >
                  카드 학습
                </button>
              </div>
            </div>
          </div>

          {/* [오른쪽] 오답 중심 학습 */}
          <div className="mode-column border-left">
            <h3 className="column-title text-orange">오답 중심 학습</h3>
            <div className="card-row">
              {/* 오답 퀴즈 */}
              <div className="learning-card">
                <div className="card-icon-wrapper icon-orange">
                  <Edit3 size={32} strokeWidth={1.5} />
                  <div className="icon-badge">!</div>
                </div>
                <button
                  className="action-btn btn-orange"
                  onClick={() => handleNavigate(`/learning/quiz?source=wrong-notes&${buildParams()}`)}
                >
                  오답으로 퀴즈 풀기
                </button>
              </div>

              {/* 오답 카드 */}
              <div className="learning-card">
                <div className="card-icon-wrapper icon-orange">
                  <Layers size={32} strokeWidth={1.5} />
                  <div className="icon-badge">!</div>
                </div>
                <button
                  className="action-btn btn-orange"
                  onClick={() => handleNavigate(`/learning/card?source=wrong-notes&${buildParams()}`)}
                >
                  오답으로 카드 학습
                </button>
              </div>
            </div>
          </div>

        </section>

        {/* 4. 하단: 오답 노트 관리 */}
        <section className="wrong-note-section">
          <div className="wrong-note-header">
            <AlertCircle size={18} className="text-purple" />
            <h3 className="wrong-note-title">오답 노트 관리</h3>
          </div>

          <div className="wrong-note-content">
            <p className="wrong-note-desc">
              틀린 단어 목록을 확인하고, AI 스토리 생성으로 연계하여 복습할 수 있습니다.
            </p>
            <button
              className="wrong-note-btn"
              onClick={() => handleNavigate("/learning/wrong-notes")}
            >
              오답 노트 보러가기 <span className="arrow">→</span>
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}

export default LearningHomePage;