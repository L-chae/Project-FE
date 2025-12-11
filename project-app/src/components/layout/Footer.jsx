import React from "react";
import "./Footer.css"; // 분리된 CSS import
import StoryLexLogo from "@/assets/images/StoryLex-logo.svg";

const Footer = () => {
  return (
    <footer className="lp-footer">
      <div className="page-container">
        <div className="lp-footer-inner">
          <div className="lp-footer-col lp-footer-logo">
            <img src={StoryLexLogo} alt="StoryLex Logo" />
            <p className="lp-footer-description">
              AI 기술을 활용하여 언어 학습의 <br />
              새로운 패러다임을 제시합니다.
            </p>
          </div>

          <div className="lp-footer-col">
            <h4>서비스</h4>
            {/* 참고: 랜딩 페이지 내의 섹션 이동이므로 <a> 태그와 ID(#)를 유지했습니다.
              다른 페이지(로그인 등)에서도 이 푸터를 쓴다면, 
              react-router-dom의 Link를 사용하거나 절대 경로("/")를 포함해야 할 수 있습니다. 
            */}
            <a href="/#features">주요 기능</a>
            <a href="/#how-it-works">학습 과정</a>
            <a href="/#home">메인으로</a>
          </div>

          <div className="lp-footer-col">
            <h4>지원</h4>
            <a href="#faq">자주 묻는 질문</a>
            <a href="#terms">이용약관</a>
            <a href="#privacy">개인정보처리방침</a>
          </div>
        </div>

        <div className="lp-footer-copy">
          &copy; 2025 StoryLex Inc. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;