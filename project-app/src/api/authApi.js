// src/api/authApi.js
import httpClient from "./httpClient";
import {
  setAccessToken,
  setRefreshToken,
  clearTokens,
} from "../utils/storage";

const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true";

/**
 * 이메일 찾기
 * Request:  { userName, userBirth: "YYYY-MM-DD" }
 * Response: { email }
 */
export async function findEmail(userName, userBirth) {
  if (USE_MOCK) {
    // 목업용 더미 응답
    return {
      email: `${userName || "user"}@mock.local`,
    };
  }

  const res = await httpClient.post("/api/auth/find-email", {
    userName,
    userBirth,
  });
  return res.data; // { email }
}

/**
 * 비밀번호 재설정 (임시 비밀번호 발송)
 * Request:  { userName, email }
 * Response: { message }
 */
export async function resetPassword(userName, email) {
  if (USE_MOCK) {
    return {
      message: "임시 비밀번호가 이메일로 발송되었습니다. (mock)",
    };
  }

  const res = await httpClient.post("/api/auth/reset-password", {
    userName,
    email,
  });
  return res.data; // { message }
}

/**
 * 로그인
 *
 * 실서버 모드:
 *  - POST /api/auth/login → { accessToken, refreshToken }
 *  - 이후 GET /api/user/me → user 정보
 *
 * 목업 모드:
 *  - 서버 호출 없이 로컬에서 토큰/유저 생성
 */
export async function login({ email, password }) {
  if (USE_MOCK) {
    const mockUser = {
      userId: 1,
      email,
      nickname: "Mock User",
      userName: "목업 유저",
      userBirth: "2000-01-01",
      preference: null,
      goal: null,
      dailyWordGoal: 10,
    };

    setAccessToken("mock_access_token");
    setRefreshToken("mock_refresh_token");
    localStorage.setItem("userInfo", JSON.stringify(mockUser));

    return { user: mockUser };
  }

  // 1) 토큰 발급
  const res = await httpClient.post("/api/auth/login", {
    email,
    password,
  });

  const { accessToken, refreshToken } = res.data;

  if (accessToken && refreshToken) {
    setAccessToken(accessToken);
    setRefreshToken(refreshToken);
  }

  // 2) 토큰 설정 후 내 정보 조회
  let user = { email }; // 최소 fallback
  try {
    const meRes = await httpClient.get("/api/user/me");
    user = meRes.data;
  } catch (e) {
    console.error("Failed to fetch /api/user/me", e);
  }

  return { user };
}

/**
 * 회원가입
 */
export async function signup({
  email,
  password,
  nickname,
  userName,
  userBirth,
}) {
  if (USE_MOCK) {
    return {
      success: true,
      message: "회원가입 완료 (mock)",
    };
  }

  const res = await httpClient.post("/api/auth/signup", {
    email,
    password,
    nickname,
    userName,
    userBirth,
  });

  return res.data; // { success, message }
}

/**
 * 로그아웃
 */
export async function logout(email) {
  // 클라이언트 토큰 제거
  clearTokens();

  // 전역 로그아웃 이벤트 (상태 관리용)
  window.dispatchEvent(new Event("auth:logout"));

  // 목업 모드에서는 서버 호출 안 함
  if (USE_MOCK) {
    return;
  }

  try {
    await httpClient.post(`/api/auth/logout/${email}`);
  } catch {
    // 서버 응답 실패해도 클라이언트는 이미 로그아웃 처리된 상태
  }
}

/**
 * 현재 로그인한 사용자 정보 조회
 */
export async function getMe() {
  if (USE_MOCK) {
    const stored = localStorage.getItem("userInfo");
    if (!stored) {
      throw new Error("No userInfo in mock mode");
    }
    try {
      return JSON.parse(stored);
    } catch {
      throw new Error("Invalid userInfo JSON in mock mode");
    }
  }

  const res = await httpClient.get("/api/user/me");
  return res.data;
}
