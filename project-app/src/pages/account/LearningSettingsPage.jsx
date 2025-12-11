// src/pages/account/LearningSettingsPage.jsx

import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import { useNavigate } from "react-router-dom";
import { useLearningSettingsForm } from "./hooks/useLearningSettingsForm";
import "./LearningSettingsPage.css";

const MIN_LEVEL = 5;
const MAX_LEVEL = 50;
const STEP = 5;

const FIELD_OPTIONS = [
  { label: "일상생활", value: "DAILY_LIFE" },
  { label: "사람/감정", value: "PEOPLE_FEELINGS" },
  { label: "직장/비즈니스", value: "BUSINESS" },
  { label: "학교/학습", value: "SCHOOL_LEARNING" },
  { label: "여행/교통", value: "TRAVEL" },
  { label: "음식/건강", value: "FOOD_HEALTH" },
  { label: "기술/IT", value: "TECHNOLOGY" },
];

export default function LearningSettingsPage() {
  const navigate = useNavigate();

  const {
    level,
    setLevel,
    goal,
    setGoal,
    selected,
    submitting,
    error,
    toggleField,
    handleSave,
  } = useLearningSettingsForm();

  return (
    <main className="learning-settings-container">

      {/* 🔹 제목 */}
      <h1 className="settings-title">학습 설정</h1>
      <p className="settings-subtitle">
        목표와 관심 분야를 설정해 더 정확한 추천을 받아보세요.
      </p>

      {/* 🔹 카드 */}
      <div className="setup-card setup-card--single">

        {/* 관심 분야 */}
        <div className="setup-section">
          <label className="setup-label">관심 분야</label>
          <div className="setup-tags">
            {FIELD_OPTIONS.map((field) => (
              <button
                key={field.value}
                type="button"
                className={`setup-tag ${
                  selected.includes(field.value) ? "active" : ""
                }`}
                onClick={() => toggleField(field.value)}
                disabled={submitting}
              >
                {field.label}
              </button>
            ))}
          </div>
        </div>

        {/* 학습 목표 */}
        <div className="setup-section">
          <label className="setup-label">나의 다짐 (Goal)</label>
          <Input
            type="text"
            placeholder="예: 취업 준비, 해외 여행, 발표 준비 등"
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            fullWidth
            disabled={submitting}
          />
        </div>

        {/* 🔹 하루 목표 단어 수 */}
        <div className="setup-section">
          <label className="setup-label">일일 목표 단어 수</label>

          <div className="setup-slider-box">
            <span className="slider-value">{level}</span>

            <input
              type="range"
              min={MIN_LEVEL}
              max={MAX_LEVEL}
              step={STEP}
              value={level}
              onChange={(e) => setLevel(Number(e.target.value))}
              className="input-range setup-slider"
              style={{
                "--range-progress": `${((level - MIN_LEVEL) * 100) /
                  (MAX_LEVEL - MIN_LEVEL)}%`,
              }}
              disabled={submitting}
            />

            <div className="slider-labels">
              <span>Easy (5)</span>
              <span>Challenge (50)</span>
            </div>
          </div>
        </div>

        {/* 에러 메시지 */}
        {error && <p className="form-error">{error}</p>}

        {/* 🔹 저장 버튼 */}
        <div className="btn-wrapper">
          <Button
            variant="primary"
            size="md"
            full
            disabled={submitting}
            onClick={async () => {
              await handleSave();
              navigate("/dashboard");
            }}
          >
            {submitting ? "저장 중..." : "저장하기 →"}
          </Button>
        </div>

      </div>
    </main>
  );
}
