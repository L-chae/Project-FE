// pages/dashboard/DashboardPage.jsx
import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import httpClient from "../../api/httpClient";
import "./DashboardPage.css";

const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true";

const DashboardPage = () => {
  const { user: realUser } = useAuth();

  const [currentUser, setCurrentUser] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);

  useEffect(() => {
    // MOCK 모드
    if (USE_MOCK) {
      console.log("📢 [MOCK] 대시보드 가짜 데이터 로딩 중...");
      setTimeout(() => {
        setCurrentUser({
          nickname: "테스트유저",
          email: "test@example.com",
        });
        // 🔹 백엔드 스펙에 맞춘 목업 데이터
        setDashboardData({
          dailyGoal: 30,       // 목표 단어 수
          todayProgress: 12,   // 오늘 공부한 수
          percentage: 40,      // 40%
        });
      }, 500);
      return;
    }

    // REAL 모드
    if (!realUser) return;

    setCurrentUser(realUser);

    httpClient
      .get("/api/dashboard")
      .then((res) => {
        console.log("대시보드 데이터 도착:", res.data);
        setDashboardData(res.data);
      })
      .catch((err) => {
        console.error("데이터 로딩 실패:", err);
        // 에러 나도 화면은 뜨게 0으로 세팅
        setDashboardData({
          dailyGoal: 0,
          todayProgress: 0,
          percentage: 0,
        });
      });
  }, [realUser]);

  // 로딩 상태
  if (!currentUser || !dashboardData) {
    return (
      <div className="page-container mt-24" style={{ textAlign: "center" }}>
        <p>데이터를 불러오는 중입니다...</p>
        <p style={{ fontSize: "12px", color: "#999" }}>
          (Tip: 계속 이 화면이라면 새로고침 하거나, USE_MOCK 설정을 확인하세요)
        </p>
      </div>
    );
  }

  // 안전한 값 추출
  const goal =
    typeof dashboardData.dailyGoal === "number" && dashboardData.dailyGoal > 0
      ? dashboardData.dailyGoal
      : 1;
  const learned =
    typeof dashboardData.todayProgress === "number"
      ? dashboardData.todayProgress
      : 0;

  const progressPercent =
    typeof dashboardData.percentage === "number"
      ? Math.min(Math.max(dashboardData.percentage, 0), 100)
      : Math.min((learned / goal) * 100, 100);

  return (
    <div className="page-container mt-24">
      <header className="dashboard-header">
        <h1 className="greeting">
          👋 반가워요,{" "}
          <span className="highlight">{currentUser.nickname || "회원"}</span>
          님!
        </h1>
        <p className="sub-text">오늘도 목표를 향해 달려볼까요?</p>
      </header>

      <div className="dashboard-grid mt-24">
        {/* 목표 카드 */}
        <div className="card stat-card">
          <div className="card-header">
            <h3>🎯 오늘의 목표</h3>
            <span className="goal-text">
              {Math.round(progressPercent)}% 달성
            </span>
          </div>

          <div className="big-number-box">
            <span className="current">{learned}</span>
            <span className="total"> / {goal}</span>
          </div>

          <div className="progress-bg">
            <div
              className="progress-fill"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* 안내 카드 */}
        <div className="card info-card">
          <h3>💡 학습 팁</h3>
          <p className="desc-text mt-12">
            단어장에서 <strong>'즐겨찾기'</strong>한 단어들은
            <br />
            필터 탭을 눌러 따로 모아볼 수 있어요.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
