// src/pages/learning/LearningHomePage.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./LearningHomePage.css";

function LearningHomePage() {
  const navigate = useNavigate();
  const [questionCount, setQuestionCount] = useState(10);

  const handleChangeQuestionCount = (e) => {
    const value = Number(e.target.value) || 10;
    setQuestionCount(value);
  };

  // 공통으로 쿼리스트링 만들어주는 헬퍼
  const buildLimitParam = () => `limit=${questionCount}`;

  // 일반 학습 - 객관식
  const goNormalQuiz = () => {
    navigate(`/learning/quiz?source=quiz&${buildLimitParam()}`);
  };

  // 오답 기반 학습 - 객관식 (오답만 모아서 문제은행처럼)
  const goWrongNoteQuiz = () => {
    navigate(`/learning/quiz?source=wrong-notes&${buildLimitParam()}`);
  };

  // 일반 학습 - 카드
  const goNormalCard = () => {
    navigate(`/learning/card?source=card&${buildLimitParam()}`);
  };

  // 오답 기반 학습 - 카드
  const goWrongNoteCard = () => {
    navigate(`/learning/card?source=wrong-notes&${buildLimitParam()}`);
  };

  // 오답 노트로 바로 가기
  const goWrongNote = () => {
    navigate("/learning/wrong-notes");
  };

  return (
    <div className="learning-home">
      <header className="learning-home__header">
        <h1>학습하기</h1>
        <p className="learning-home__subtitle">
          학습 방식을 선택하고, 지금 상태에 맞게 단어를 복습해 보세요.
        </p>
      </header>

      {/* 공통 옵션: 문제 수 선택 */}
      <section className="learning-home__controls">
        <div className="learning-home__control-group">
          <label htmlFor="questionCount">문항 수</label>
          <select
            id="questionCount"
            value={questionCount}
            onChange={handleChangeQuestionCount}
          >
            <option value={5}>5문항</option>
            <option value={10}>10문항</option>
            <option value={20}>20문항</option>
          </select>
          <span className="learning-home__control-help">
            카드 / 객관식 모두 이 설정이 적용됩니다.
          </span>
        </div>
      </section>

      {/* 학습 모드 카드들 */}
      <section className="learning-home__grid">
        {/* 일반 학습 */}
        <div className="learning-home__column">
          <h2 className="learning-home__section-title">일반 학습</h2>

          <div className="learning-home__card">
            <h3>객관식 퀴즈</h3>
            <p>
              4지선다 객관식으로 단어를 테스트합니다.
              <br />
              랜덤 단어 / 추천 단어를 기반으로 학습합니다.
            </p>
            <button type="button" onClick={goNormalQuiz}>
              객관식 퀴즈 시작
            </button>
          </div>

          <div className="learning-home__card">
            <h3>카드 학습</h3>
            <p>
              플래시카드처럼 단어를 보고,
              <br />
              &quot;알겠다 / 모르겠다&quot;로 빠르게 훑어봅니다.
            </p>
            <button type="button" onClick={goNormalCard}>
              카드 학습 시작
            </button>
          </div>
        </div>

        {/* 오답 중심 학습 */}
        <div className="learning-home__column">
          <h2 className="learning-home__section-title">오답 중심 학습</h2>

          <div className="learning-home__card">
            <h3>오답 문제 은행 (객관식)</h3>
            <p>
              최근에 틀렸던 단어들만 모아서,
              <br />
              객관식 퀴즈 형태로 다시 풀어볼 수 있습니다.
            </p>
            <button type="button" onClick={goWrongNoteQuiz}>
              오답만 객관식으로 풀기
            </button>
          </div>

          <div className="learning-home__card">
            <h3>오답 카드 학습</h3>
            <p>
              오답 단어만 카드 형식으로 다시 훑어보면서
              <br />
              약한 단어를 집중 반복합니다.
            </p>
            <button type="button" onClick={goWrongNoteCard}>
              오답만 카드로 복습
            </button>
          </div>

          <div className="learning-home__card learning-home__card--secondary">
            <h3>오답 노트 관리</h3>
            <p>
              지금까지 틀렸던 단어 목록을 보고,
              <br />
              단어별로 상세히 복습하거나 AI 스토리로 보낼 수 있습니다.
            </p>
            <button type="button" onClick={goWrongNote}>
              오답 노트로 이동
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

export default LearningHomePage;
