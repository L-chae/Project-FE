// import './Flashcard.css';

export function Flashcard({ front, back, isFlipped, onToggle }) {
  return (
    <div className="flashcard-wrapper" onClick={onToggle}>
      <div className={`flashcard ${isFlipped ? 'flashcard--flipped' : ''}`}>
        <div className="flashcard__face flashcard__face--front">
          <span className="flashcard__text">{front}</span>
        </div>
        <div className="flashcard__face flashcard__face--back">
          <span className="flashcard__text">{back}</span>
        </div>
      </div>
      <div className="flashcard__hint">카드를 클릭하면 뒤집힙니다</div>
    </div>
  );
}
