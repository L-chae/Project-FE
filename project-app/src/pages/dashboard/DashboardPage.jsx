import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import Spinner from "../../components/common/Spinner";
import Button from "../../components/common/Button";
import PageHeader from "../../components/common/PageHeader";
import {
  ArrowRight,
  Flame,
  BookOpen,
  CalendarCheck,
  Layers,
  Trophy,
} from "lucide-react";
import {
  getDailyGoal,
  getDashboardStats,
  getWeeklyStudy,
  getWrongTop5,
} from "../../api/dashboardApi";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from "recharts";
import "./DashboardPage.css";

const getTimeBasedGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 11) return "좋은 아침이에요,";
  if (hour < 18) return "활기찬 오후예요,";
  return "오늘 하루도 수고하셨어요,";
};

const formatDateLabel = (dateStr) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  return `${d.getMonth() + 1}/${d.getDate()}`;
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload || payload.length < 2) return null;

  const learnedVal = payload[0]?.value ?? 0;
  const wrongVal = payload[1]?.value ?? 0;

  return (
    <div className="custom-tooltip">
      <p className="tooltip-date">{label}</p>
      <div className="tooltip-row">
        <span className="dot dot-learned" />
        <span>
          학습: <strong>{learnedVal}</strong>
        </span>
      </div>
      <div className="tooltip-row">
        <span className="dot dot-wrong" />
        <span>
          오답: <strong>{wrongVal}</strong>
        </span>
      </div>
    </div>
  );
};

