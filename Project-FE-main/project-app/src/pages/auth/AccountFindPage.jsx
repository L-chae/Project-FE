import { useState } from "react";
import "./AccountFindPage.css";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import Logo from "../../assets/images/StoryLex-logo.svg"; // 로고 가져오기

export default function AccountFindPage() {
  const [tab, setTab] = useState("id");

  return (
    <main className="find-page">
      <div className="find-card-center">

        {/* 로고 단독 표시 */}
        <div className="find-logo-wrap">
          <img src={Logo} alt="StoryLex Logo" className="find-logo-large" />
        </div>

        <h2 className="find-title">계정 찾기</h2>
        <p className="find-subtitle">가입 시 등록한 정보로 계정을 확인합니다.</p>

        {/* 탭 */}
        <div className="find-tabs-center">
          <button 
            className={tab === "id" ? "active" : ""} 
            onClick={() => setTab("id")}
          >
            아이디 찾기
          </button>
          <button 
            className={tab === "pw" ? "active" : ""} 
            onClick={() => setTab("pw")}
          >
            비밀번호 찾기
          </button>
        </div>

        {/* 아이디 찾기 */}
        {tab === "id" && (
          <div className="find-content">
            <div className="find-field">
              <label>이름</label>
              <Input fullWidth placeholder="홍길동" />
            </div>

            <div className="find-field">
              <label>이메일</label>
              <Input fullWidth type="email" placeholder="example@email.com" />
            </div>

            <Button variant="primary" size="md" full>
              아이디 찾기
            </Button>
          </div>
        )}

        {/* 비밀번호 찾기 */}
        {tab === "pw" && (
          <div className="find-content">
            <div className="find-field">
              <label>아이디</label>
              <Input fullWidth placeholder="user_id" />
            </div>

            <div className="find-field">
              <label>이메일</label>
              <Input fullWidth type="email" placeholder="example@email.com" />
            </div>

            <Button variant="primary" size="md" full>
              비밀번호 재설정 링크 받기
            </Button>
          </div>
        )}

        <div className="find-back">
          <a href="/api/auth/login">← 로그인 페이지로</a>
        </div>
      </div>
    </main>
  );
}
