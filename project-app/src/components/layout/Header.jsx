// src/components/layout/Header.jsx
import { useEffect, useRef, useState } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import userIcon from "../../assets/images/common/user-icon.svg";

import Button from "../common/Button";
import StoryLexLogo from "../../assets/images/StoryLex-logo.svg";

import "./Header.css";
import { useAuth } from "../../context/AuthContext";

// 로그인 후에만 보이는 메뉴
const AUTH_NAV_ITEMS = [
  { to: "/dashboard", label: "대시보드" },
  { to: "/words", label: "단어장" },
  { to: "/stories", label: "AI 스토리" },
  { to: "/learning", label: "학습하기" },
];

const AUTH_HOME_PATH = "/dashboard";
const GUEST_HOME_PATH = "/";

const getNavClass = ({ isActive }) =>
  "header-nav-link" + (isActive ? " header-nav-link--active" : "");

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const accountRef = useRef(null);

  const isAuthenticated = !!user;
  const isAuthPage = location.pathname.startsWith("/auth");
  const isLandingGuest = !isAuthenticated && location.pathname === "/";

  useEffect(() => {
    setIsAccountMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (accountRef.current && !accountRef.current.contains(e.target)) {
        setIsAccountMenuOpen(false);
      }
    };

    if (isAccountMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isAccountMenuOpen]);

  const handleLogoClick = () => {
    if (isAuthenticated) navigate(AUTH_HOME_PATH);
    else navigate(GUEST_HOME_PATH);
  };

  const handleLogoutClick = async () => {
    setIsAccountMenuOpen(false);
    try {
      await logout();
    } catch {
      // 무시
    }
  };

  const handleProfileClick = () => {
    setIsAccountMenuOpen((prev) => !prev);
  };

  // 로그인/회원가입 페이지에는 로고만 표시 (항상 솔리드 헤더)
  if (isAuthPage) {
    return (
      <header className="header header--solid">
        <div className="header-inner">
          <button
            type="button"
            className="header-logo"
            onClick={handleLogoClick}
          >
            <img
              src={StoryLexLogo}
              alt="StoryLex 로고"
              className="header-logo-img"
            />
          </button>
        </div>
      </header>
    );
  }

  const navItems = isAuthenticated ? AUTH_NAV_ITEMS : [];

  // 비회원+홈: 랜딩 스타일 / 나머지: 솔리드 스타일
  const headerClassName = `header ${
    isLandingGuest ? "header--landing" : "header--solid"
  }`;

  return (
    <header className={headerClassName}>
      <div className="header-inner">
        {/* 로고: 로그인 O → /dashboard, 로그인 X → / */}
        <button
          type="button"
          className="header-logo"
          onClick={handleLogoClick}
        >
          <img
            src={StoryLexLogo}
            alt="StoryLex 로고"
            className="header-logo-img"
          />
        </button>

        {/* 비회원일 때는 nav 자체를 렌더링하지 않음 */}
        {isAuthenticated && (
          <nav className="header-nav" aria-label="주요 메뉴">
            <div className="header-nav-group">
              {navItems.map((item) => (
                <NavLink key={item.to} to={item.to} className={getNavClass}>
                  {item.label}
                </NavLink>
              ))}
            </div>
          </nav>
        )}

        <div className="header-actions">
          {isAuthenticated ? (
            <div className="header-account" ref={accountRef}>
              <button
                type="button"
                className="header-profile"
                onClick={handleProfileClick}
                aria-haspopup="true"
                aria-expanded={isAccountMenuOpen}
                aria-label="계정 메뉴 열기"
              >
                <img
                  src={userIcon}
                  alt="user icon"
                  className="header-profile-icon"
                />
              </button>

              {isAccountMenuOpen && (
                <div className="header-account-menu">
                  <button
                    type="button"
                    className="header-account-menu-item"
                    onClick={() => {
                      setIsAccountMenuOpen(false);
                      navigate("/account/profile");
                    }}
                  >
                    내 정보 / 계정 설정
                  </button>
                  <button
                    type="button"
                    className="header-account-menu-item header-account-menu-item--danger"
                    onClick={handleLogoutClick}
                  >
                    로그아웃
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate("/auth/login")}
              >
                로그인
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => navigate("/auth/signup")}
              >
                회원가입
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
