// src/context/AuthContext.jsx
import React, {
  createContext,
  useState,
  useEffect,
  useContext,
} from "react";
import { login as loginApi, logout as logoutApi } from "../api/authApi";
import {
  getAccessToken,
  setAccessToken,
  setRefreshToken,
  clearTokens,
} from "../utils/storage";

const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true";

const AuthContext = createContext({
  user: null,
  login: async () => {},
  logout: async () => {},
  updateProfileState: () => {},   // ✅ 기본값 추가
  loading: false,
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 최초 로드 시 토큰 + userInfo로 세션 복원
  useEffect(() => {
    const checkLogin = async () => {
      try {
        const token = getAccessToken();
        const storedUser = localStorage.getItem("userInfo");

        if (token && storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } finally {
        setLoading(false);
      }
    };

    checkLogin();
  }, []);

  // 공통 로그인 함수 (MOCK + REAL)
  const login = async (email, password) => {
    if (USE_MOCK) {
      const mockUser = {
        email,
        nickname: "Mock User",
      };

      setAccessToken("mock_access_token");
      setRefreshToken("mock_refresh_token");
      localStorage.setItem("userInfo", JSON.stringify(mockUser));
      setUser(mockUser);

      return mockUser;
    }

    const { user: userData } = await loginApi({ email, password });

    setUser(userData);
    localStorage.setItem("userInfo", JSON.stringify(userData));
    return userData;
  };

  // ✅ 프로필 수정 시 user / localStorage 동기화
  const updateProfileState = (patch) => {
    setUser((prev) => {
      if (!prev) return prev;
      const nextUser = { ...prev, ...patch };
      localStorage.setItem("userInfo", JSON.stringify(nextUser));
      return nextUser;
    });
  };

  const logout = async () => {
    const storedUser = localStorage.getItem("userInfo");
    let email;

    try {
      email =
        user?.email ||
        (storedUser ? JSON.parse(storedUser).email : undefined);
    } catch {
      email = undefined;
    }

    setUser(null);
    localStorage.removeItem("userInfo");
    clearTokens();

    // MOCK 모드에서는 서버 로그아웃 안 쏴도 됨
    if (!USE_MOCK && email) {
      try {
        await logoutApi(email);
      } catch {
        // 서버 에러는 무시
      }
    }

    window.location.href = "/auth/login";
  };

  return (
    <AuthContext.Provider
      value={{ user, login, logout, updateProfileState, loading }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
