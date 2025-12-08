// src/pages/wrongnote/components/WrongNoteItem.jsx

export function WrongNoteItem({ item, selected, onToggleSelect, onClick }) {
  // --- 단어/뜻: 문자열로 강제 변환 ---
  const rawWord = item.word || item.wordText || null;

  const word =
    typeof rawWord === "string"
      ? rawWord
      : rawWord && typeof rawWord === "object"
      ? rawWord.word ?? rawWord.text ?? ""
      : "";

  const rawMeaning =
    item.meaning ||
    item.korean ||
    item.meaningKo ||
    (rawWord && typeof rawWord === "object" ? rawWord.meaning : null);

  const meaning =
    typeof rawMeaning === "string"
      ? rawMeaning
      : rawMeaning && typeof rawMeaning === "object"
      ? rawMeaning.meaning ?? rawMeaning.meaningKo ?? ""
      : "";

  // --- 난이도 ---
  const rawLevel =
    item.wordLevel ??
    item.level ??
    (rawWord && typeof rawWord === "object" ? rawWord.level : null);

  const getLevelLabel = (lv) => {
    if (lv == null) return "-";

    const n = Number(lv);
    if (Number.isNaN(n)) return lv; // "EASY" / "HARD" 같은 문자열이면 그대로
    if (n <= 1) return "초급";
    if (n === 2) return "중급";
    if (n >= 3) return "고급";
    return `Lv.${n}`;
  };

  const levelLabel = getLevelLabel(rawLevel);

  // --- 마지막 오답 일시 ---
  const rawLastWrongAt = item.wrongAt || item.lastWrongAt || item.wrong_at;
  let lastWrongAtDate = "-";
  let lastWrongAtFull = "";

  if (rawLastWrongAt) {
    const d = new Date(rawLastWrongAt);
    if (!Number.isNaN(d.getTime())) {
      lastWrongAtDate = d.toLocaleDateString("ko-KR");
      lastWrongAtFull = d.toLocaleString("ko-KR");
    } else {
      lastWrongAtDate = rawLastWrongAt;
      lastWrongAtFull = rawLastWrongAt;
    }
  }

  // --- 오답 횟수 ---
  const totalWrong = item.totalWrong ?? item.wrongCount ?? item.wrong ?? 0;

  // --- 스토리 사용 여부 ---
  const used =
    item.isUsedInStory === "Y" ||
    item.isUsedInStory === "y" ||
    item.isUsedInStory === true;

  return (
    <tr className="wrongnote-item" onClick={onClick}>
      <td>
        <input
          type="checkbox"
          className="sl-checkbox"
          checked={selected}
          onChange={onToggleSelect}
        />
      </td>
      <td>{word}</td>
      <td>{meaning}</td>
      <td>{levelLabel}</td>
      <td title={lastWrongAtFull || undefined}>{lastWrongAtDate}</td>
      <td>{totalWrong}회</td>
      <td>
        {used ? (
          <span className="badge badge--used">사용됨</span>
        ) : (
          <span className="badge badge--unused">미사용</span>
        )}
      </td>
    </tr>
  );
}
