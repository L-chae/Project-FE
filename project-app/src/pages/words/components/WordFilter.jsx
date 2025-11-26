import { useState } from "react";
import "./WordFilter.css";

function WordFilter({ filter, setFilter }) {
  const [openDropdown, setOpenDropdown] = useState(null);

  const categories = ["All", "Noun", "Verb", "Adj", "Adv"];
  const domains = ["All", "Business", "IT", "General", "Arts", "Literature"];
  const levels = ["All", "Lv.1", "Lv.2", "Lv.3"];

  const toggleDropdown = (name) => {
    setOpenDropdown(openDropdown === name ? null : name);
  };

  const selectOption = (type, value) => {
    setFilter((prev) => ({ ...prev, [type]: value }));
    setOpenDropdown(null);
  };

  return (
    <div className="filter-container">
      {/* 카테고리 */}
      <div className="dropdown-box">
        <button className="dropdown-btn" onClick={() => toggleDropdown("category")}>
          카테고리 ▾
        </button>

        {openDropdown === "category" && (
          <div className="dropdown-menu">
            {categories.map((c) => (
              <div
                key={c}
                className="dropdown-item"
                onClick={() => selectOption("category", c)}
              >
                {c}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 분야 */}
      <div className="dropdown-box">
        <button className="dropdown-btn" onClick={() => toggleDropdown("domain")}>
          분야 ▾
        </button>

        {openDropdown === "domain" && (
          <div className="dropdown-menu">
            {domains.map((d) => (
              <div
                key={d}
                className="dropdown-item"
                onClick={() => selectOption("domain", d)}
              >
                {d}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 난이도 */}
      <div className="dropdown-box">
        <button className="dropdown-btn" onClick={() => toggleDropdown("level")}>
          난이도 ▾
        </button>

        {openDropdown === "level" && (
          <div className="dropdown-menu">
            {levels.map((l) => (
              <div
                key={l}
                className="dropdown-item"
                onClick={() => selectOption("level", l)}
              >
                {l}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default WordFilter;
