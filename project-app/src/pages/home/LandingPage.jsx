// src/pages/landing/LandingPage.jsx
import { useNavigate } from "react-router-dom";
import React, { useEffect } from "react";
import "./LandingPage.css";

import mainBg from "@/assets/images/main-bg.png";
import main2 from "@/assets/images/main-2.svg";
import StoryLexLogo from "@/assets/images/StoryLex-logo.svg";

const LandingPage = () => {
  const navigate = useNavigate();
  const goLogin = () => navigate("/auth/login");

  // 스크롤 리빌 애니메이션
  useEffect(() => {
    const handleScrollReveal = () => {
      const revealElements = document.querySelectorAll(".lp-reveal");

      revealElements.forEach((el) => {
        const windowHeight = window.innerHeight;
        const rect = el.getBoundingClientRect();
        const elementTop = rect.top;
        const elementBottom = rect.bottom;

        if (elementTop < windowHeight - 80 && elementBottom > 80) {
          el.classList.add("lp-reveal--active");
        } else {
          el.classList.remove("lp-reveal--active");
        }
      });
    };

    window.addEventListener("scroll", handleScrollReveal);
    handleScrollReveal();

    return () => window.removeEventListener("scroll", handleScrollReveal);
  }, []);

  return (
    <div className="lp-root">
      <main>
        {/* ============= HERO ============= */}
        <section className="lp-hero" id="home">
          <div className="lp-hero-bg" />
          <div className="page-container">
            <div className="lp-hero-layout lp-reveal lp-fade-up">
              {/* 왼쪽: 텍스트 */}
              <div className="lp-hero-content">
                <span className="lp-badge-primary">
                  StoryLex · AI 스토리 단어 학습
                </span>

                <h1 className="lp-hero-title">
                  외우지 말고 이해하는
                  <br />
                  <span className="lp-hero-title-accent">AI 스토리 단어장</span>
                </h1>

                <p className="lp-hero-description">
                  StoryLex는 퀴즈에서 틀린 단어를 모아 AI 스토리를 생성하고,
                  <br />
                  문맥 속에서 단어를 반복해서 만나도록 도와주는
                  영어 단어 학습 서비스입니다.
                </p>

                {/* 타이핑 효과 문구 */}
                <p className="lp-hero-typing">
                  <span className="lp-hero-typing-text">
                    오답 단어를 분석해 나만의 스토리로 바꿔드립니다.
                  </span>
                </p>

                <div className="lp-hero-actions">
                  <button
                    type="button"
                    className="lp-hero-button"
                    onClick={goLogin}
                  >
                    지금 시작하기
                    <i className="fa-solid fa-arrow-right" />
                  </button>
                  <span className="lp-hero-caption">
                    회원가입 후 AI 스토리와 단어장 기능을 이용할 수 있습니다.
                  </span>
                </div>

                {/* 간단한 특징 배지 */}
                <div className="lp-hero-metrics">
                  <div className="lp-metric-item">
                    <span className="lp-metric-label">AI Story</span>
                    <span className="lp-metric-sub">
                      오답 기반 개인 맞춤 스토리 생성
                    </span>
                  </div>
                  <div className="lp-metric-divider" />
                  <div className="lp-metric-item">
                    <span className="lp-metric-label">Cluster 단어장</span>
                    <span className="lp-metric-sub">
                      의미 네트워크 기반 단어 추천
                    </span>
                  </div>
                </div>
              </div>

              {/* 오른쪽: 이미지 (배경과 자연스럽게) */}
              <div className="lp-hero-visual">
                <div className="lp-hero-orbit">
                  {/* 보라 글로우 제거: CSS에서 숨김 처리 */}
                  <div className="lp-hero-orbit-ring" />
                  <img
                    src={mainBg}
                    alt="AI 단어 학습 시각화"
                    className="lp-hero-image"
                  />
                  {/* 오늘의 오답 단어 카드 제거 */}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============= PROCESS ============= */}
        <section
          className="lp-section lp-section--white"
          id="how-it-works"
        >
          <div className="page-container">
            <div className="lp-section-header lp-reveal lp-fade-up">
              <p className="lp-section-kicker">HOW IT WORKS</p>
              <h2 className="lp-section-title">어떻게 작동하나요?</h2>
              <p className="lp-section-description">
                오답 기록부터 AI 스토리 생성, 문맥 기반 재학습까지
                세 단계로 연결된 학습 흐름입니다.
              </p>
            </div>

            <div className="lp-process-grid lp-reveal lp-fade-up lp-delay-1">
              <article className="lp-process-card">
                <div className="lp-process-icon lp-process-icon--subtle">
                  <i className="fa-solid fa-pencil" />
                </div>
                <h3 className="lp-process-title">1. 문제 풀기</h3>
                <p className="lp-process-text">
                  단어 퀴즈를 풀면 틀린 단어가 자동으로 기록됩니다.
                  자주 틀리는 단어일수록 더 집중해서 복습할 수 있습니다.
                </p>
              </article>

              <article className="lp-process-card lp-process-card--accent">
                <div className="lp-process-icon lp-process-icon--accent">
                  <i className="fa-solid fa-robot" />
                </div>
                <h3 className="lp-process-title">2. AI 분석 & 스토리 생성</h3>
                <p className="lp-process-text">
                  오답 패턴과 난이도를 분석해 자연스러운 스토리를 만들고,
                  사용자의 수준에 맞는 문장을 구성합니다.
                </p>
              </article>

              <article className="lp-process-card">
                <div className="lp-process-icon lp-process-icon--subtle">
                  <i className="fa-solid fa-book-open" />
                </div>
                <h3 className="lp-process-title">3. 문맥 속 재학습</h3>
                <p className="lp-process-text">
                  스토리 속에서 여러 번 마주치는 단어를 통해
                  외우는 암기가 아니라, 실제로 이해하며 기억하게 됩니다.
                </p>
              </article>
            </div>
          </div>
        </section>

        {/* ============= FEATURES ============= */}
        <section className="lp-section lp-section--tint" id="features">
          <div className="page-container">
            <div className="lp-feature-layout">
              {/* 텍스트 */}
              <div className="lp-feature-content lp-reveal lp-fade-left">
                <p className="lp-section-kicker">FEATURES</p>
                <h2 className="lp-section-title">
                  단어를 따로 외우지 않아도,
                  <br />
                  스토리와 함께 자연스럽게 남습니다.
                </h2>
                <p className="lp-section-description">
                  StoryLex는 시험 대비부터 실무 영어까지,
                  <br />
                  사용자의 목표와 수준에 맞춰 단어와 스토리를 함께 추천합니다.
                </p>

                <div className="lp-feature-list">
                  <div className="lp-feature-item">
                    <div className="lp-feature-icon">
                      <i className="fa-solid fa-share-nodes" />
                    </div>
                    <div>
                      <h3>단어 클러스터</h3>
                      <p>
                        비슷한 의미·용법을 가진 단어를 하나의 클러스터로 묶어
                        보여줍니다.  
                        관련 단어를 한 번에 정리하며 학습할 수 있습니다.
                      </p>
                    </div>
                  </div>

                  <div className="lp-feature-item">
                    <div className="lp-feature-icon">
                      <i className="fa-solid fa-book-open" />
                    </div>
                    <div>
                      <h3>맞춤형 단어장</h3>
                      <p>
                        관심 분야, 목표, 난이도에 따라
                        지금 필요한 단어만 골라서 학습할 수 있습니다.
                      </p>
                    </div>
                  </div>

                  <div className="lp-feature-item">
                    <div className="lp-feature-icon">
                      <i className="fa-solid fa-robot" />
                    </div>
                    <div>
                      <h3>AI 스토리 재학습</h3>
                      <p>
                        오답 단어가 실제 문장과 스토리 속에서 반복 등장해
                        테스트와 실전 사용 사이의 간극을 줄여줍니다.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 이미지 (보라 글로우 제거, 깔끔하게) */}
              <div className="lp-feature-visual lp-reveal lp-fade-right lp-delay-1">
                <div className="lp-feature-orbit">
                  {/* 글로우는 CSS에서 숨김 */}
                  <img
                    src={main2}
                    alt="AI 학습 기능 화면"
                    className="lp-feature-image"
                  />
                  <div className="lp-feature-floating-chips">
                    <span className="lp-chip">
                      Cluster · travel / trip / journey
                    </span>
                    <span className="lp-chip lp-chip--soft">
                      Context learning
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============= BANNER ============= */}
        <section className="lp-section lp-banner-section">
          <div className="page-container">
            <div className="lp-banner lp-reveal lp-fade-up">
              <div className="lp-banner-text">
                <h2 className="lp-banner-title">
                  외워도 금방 잊는다면,
                  <br />
                  이제는 학습 방식을 바꿔볼 때입니다.
                </h2>
                <p className="lp-banner-subtitle">
                  문장과 스토리 속에서 단어를 이해하면,
                  <br />
                  시험이 끝나도 쉽게 사라지지 않는 단어장이 만들어집니다.
                </p>
              </div>

              <div className="lp-banner-actions">
                <button
                  type="button"
                  className="lp-banner-button"
                  onClick={goLogin}
                >
                  StoryLex 시작하기
                </button>
                <p className="lp-banner-caption">
                  회원가입 후 대시보드에서 AI 스토리와 단어 학습 기능을 바로
                  사용할 수 있습니다.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ============= FOOTER ============= */}
      <footer className="lp-footer">
        <div className="page-container">
          <div className="lp-footer-inner">
            <div className="lp-footer-col lp-footer-col--brand">
              <div className="lp-footer-logo">
                <img src={StoryLexLogo} alt="StoryLex Logo" />
              </div>
              <p className="lp-footer-description">
                AI 기반 스토리와 단어 클러스터를 통해
                <br />
                더 오래 남는 외국어 학습 경험을 제공합니다.
              </p>
            </div>

            <div className="lp-footer-col">
              <h4>서비스</h4>
              <a href="#features">기능 소개</a>
              <a href="#how-it-works">학습 흐름</a>
              <a href="#home">시작하기</a>
            </div>

            <div className="lp-footer-col">
              <h4>지원</h4>
              <a href="#faq">자주 묻는 질문</a>
              <a href="#cs">고객센터</a>
              <a href="#terms">이용약관</a>
            </div>
          </div>

          <div className="lp-footer-copy">
            &copy; 2025 StoryLex Inc. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
