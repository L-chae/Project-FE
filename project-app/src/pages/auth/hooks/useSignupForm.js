// src/pages/auth/hooks/useSignupForm.js
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { checkEmailDuplicate } from "../../../api/authApi"; // "@/api/authApi" 로 써도 됨

export function useSignupForm() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    passwordConfirm: "",
    nickname: "",
    userName: "",
    userBirth: "",
  });

  const [errors, setErrors] = useState({
    email: "",
    password: "",
    passwordConfirm: "",
    nickname: "",
    userName: "",
    userBirth: "",
  });

  const [globalError, setGlobalError] = useState("");

  // 이메일 중복 상태
  const [emailChecking, setEmailChecking] = useState(false);
  const [emailAvailable, setEmailAvailable] = useState(null); // true(사용 가능) / false(중복) / null(미확인)
  const [emailCheckMessage, setEmailCheckMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // 해당 필드 에러 초기화
    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
    setGlobalError("");

    if (name === "email") {
      // 이메일 변경 시 중복 결과 초기화
      setEmailAvailable(null);
      setEmailCheckMessage("");
    }
  };

  // 이메일 중복 확인 버튼 핸들러
  const handleEmailCheck = async () => {
    const email = formData.email.trim();

    // 비어 있으면
    if (!email) {
      setErrors((prev) => ({
        ...prev,
        email: "이메일을 입력해 주세요.",
      }));
      return;
    }

    // 형식 검증
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setErrors((prev) => ({
        ...prev,
        email: "이메일 형식이 올바르지 않습니다.",
      }));
      return;
    }

    setEmailChecking(true);
    setEmailCheckMessage("");
    setGlobalError("");

    try {
      // 백엔드 명세: { exists: boolean, message: string }
      const { exists, message } = await checkEmailDuplicate(email);

      // exists = true → 이미 사용 중, exists = false → 사용 가능
      setEmailAvailable(!exists);
      setEmailCheckMessage(message || "");

      setErrors((prev) => ({
        ...prev,
        email: exists ? "이미 사용 중인 이메일입니다." : "",
      }));
    } catch (err) {
      console.error("[useSignupForm] 이메일 중복 확인 실패", err);
      setEmailAvailable(null);
      setEmailCheckMessage("");
      setGlobalError(
        "이메일 중복 확인 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요."
      );
    } finally {
      setEmailChecking(false);
    }
  };

  const validate = () => {
    const nextErrors = {
      email: "",
      password: "",
      passwordConfirm: "",
      nickname: "",
      userName: "",
      userBirth: "",
    };

    // 이메일
    if (!formData.email) {
      nextErrors.email = "이메일을 입력해 주세요.";
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      nextErrors.email = "이메일 형식이 올바르지 않습니다.";
    } else if (emailAvailable === false) {
      // 중복으로 판정된 경우
      nextErrors.email = "이미 사용 중인 이메일입니다.";
    }

    // 비밀번호
    if (!formData.password) {
      nextErrors.password = "비밀번호를 입력해 주세요.";
    } else if (formData.password.length < 4) {
      nextErrors.password = "비밀번호는 4자 이상이어야 합니다.";
    }

    // 비밀번호 확인
    if (!formData.passwordConfirm) {
      nextErrors.passwordConfirm = "비밀번호를 한 번 더 입력해 주세요.";
    } else if (formData.password !== formData.passwordConfirm) {
      nextErrors.passwordConfirm = "비밀번호가 서로 일치하지 않습니다.";
    }

    // 닉네임
    if (!formData.nickname) {
      nextErrors.nickname = "닉네임을 입력해 주세요.";
    } else if (formData.nickname.length > 100) {
      nextErrors.nickname = "닉네임은 100자 이내로 입력해 주세요.";
    }

    // 이름
    if (!formData.userName) {
      nextErrors.userName = "이름을 입력해 주세요.";
    } else if (formData.userName.length > 50) {
      nextErrors.userName = "이름은 50자 이내로 입력해 주세요.";
    }

    // 생년월일
    if (!formData.userBirth) {
      nextErrors.userBirth = "생년월일을 입력해 주세요.";
    }

    setErrors(nextErrors);
    const hasError = Object.values(nextErrors).some((msg) => !!msg);
    return !hasError;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setGlobalError("");

    // 아직 이메일 중복 체크 호출 중이면 제출 막기
    if (emailChecking) {
      setGlobalError("이메일 중복 확인이 끝난 후 다시 시도해 주세요.");
      return;
    }

    if (!validate()) return;

    navigate("/auth/setup", {
      state: {
        basicInfo: {
          email: formData.email,
          password: formData.password,
          nickname: formData.nickname,
          userName: formData.userName,
          userBirth: formData.userBirth,
        },
      },
    });
  };

  return {
    formData,
    errors,
    globalError,
    emailChecking,
    emailAvailable,
    emailCheckMessage,
    handleSubmit,
    handleChange,
    handleEmailCheck,
  };
}
