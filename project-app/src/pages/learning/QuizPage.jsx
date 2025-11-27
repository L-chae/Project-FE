import { useSearchParams, useNavigate } from 'react-router-dom';
import { useLearningEngine } from './hooks/useLearningEngine';
import { QuizQuestion } from './components/QuizQuestion';
import { ProgressBar } from './components/ProgressBar';
import './QuizPage.css';

export default function QuizPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const source = searchParams.get('source') || 'quiz';
  const clusterId = searchParams.get('clusterId') || undefined;
  const wordIdsParam = searchParams.get('wordIds');
  const wordIds = wordIdsParam ? wordIdsParam.split(',').map((x) => Number(x)) : undefined;
  const limit = Number(searchParams.get('limit') || 10);

  const {
    items,
    currentIndex,
    current,
    total,
    progress,
    loading,
    error,
    isFinished,
    goNext,
    goPrev,
    finishQuiz,
    selectedChoiceId,
    isAnswered,
    isCorrect,
    score,
    wrongAnswerLogs,
    answerQuestion,
  } = useLearningEngine({
    mode: 'mcq',
    source,
    wordIds,
    clusterId,
    limit,
  });

  const handleNext = () => {
    if (currentIndex === total - 1) {
      finishQuiz();
    } else {
      goNext();
    }
  };

  const handleRetry = () => {
    // 단순히 같은 URL을 다시 로드
    navigate(0);
  };

  const handleGoWrongNote = () => {
    navigate('/learning/wrong-notes');
  };

  const handleCreateStoryFromWrong = () => {
    const wrongWordIds = wrongAnswerLogs.map((l) => l.wrongWordId).join(',');
    navigate(`/stories/create?wrongWordIds=${encodeURIComponent(wrongWordIds)}`);
  };

  if (loading) {
    return <div className="quiz-page quiz-page--loading">로딩 중...</div>;
  }

  if (error) {
    return <div className="quiz-page quiz-page--error">문제를 불러오는 중 오류가 발생했습니다.</div>;
  }

  return (
    <div className="quiz-page">
      <header className="quiz-header">
        <div>
          <h1>객관식 퀴즈</h1>
          <p className="quiz-header__subtitle">단어를 객관식으로 연습합니다.</p>
        </div>
        <div className="quiz-header__meta">
          <span>
            {Math.min(currentIndex + 1, total)} / {total}
          </span>
          <ProgressBar value={progress} />
          <span className="quiz-header__score">
            점수: {score} / {total}
          </span>
        </div>
      </header>

      <main className="quiz-body">
        {isFinished ? (
          <div className="quiz-result">
            <h2>퀴즈 완료</h2>
            <p>
              최종 점수: {score} / {total}
            </p>
            <p>틀린 문제 수: {wrongAnswerLogs.length}</p>
            <div className="quiz-result__actions">
              <button onClick={handleRetry}>다시 풀기</button>
              <button onClick={handleGoWrongNote}>오답 노트로 이동</button>
              {wrongAnswerLogs.length > 0 && (
                <button onClick={handleCreateStoryFromWrong}>
                  이 오답들로 AI 스토리 생성
                </button>
              )}
            </div>
          </div>
        ) : (
          <>
            <QuizQuestion
              question={current}
              selectedChoiceId={selectedChoiceId}
              isAnswered={isAnswered}
              isCorrect={isCorrect}
              onSelect={answerQuestion}
            />
            <footer className="quiz-footer">
              <button
                type="button"
                onClick={goPrev}
                disabled={currentIndex === 0}
              >
                이전
              </button>
              <button
                type="button"
                onClick={handleNext}
                disabled={!isAnswered && total > 0}
              >
                {currentIndex === total - 1 ? '퀴즈 완료' : '다음'}
              </button>
            </footer>
          </>
        )}
      </main>
    </div>
  );
}
