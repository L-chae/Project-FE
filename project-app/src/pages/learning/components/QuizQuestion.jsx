// import './QuizQuestion.css';

export function QuizQuestion({
  question,
  selectedChoiceId,
  isAnswered,
  isCorrect,
  onSelect,
}) {
  if (!question) return null;

  const handleClick = (choiceId) => {
    if (isAnswered) return;
    onSelect?.(choiceId);
  };

  return (
    <div className="quiz-question">
      <div className="quiz-question__stem">
        <h2 className="quiz-question__title">{question.title}</h2>
        {question.description && (
          <p className="quiz-question__description">{question.description}</p>
        )}
      </div>

      <div className="quiz-question__choices">
        {question.choices.map((choice) => {
          const isSelected = choice.id === selectedChoiceId;
          let stateClass = '';
          if (isAnswered) {
            if (choice.isCorrect) stateClass = 'choice--correct';
            else if (isSelected && !choice.isCorrect) stateClass = 'choice--wrong';
          } else if (isSelected) {
            stateClass = 'choice--selected';
          }

          return (
            <button
              key={choice.id}
              type="button"
              className={`quiz-question__choice ${stateClass}`}
              onClick={() => handleClick(choice.id)}
            >
              <span className="quiz-question__choice-label">{choice.label}</span>
              <span className="quiz-question__choice-text">{choice.text}</span>
            </button>
          );
        })}
      </div>

      <div className="quiz-question__feedback">
        {isAnswered && (
          isCorrect ? (
            <span className="quiz-question__feedback--correct">정답입니다!</span>
          ) : (
            <span className="quiz-question__feedback--wrong">틀렸습니다.</span>
          )
        )}
      </div>

      {isAnswered && question.explanation && (
        <div className="quiz-question__explanation">
          <h3>해설</h3>
          <p>{question.explanation}</p>
        </div>
      )}
    </div>
  );
}
