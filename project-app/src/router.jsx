// router.jsx
import { Routes, Route } from "react-router-dom";

import SignupPage from "./pages/auth/SignupPage";
import LoginPage from "./pages/auth/LoginPage";
import SetupPage from "./pages/auth/SetupPage";
import AccountFindPage from "./pages/auth/AccountFindPage";
import DashboardPage from "./pages/dashboard/DashboardPage";

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

      {/* Auth */}
      <Route path="/api/auth/login" element={<LoginPage />} />
      <Route path="/api/auth/signup" element={<SignupPage />} />
      <Route path="/api/auth/setup" element={<SetupPage />} />
      <Route path="/api/auth/find" element={<AccountFindPage />} />

      {/* Dashboard */}
      <Route path="/dashboard" element={<DashboardPage />} />
    </Routes>
  );
}

export default AppRouter;
