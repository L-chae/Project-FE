// src/pages/account/hooks/useLearningSettingsForm.js

import { useState } from "react";
import { updateUserInfo } from "../../../api/userApi";

export function useLearningSettingsForm(initial = {}) {

  // 서버는 문자열로 preference 를 저장하므로
  // 불러올 때 문자열이면 배열로 변환
  const parsedPreference =
    typeof initial.preference === "string"
      ? initial.preference.split(",").filter(Boolean)
      : Array.isArray(initial.preference)
      ? initial.preference
      : [];

  const safeInitial = {
    dailyWordGoal: initial.dailyWordGoal ?? 20,
    goal: initial.goal ?? "",
    preference: parsedPreference,
  };

  const [level, setLevel] = useState(safeInitial.dailyWordGoal);
  const [goal, setGoal] = useState(safeInitial.goal);
  const [selected, setSelected] = useState(safeInitial.preference);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // 관심 분야 토글
  const toggleField = (field) => {
    setSelected((prev) =>
      prev.includes(field)
        ? prev.filter((v) => v !== field)
        : [...prev, field]
    );
  };

  // 저장
  const handleSave = async () => {
    setSubmitting(true);
    setError("");

    try {
      await updateUserInfo({
        goal,
        dailyWordGoal: level,
        preference: selected.join(","), // ← ★ 핵심: 문자열로 변환해 서버로 전송
      });
    } catch (err) {
      setError("저장 중 오류가 발생했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  return {
    level,
    setLevel,
    goal,
    setGoal,
    selected,
    toggleField,
    submitting,
    error,
    handleSave,
  };
}
