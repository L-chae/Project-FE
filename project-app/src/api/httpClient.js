// src/api/httpClient.js
import axios from "axios";
import {
  getAccessToken,
  setAccessToken,
  clearTokens,
  getRefreshToken,
  setRefreshToken, // 추가
} from "../utils/storage";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

const httpClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

const refreshClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

// ---------------------------
// Refresh 관련 상태
// ---------------------------
let isRefreshing = false;
let refreshSubscribers = [];

function onRefreshed(newToken) {
  refreshSubscribers.forEach((cb) => cb(newToken));
  refreshSubscribers = [];
}

function addRefreshSubscriber(cb) {
  refreshSubscribers.push(cb);
}

function setAuthHeader(config, token) {
  if (!token) return config;
  if (!config.headers) config.headers = {};
  config.headers.Authorization = `Bearer ${token}`;
  return config;
}

function redirectToLogin() {
  clearTokens();
  window.location.href = "/auth/login";
}

/* 요청 인터셉터 */
httpClient.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token && !config.headers?.Authorization) {
      setAuthHeader(config, token);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/* 응답 인터셉터 */
httpClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { config, response } = error;

    if (!response) {
      // 네트워크 에러 등
      return Promise.reject(error);
    }

    // 401 이 아니면 토큰 문제 아님
    if (response.status !== 401) {
      return Promise.reject(error);
    }

    const originalRequest = config;

    // ✅ 로그인 요청에서의 401은 refresh 시도하지 않음
    if (originalRequest.url?.includes("/api/auth/login")) {
      return Promise.reject(error);
    }

    // refresh 요청 자체에서 401, 또는 이미 재시도한 요청이면 바로 로그아웃
    if (
      originalRequest._retry ||
      originalRequest.url?.includes("/api/auth/refresh")
    ) {
      redirectToLogin();
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    const refreshToken = getRefreshToken();
    if (!refreshToken) {
      redirectToLogin();
      return Promise.reject(error);
    }

    try {
      if (isRefreshing) {
        return new Promise((resolve) => {
          addRefreshSubscriber((newToken) => {
            resolve(httpClient(setAuthHeader(originalRequest, newToken)));
          });
        });
      }

      isRefreshing = true;

      const refreshResponse = await refreshClient.post(
        "/api/auth/refresh",
        { refreshToken },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      } = refreshResponse.data || {};

      if (!newAccessToken) {
        isRefreshing = false;
        redirectToLogin();
        return Promise.reject(error);
      }

      setAccessToken(newAccessToken);
      if (newRefreshToken) {
        setRefreshToken(newRefreshToken);
      }

      isRefreshing = false;
      onRefreshed(newAccessToken);

      return httpClient(setAuthHeader(originalRequest, newAccessToken));
    } catch (refreshError) {
      isRefreshing = false;
      refreshSubscribers = []; // 대기 중인 요청 정리
      redirectToLogin();
      return Promise.reject(refreshError);
    }
  }
);

export default httpClient;
