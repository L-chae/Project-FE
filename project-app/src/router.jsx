// router.jsx
import { Routes, Route } from "react-router-dom";

import RegisterPage from "./pages/api/auth/signupPage";
import LoginPage from "./pages/auth/LoginPage";
import SetupPage from "./pages/auth/SetupPage";
import AccountFindPage from "./pages/auth/AccountFindPage";
import DashboardPage from "./pages/dashboard/DashboardPage";
import TodayWordCard from "./components/common/TodayWordCard";

function AppRouter() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <div className="page-container">
            {/* 홈 내용 */}
          </div>
        }
      />
      <Route path="/api/auth/login" element={<LoginPage />} />
      <Route path="/api/auth/signup" element={<RegisterPage />} />
      <Route path="/api/auth/setup" element={<SetupPage />} />
      <Route path="/api/auth/signup" element={<TodayWordCard />} />
      <Route path="/api/auth/find" element={<AccountFindPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
    </Routes>
  );
}

export default AppRouter;
