// src/components/common/FilterDropdown.jsx
import { ChevronDown } from "lucide-react";
import "./FilterDropdown.css";

function FilterDropdown({
  id,
  label,
  options,
  value,
  isOpen,
  onToggle,     // (id) => void
  onChange,     // (id, nextValue) => void
}) {
  const current = options.find((opt) => opt.value === value) || options[0];
  const isSelected = value !== options[0].value;

  const handleSelect = (nextValue) => {
    // 값 변경
    onChange(id, nextValue);
    // 선택 후 드롭다운 닫기 (부모가 토글 방식이라고 가정)
    onToggle(id);
  };

  return (
    <div className="filter-group">
      {label && <span className="filter-label">{label}</span>}

      <div className="dropdown-box">
        <button
          type="button"
          className={`dropdown-btn no-select ${isSelected ? "selected" : ""}`}
          onClick={() => onToggle(id)}
        >
          {current.label}
          <ChevronDown size={14} className="arrow" />
        </button>

        {isOpen && (
          <div className="dropdown-menu">
            {options.map((opt) => (
              <button
                key={opt.value}
                type="button"
                className={`dropdown-item ${
                  value === opt.value ? "active" : ""
                }`}
                onClick={() => handleSelect(opt.value)}
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default FilterDropdown;