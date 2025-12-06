// src/context/AuthContext.jsx
import React, {
  createContext,
  useState,
  useEffect,
  useContext,
} from "react";
import {
  login as loginApi,
  logout as logoutApi,
  getMe as getMeApi,
} from "../api/authApi";
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
  updateProfileState: () => {},
  loading: false,
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // -----------------------------
  // 앱 최초 로드시 세션 복원
  // -----------------------------
  useEffect(() => {
    // ✅ 목업 모드: 서버 호출 없이 localStorage 만 사용
    if (USE_MOCK) {
      const stored = localStorage.getItem("userInfo");
      if (stored) {
        try {
          setUser(JSON.parse(stored));
        } catch {
          setUser(null);
        }
      }
      setLoading(false);
      return;
    }

    // 실서버 모드: 토큰 있으면 /api/user/me로 검증
    const initAuth = async () => {
      const token = getAccessToken();

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const me = await getMeApi();
        setUser(me);
        localStorage.setItem("userInfo", JSON.stringify(me));
      } catch (e) {
        clearTokens();
        localStorage.removeItem("userInfo");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  // -----------------------------
  // 로그인
  // -----------------------------
  const login = async (email, password) => {
    if (USE_MOCK) {
      // 목업용: authApi.login 이 이미 mock 분기 처리하므로 그대로 사용해도 됨
      const { user: mockUser } = await loginApi({ email, password });
      setUser(mockUser);
      return mockUser;
    }

    const { user: userData } = await loginApi({ email, password });
    setUser(userData);
    localStorage.setItem("userInfo", JSON.stringify(userData));
    return userData;
  };

  // -----------------------------
  // 프로필 수정 시 상태/스토리지 동기화
  // -----------------------------
  const updateProfileState = (patch) => {
    setUser((prev) => {
      if (!prev) return prev;
      const nextUser = { ...prev, ...patch };
      localStorage.setItem("userInfo", JSON.stringify(nextUser));
      return nextUser;
    });
  };

  // -----------------------------
  // 로그아웃
  // -----------------------------
  const logout = async () => {
    const storedUser = localStorage.getItem("userInfo");
    let email;

    try {
      email = user?.email || (storedUser ? JSON.parse(storedUser).email : undefined);
    } catch {
      email = undefined;
    }

    setUser(null);
    localStorage.removeItem("userInfo");
    clearTokens();

    try {
      await logoutApi(email);
    } catch {
      // 무시
    }

    window.location.href = "/auth/login";
  };

  return (
    <AuthContext.Provider
      value={{ user, login, logout, updateProfileState, loading }}
    >
      {/* 초기 인증 체크 끝나기 전엔 children 렌더링 안 함 */}
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
