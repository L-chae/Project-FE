// import './WrongNoteItem.css';

export function WrongNoteItem({ item, selected, onToggleSelect, onClick }) {
  return (
    <tr
      className="wrongnote-item"
      onClick={onClick}
    >
      <td onClick={(e) => e.stopPropagation()}>
        <input
          type="checkbox"
          checked={selected}
          onChange={onToggleSelect}
        />
      </td>
      <td>{item.word}</td>
      <td>{item.meaning}</td>
      <td>{item.lastWrongAt}</td>
      <td>
        {item.totalCorrect} / {item.totalWrong}
      </td>
      <td>{item.status}</td>
      <td>{item.tag}</td>
      <td>
        {item.isUsedInStory === 'Y' ? (
          <span className="badge badge--used">스토리에 사용됨</span>
        ) : (
          <span className="badge badge--unused">미사용</span>
        )}
      </td>
    </tr>
  );
}