const DashboardPage = () => {
  const { user: realUser } = useAuth();
  const navigate = useNavigate();

  const [currentUser, setCurrentUser] = useState(null);
  const [dailyGoalData, setDailyGoalData] = useState(null);
  const [statsData, setStatsData] = useState(null);
  const [weeklyData, setWeeklyData] = useState([]);
  const [wrongWordsList, setWrongWordsList] = useState([]);
  const [attendance, setAttendance] = useState(
    [false, false, false, false, false, false, false]
  );
  const [loading, setLoading] = useState(true);
  const [greeting, setGreeting] = useState("반가워요,");

  const weekDays = ["일", "월", "화", "수", "목", "금", "토"];

  useEffect(() => {
    setGreeting(getTimeBasedGreeting());
    if (!realUser) return;

    setCurrentUser(realUser);
    setLoading(true);

    Promise.all([
      getDailyGoal(),
      getDashboardStats(),
      getWeeklyStudy(),
      getWrongTop5(),
    ])
      .then(([dailyGoalObj, statsObj, weeklyStudyArr, wrongTop5]) => {
        setDailyGoalData(dailyGoalObj);
        setStatsData(statsObj);

        const sortedWeekly = [...weeklyStudyArr].sort(
          (a, b) => new Date(a.date) - new Date(b.date)
        );
        setWeeklyData(sortedWeekly);

        const attArr = sortedWeekly.map((day) => day.learnedCount > 0);
        setAttendance(attArr);

        setWrongWordsList(wrongTop5);
      })
      .catch((err) => {
        console.error("Dashboard load error:", err);
      })
      .finally(() => setLoading(false));
  }, [realUser]);

  if (loading || !currentUser || !dailyGoalData) {
    return (
      <Spinner fullHeight={true} message="대시보드를 불러오는 중입니다..." />
    );
  }

  const goal = dailyGoalData.dailyGoal || 50;
  const learned = dailyGoalData.todayProgress || 0;
  const progressPercent = Math.min(dailyGoalData.percentage || 0, 100);
  const remaining = Math.max(goal - learned, 0);

  const totalWords = statsData?.totalLearnedWords ?? 0;
  const streak = statsData?.streakDays ?? 0;

  const chartData = weeklyData.map((d) => ({
    date: formatDateLabel(d.date),
    learned: d.learnedCount,
    wrong: d.wrongCount,
  }));

  const totalLearned7 = weeklyData.reduce(
    (acc, cur) => acc + cur.learnedCount,
    0
  );

  const bestStudyDay =
    weeklyData.length > 0
      ? weeklyData.reduce(
          (best, cur) =>
            cur.learnedCount > (best?.learnedCount ?? -1) ? cur : best,
          null
        )
      : null;

  const bestStudyDayLabel = bestStudyDay ? formatDateLabel(bestStudyDay.date) : "-";
  const bestStudyDayCount = bestStudyDay?.learnedCount ?? 0;

  return (
    <div className="page-container mt-24 fade-in">
      <PageHeader title={greeting} highlight={`${currentUser.nickname}님!`} />

      <div className="dashboard-layout">
       {/* 1. 오늘의 학습 목표 */}
<section className="dashboard-card status-card">
  <div className="status-header">
    <h3 className="section-title">오늘의 학습 목표</h3>
  </div>

  <div className="status-body">
    {/* 왼쪽: 목표 숫자 + % + 진행바 */}
    <div className="status-progress-area">
      <div className="progress-header-row">
        <div className="progress-text-row">
          <div className="big-number">
            {learned}
            <span className="slash">/</span>
            <span className="goal-text">{goal} 단어</span>
          </div>
          <p className="remaining-text">
            {remaining > 0 ? (
              <>
                목표까지 <strong>{remaining}개</strong> 남았어요.
              </>
            ) : (
              "오늘의 목표 달성! 🎉"
            )}
          </p>
        </div>

        <div className="status-percent-area">
          <span className="percent-badge">
            {Math.round(progressPercent)}% 달성
          </span>
        </div>
      </div>

      <div className="progress-bar-bg">
        <div
          className="progress-bar-fill"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
    </div>

    {/* 오른쪽: 누적 / 연속 학습 */}
    <div className="status-metrics">
      <div className="metric-item">
        <div className="metric-icon">
          <BookOpen size={20} />
        </div>
        <div>
          <span className="metric-label">누적 학습</span>
          <div className="metric-value">
            {totalWords.toLocaleString()}
          </div>
        </div>
      </div>

      <div className="metric-item">
        <div className="metric-icon warn">
          <Flame size={20} />
        </div>
        <div>
          <span className="metric-label">연속 학습</span>
          <div className="metric-value highlight">
            {streak}일째
          </div>
        </div>
      </div>
    </div>
  </div>
</section>


        {/* 2. 이번 주 출석 현황 */}
        <section className="dashboard-card action-card">
          <div className="action-top">
            <div>
              <h3 className="section-title">이번 주 출석 현황</h3>
            </div>
            <div className="mini-calendar">
              {weekDays.map((day, i) => (
                <div
                  key={day + i}
                  className={`calendar-day ${attendance[i] ? "checked" : ""}`}
                >
                  {day}
                </div>
              ))}
            </div>
          </div>

          <div className="action-bottom">
            <Button
              variant="primary"
              size="md"
              full
              onClick={() => navigate("/learning/quiz?source=quiz")}
            >
              학습 시작하기
              <ArrowRight size={16} className="btn__icon btn__icon--right" />
            </Button>
          </div>
        </section>

        {/* 3. 주간 학습 분석 */}
        <section className="dashboard-card chart-card">
          <div className="card-header">
            <div>
              <h3 className="section-title">주간 학습 분석</h3>
              <p className="section-subtitle">최근 7일 학습 흐름</p>
            </div>
            <div className="chart-legend">
              <div className="legend-item">
                <span className="dot dot-learned" />
                학습
              </div>
              <div className="legend-item">
                <span className="dot dot-wrong" />
                오답
              </div>
            </div>
          </div>

          <div className="chart-container">
              <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartData} barGap={4}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f1f5f9"
                />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11, fill: "var(--neutral-500)" }}
                  dy={10}
                />
                <YAxis hide />
                <Tooltip content={<CustomTooltip />} cursor={{ opacity: 0.1 }} />
                <Bar
                  dataKey="learned"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={32}
                >
                  {chartData.map((_, index) => (
                    <Cell key={`learned-${index}`} fill="var(--primary-500)" />
                  ))}
                </Bar>
                <Bar
                  dataKey="wrong"
                  radius={[4, 4, 0, 0]}
                  fill="var(--warning-500)"
                  maxBarSize={32}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="kpi-row">
            <div className="kpi-card">
              <div className="kpi-icon-wrap kpi-icon-wrap--blue">
                <Layers size={18} />
              </div>
              <div className="kpi-content">
                <span className="kpi-label">이번 주 학습</span>
                <span className="kpi-main-text">
                  <strong>{totalLearned7}</strong> 단어
                </span>
              </div>
            </div>

            <div className="kpi-card">
              <div className="kpi-icon-wrap kpi-icon-wrap--yellow">
                <Trophy size={18} />
              </div>
              <div className="kpi-content">
                <span className="kpi-label">최고 기록일</span>
                <span className="kpi-main-text">
                  <strong>{bestStudyDayCount}</strong>개
                  {bestStudyDayLabel !== "-" && (
                    <span className="kpi-sub-date"> ({bestStudyDayLabel})</span>
                  )}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* 4. 자주 틀리는 단어 Top 5 */}
        <section className="dashboard-card wrong-card">
          <div className="card-header">
            <h3 className="section-title">자주 틀리는 단어</h3>
            <Button
              variant="text"
              size="sm"
              onClick={() => navigate("/learning/quiz?source=wrong-note")}
              style={{ padding: 0, height: "auto" }}
            >
              복습하기
              <ArrowRight size={14} className="btn__icon btn__icon--right" />
            </Button>
          </div>

          <ul className="wrong-list">
            {wrongWordsList.length === 0 ? (
              <li className="empty-state">
                <CalendarCheck size={24} className="empty-icon" />
                틀린 단어가 없습니다!
              </li>
            ) : (
              wrongWordsList.map((item, index) => (
                <li key={item.wordId ?? index} className="wrong-item">
                  <span
                    className={`rank-badge ${index === 0 ? "top1" : ""}`}
                  >
                    {index + 1}
                  </span>
                  <div className="word-info">
                    <span className="word-en">{item.word}</span>
                    <span className="word-ko">{item.meaning}</span>
                  </div>
                  <span className="wrong-count">{item.count}회</span>
                </li>
              ))
            )}
          </ul>
        </section>
      </div>
    </div>
  );
};

export default DashboardPage;
