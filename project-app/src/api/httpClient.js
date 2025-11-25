// src/api/httpClient.js
import axios from "axios";
import { getAccessToken, setAccessToken, clearTokens } from "../utils/storage";

// 백엔드 API 베이스 URL
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080";

// ---------------------------
// 기본 axios 인스턴스
// ---------------------------
const httpClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // RefreshToken이 HttpOnly Cookie일 때 필수
});

// Refresh 전용 인스턴스 (인터셉터 영향 안 받게 별도 사용)
const refreshClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});
// ---------------------------
// 401 관련 전역 처리
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

/* --------------------------- */
/* 요청 인터셉터               */
/* --------------------------- */
httpClient.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);


// ---------------------------
// 응답 인터셉터
// ---------------------------
httpClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { config, response } = error;

    if (!response) return Promise.reject(error);
    if (response.status !== 401) return Promise.reject(error);

    const originalRequest = config;
    if (originalRequest._retry) return Promise.reject(error);
    originalRequest._retry = true;

    try {
      if (isRefreshing) {
        return new Promise((resolve) => {
          addRefreshSubscriber((newToken) => {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            resolve(httpClient(originalRequest));
          });
        });
      }
     isRefreshing = true;

      const refreshToken = getRefreshToken();

      const refreshResponse = await refreshClient.post("/api/auth/refresh", {
        refreshToken,
      });

      const newAccessToken = refreshResponse.data.accessToken;

      setAccessToken(newAccessToken);

      isRefreshing = false;
      onRefreshed(newAccessToken);

      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
      return httpClient(originalRequest);

    } catch (refreshError) {
      isRefreshing = false;
      clearTokens();
      window.location.href = "/api/auth/login";
      return Promise.reject(refreshError);
    }
  }
);

export default httpClient;
