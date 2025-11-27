export function ProgressBar({ value }) {
  const pct = Math.round((value || 0) * 100);
  return (
    <div className="progress-bar">
      <div className="progress-bar__track">
        <div
          className="progress-bar__fill"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="progress-bar__label">{pct}%</span>
    </div>
  );
}
