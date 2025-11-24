// src/pages/auth/RegisterPage.jsx

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import Input from "../../components/common/Input";
import PasswordInput from "../../components/common/PasswordInput";
import Button from "../../components/common/Button";

import "../../styles/pages/register.css";
import { register as registerApi } from "../../api/authApi";

export default function RegisterPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    id: "",               
    email: "",
    password: "",
    passwordConfirm: "",
    nickname: "",
  });

  const [errors, setErrors] = useState({
    id: "",
    email: "",
    password: "",
    passwordConfirm: "",
    nickname: "",
  });
  const [globalError, setGlobalError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // 해당 필드 수정 시 에러 제거
    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
    setGlobalError("");
  };

  // 간단한 클라이언트 유효성 검사
  const validate = () => {
    const nextErrors = {
      id: "",
      email: "",
      password: "",
      passwordConfirm: "",
      nickname: "",
    };

    // 아이디 검증 (예: 4~20자, 공백X)
    if (!formData.id) {
      nextErrors.id = "아이디를 입력해 주세요.";
    } else if (formData.id.length < 4 || formData.id.length > 20) {
      nextErrors.id = "아이디는 4~20자 이내로 입력해 주세요.";
    } else if (/\s/.test(formData.id)) {
      nextErrors.id = "아이디에는 공백을 사용할 수 없습니다.";
    }

    // 이메일 검증
    if (!formData.email) {
      nextErrors.email = "이메일을 입력해 주세요.";
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      nextErrors.email = "이메일 형식이 올바르지 않습니다.";
    }

    // 비밀번호
    if (!formData.password) {
      nextErrors.password = "비밀번호를 입력해 주세요.";
    } else if (formData.password.length < 8) {
      nextErrors.password = "비밀번호는 8자 이상이어야 합니다.";
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
    } else if (formData.nickname.length > 20) {
      nextErrors.nickname = "닉네임은 20자 이내로 입력해 주세요.";
    }

    setErrors(nextErrors);

    const hasError = Object.values(nextErrors).some((msg) => !!msg);
    return !hasError;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGlobalError("");

    if (!validate()) {
      return;
    }

    setSubmitting(true);
    try {
      // 백엔드 스펙에 맞게 필드명(id/username 등) 확인 필요
      await registerApi({
        id: formData.id,
        email: formData.email,
        password: formData.password,
        nickname: formData.nickname,
      });

      // 회원가입 성공 → 로그인 페이지로 이동
      navigate("/auth/login", { replace: true });
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        "회원가입에 실패했습니다. 입력값을 다시 확인해 주세요.";
      setGlobalError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="page-container">
      <div className="register-card">
        {/* 왼쪽 일러스트 영역 */}
        <div className="register-visual">
          <div className="register-visual-inner">
            {/* 이미지/일러스트 추가 예정 */}
          </div>
        </div>

        {/* 오른쪽 회원가입 폼 */}
        <div className="register-form-area">
          <h1 className="register-title">회원가입</h1>

          <form onSubmit={handleSubmit} className="register-form">
            {/* 아이디 (로그인용 별도 필드) */}
            <div className="register-field">
              <label className="register-label">아이디</label>
              <Input
                type="text"
                name="id"
                placeholder="로그인에 사용할 아이디를 입력하세요"
                value={formData.id}
                onChange={handleChange}
                autoComplete="username"
                fullWidth
              />
              {errors.id && <p className="register-error">{errors.id}</p>}
            </div>

            {/* 이메일 */}
            <div className="register-field">
              <label className="register-label">이메일</label>
              <Input
                type="email"
                name="email"
                placeholder="이메일을 입력하세요"
                value={formData.email}
                onChange={handleChange}
                autoComplete="email"
                fullWidth
              />
              {errors.email && (
                <p className="register-error">{errors.email}</p>
              )}
            </div>

            {/* 비밀번호 */}
            <div className="register-field">
              <label className="register-label">비밀번호</label>
              <PasswordInput
                name="password"
                placeholder="비밀번호를 입력하세요"
                value={formData.password}
                onChange={handleChange}
                autoComplete="new-password"
                fullWidth
              />
              {errors.password && (
                <p className="register-error">{errors.password}</p>
              )}
            </div>

            {/* 비밀번호 확인 */}
            <div className="register-field">
              <label className="register-label">비밀번호 확인</label>
              <PasswordInput
                name="passwordConfirm"
                placeholder="비밀번호를 다시 입력하세요"
                value={formData.passwordConfirm}
                onChange={handleChange}
                autoComplete="new-password"
                fullWidth
              />
              {errors.passwordConfirm && (
                <p className="register-error">{errors.passwordConfirm}</p>
              )}
            </div>

            {/* 닉네임 */}
            <div className="register-field">
              <label className="register-label">닉네임</label>
              <Input
                type="text"
                name="nickname"
                placeholder="닉네임을 입력하세요"
                value={formData.nickname}
                onChange={handleChange}
                fullWidth
              />
              {errors.nickname && (
                <p className="register-error">{errors.nickname}</p>
              )}
            </div>

            {/* 전역 에러 메시지 */}
            {globalError && (
              <p className="register-error register-error-global">
                {globalError}
              </p>
            )}

            {/* 회원가입 버튼 */}
            <div className="register-btn">
              <Button
                type="submit"
                variant="primary"
                size="md"
                full
                disabled={submitting}
              >
                {submitting ? "가입 처리 중..." : "회원가입"}
              </Button>
            </div>

            {/* 로그인 이동 */}
            <div className="login-move-btn">
              <Button
                type="button"
                variant="secondary"
                size="md"
                full
                onClick={() => navigate("/auth/login")}
                disabled={submitting}
              >
                로그인 하러가기
              </Button>
            </div>

            {/* OR 구분선 */}
            <div className="register-divider">OR</div>

            {/* 구글 로그인 (아직 연동 전이면 버튼만) */}
            <button
              type="button"
              className="google-btn"
              disabled={submitting}
            >
              <img
                src="https://www.svgrepo.com/show/475656/google-color.svg"
                alt="google"
              />
              구글 계정으로 가입하기
            </button>

            {/* 이미 계정이 있는 경우 안내 텍스트 */}
            <p className="register-footer-text">
              이미 계정이 있으신가요?{" "}
              <Link to="/auth/login" className="register-link">
                로그인
              </Link>
            </p>
          </form>
        </div>
      </div>
    </main>
  );
}
