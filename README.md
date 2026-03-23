# StoryLex Frontend
[![Live Demo](https://img.shields.io/badge/Vercel-Live_Demo-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://project-fe-ebon.vercel.app/)

오답 기반 학습과 동시 요청 안전 처리를 중심으로 한 React 웹 애플리케이션입니다.

## 기술 스택

- React 19, JavaScript (JSX)
- React Query 5.90 (API 상태)
- Zustand 5.0 (클라이언트 상태)
- Recharts 3.5 (데이터 시각화)
- Axios 1.13, MSW 2.12
- Vite 7.2

## 주요 기능

### 1. 학습 대시보드
- 주간 학습 활동 차트 (Bar Chart)
- 실시간 KPI (오늘 학습, 누적 단어, 연속 일수)
- 자주 틀리는 단어 테이블 (정렬: 횟수순/단어순)

### 2. 인증 동시성 제어 (Promise Queue)
동시 401 요청을 안전하게 처리:
- 첫 요청만 토큰 갱신
- 나머지는 대기 후 재시도
- 토큰 갱신 실패 시 세션 정리

구현: `src/api/httpClient.js`

### 3. MSW 기반 인증 테스트
- 401 상황 자동 재현
- 백엔드 없이 완전한 인증 흐름 검증

## 빠른 시작
```bash
cd project-app
npm install
npm run dev
```

## 스크린샷

### 대시보드
![Dashboard](./docs/dashboard.png)

### 오답노트
![Wrong Note](./docs/wrong-note.png)

### 학습
![Learning](./docs/learning.png)

## 주요 파일

- `src/pages/dashboard/DashboardPage.jsx` - 대시보드
- `src/api/httpClient.js` - Promise Queue 구현
- `src/mocks/handlers.js` - MSW 핸들러

## 상태 관리

- **React Query**: API 상태 (대시보드, 단어, 학습)
- **Zustand**: 사용자 인증, 학습 설정
- **Context API**: 인증 로직 통합
