# Word Service API 명세 (Front-end Criteria)

이 문서는 프론트엔드(`React`) 기준에서 필요한 백엔드 API 규격을 정의합니다.

## 🔑 공통 전제 (Common Prerequisites)

### 1\. 인증 (Authentication)

모든 단어 관련 API는 **로그인 사용자 기준** 데이터를 사용합니다.

  * **Request Header**:
    ```http
    Authorization: Bearer {accessToken}
    ```
  * **Front-end Logic**: `localStorage.getItem("accessToken")` 값을 읽어서 헤더에 포함합니다.

### 2\. 에러 처리 (Error Handling)

  * **401 Unauthorized**: 프론트엔드에서 로그인 페이지로 리다이렉트 처리합니다.
  * **그 외 에러**: 단순 Toast/Alert 메시지로 처리하므로, 구체적인 Error Response Body 구조에 크게 의존하지 않습니다.

-----

## 1\. 단어 목록 조회 (Get Word List)

전체 단어 목록을 페이징하여 조회합니다.

  - **Method**: `GET`
  - **URL**: `/words`

### Request Parameters

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `page` | `number` | Yes | **1부터 시작** (백엔드에서 0-based 처리 필요 시 변환 요망) |
| `size` | `number` | Yes | 한 번에 가져올 개수 (현재 **100** 고정 호출) |

### Request Example

```http
GET /words?page=1&size=100
Authorization: Bearer {accessToken}
```

### Response Example

```json
{
  "content": [
    {
      "wordId": 1,
      "word": "Coffee",
      "meaning": "커피",
      "partOfSpeech": "Noun",
      "domain": "Daily Life",
      "category": "Daily Life",
      "level": 1,
      "isFavorite": false,
      "isCompleted": false,
      "exampleSentence": "I drink coffee every morning."
    }
  ],
  "totalPages": 1,
  "totalElements": 12,
  "page": 1,
  "size": 100
}
```

### 필드 상세 및 필터링 규칙 (Fields & Filters)

프론트엔드 필터링 기능을 위해 아래 필드는 **지정된 문자열/값**을 준수해야 합니다.

| Field | Description / Allowed Values | Note |
| :--- | :--- | :--- |
| `partOfSpeech` | `Noun`, `Verb`, `Adj`, `Adv` | 품사 필터 |
| `domain` | `Daily Life`<br>`People & Feelings`<br>`Business`<br>`School & Learning`<br>`Travel`<br>`Food & Health`<br>`Technology` | **정확히 일치하는 문자열**이어야 필터 동작 |
| `level` | `1` \~ `6` (Integer) | 난이도 |
| `isFavorite` | `true` / `false` | 즐겨찾기 여부 |
| `isCompleted` | `true` / `false` | 학습 완료 여부 |

-----

## 2\. 단어 상세 조회 (Get Word Detail)

특정 단어의 상세 정보를 조회합니다.

  - **Method**: `GET`
  - **URL**: `/words/{wordId}`

### Request Example

```http
GET /words/3
Authorization: Bearer {accessToken}
```

### Response Example

목록 조회 시의 아이템 구조와 동일합니다.

```json
{
  "wordId": 3,
  "word": "Algorithm",
  "meaning": "알고리즘",
  "partOfSpeech": "Noun",
  "domain": "Technology",
  "category": "Technology",
  "level": 4,
  "isFavorite": true,
  "isCompleted": true,
  "exampleSentence": "This algorithm improves search results."
}
```

-----

## 3\. 즐겨찾기 관리 (Favorites)

프론트엔드는 현재 상태(`isFavorite`)를 확인 후 추가/삭제 API를 각각 호출합니다.

### 3-1. 즐겨찾기 추가 (Add)

  - **Method**: `POST`
  - **URL**: `/favorite/{wordId}`
  - **Body**: 없음 (Empty)

<!-- end list -->

```http
POST /favorite/3
Authorization: Bearer {accessToken}
```

### 3-2. 즐겨찾기 삭제 (Remove)

  - **Method**: `DELETE`
  - **URL**: `/favorite/{wordId}`

<!-- end list -->

```http
DELETE /favorite/3
Authorization: Bearer {accessToken}
```

> **Note**: 응답 Body는 사용하지 않으므로 `200 OK` Status만 보장되면 됩니다.

-----

## 4\. 학습 상태 토글 (Toggle Progress)

학습 완료 여부(`isCompleted`)를 토글합니다. 목록 및 상세 페이지에서 공통으로 사용됩니다.

  - **Method**: `POST`
  - **URL**: `/progress/{wordId}`

### Request Example

Body 없이 호출 시, 서버에서 현재 상태를 반전(`true` ↔ `false`)시킵니다.

```http
POST /progress/3
Authorization: Bearer {accessToken}
```

### Response Example (Optional)

프론트엔드에서는 Status Code만 확인하지만, 확장성을 위해 변경된 상태를 내려주셔도 무방합니다.

```json
{
  "wordId": 3,
  "isCompleted": true
}
```

> **협의 사항**: 만약 토글 방식이 아닌 명시적 값 전달을 원할 경우, Body에 `{"isCompleted": true}`를 실어 보내도록 프론트 로직 수정이 가능합니다.

-----

# 🔐 Auth & User API 명세 (Front-end Criteria)

이 문서는 회원가입, 로그인, 사용자 정보 관리 및 대시보드와 관련된 API 규격을 정의합니다.

## 🔑 공통 전제 (Common Prerequisites)

### 1\. 환경 설정 & 인증

  - **Base URL**: `VITE_API_BASE_URL` (로컬 환경: `http://localhost:8080`)
  - **Authorization**: 모든 보호된 API 요청 시 헤더에 토큰 포함
    ```http
    Authorization: Bearer {accessToken}
    ```

### 2\. 토큰 및 스토리지 관리 (Front-end Logic)

프론트엔드(`FE`)는 브라우저 `localStorage`를 사용하여 데이터를 관리합니다.

| Key | Value Description |
| :--- | :--- |
| `accessToken` | API 요청 시 사용하는 인증 토큰 |
| `refreshToken` | Access Token 만료 시 재발급용 토큰 |
| `userInfo` | 사용자 정보 객체 (최소 `{ email, nickname }` 포함) |

### 3\. 토큰 만료 처리 시나리오 (401 Handling)

1.  일반 API 호출 시 `401 Unauthorized` 응답 수신.
2.  FE 내부 로직으로 `/api/auth/refresh` 호출 (Payload: `localStorage.refreshToken`).
3.  **성공 시**: 새 `accessToken` 저장 후, 실패했던 원래 요청 재시도.
4.  **실패 시**: 로그아웃 처리 (스토리지 비우기) 후 `/auth/login` 페이지로 이동.

-----

## 1\. Auth API (인증)

### 1-1. 회원가입

  - **Method**: `POST`
  - **URL**: `/api/auth/signup`

**Request Body (JSON)**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `email` | string | Yes | 로그인 ID |
| `password` | string | Yes | |
| `nickname` | string | Yes | |
| `userName` | string | Yes | 실명 |
| `userBirth` | string | Yes | `YYYY-MM-DD` |
| `preference` | string | No | 관심 분야 (예: `"DAILY_LIFE,TECHNOLOGY"`) |
| `goal` | string | No | 학습 목표 |
| `dailyWordGoal` | number | No | 일일 목표 단어 수 (Default: 20) |

**Response Example**

```json
{
  "success": true,
  "message": "Signup completed"
}
```

### 1-2. 로그인

  - **Method**: `POST`
  - **URL**: `/api/auth/login`

**Request Body (JSON)**

```json
{
  "email": "test@test.com",
  "password": "1234"
}
```

**Response Example**

> **Note**: `user` 객체 필드가 없어도 `email`은 필수이며, 가능하면 아래 전체 정보를 내려주는 것을 권장합니다.

```json
{
  "accessToken": "JWT_ACCESS_TOKEN_STRING",
  "refreshToken": "JWT_REFRESH_TOKEN_STRING",
  "user": {
    "email": "test@test.com",
    "nickname": "hyuk",
    "userName": "최종혁",
    "userBirth": "2000-01-01",
    "preference": "DAILY_LIFE,TECHNOLOGY",
    "goal": "올해 토익 900",
    "dailyWordGoal": 20
  }
}
```

### 1-3. 토큰 재발급 (Refresh)

  - **Method**: `POST`
  - **URL**: `/api/auth/refresh`

**Request Body (JSON)**

```json
{
  "refreshToken": "JWT_REFRESH_TOKEN_STRING"
}
```

**Response Example**

  - `accessToken`은 필수, `refreshToken`은 갱신(Rotation) 전략 사용 시 포함.
  - 유효하지 않은 토큰일 경우 `401` 반환.

<!-- end list -->

```json
{
  "accessToken": "NEW_ACCESS_TOKEN",
  "refreshToken": "NEW_REFRESH_TOKEN"
}
```

### 1-4. 로그아웃

  - **Method**: `POST`
  - **URL**: `/api/auth/logout/{email}`

**Details**

  - **Path Param**: `{email}` (현재 로그인한 사용자)
  - **Behavior**:
    1.  서버: 해당 유저의 Refresh Token 무효화.
    2.  FE: 응답 결과와 무관하게 `localStorage` 클리어 및 로그인 페이지 이동.

### 1-5. 이메일 찾기

  - **Method**: `POST`
  - **URL**: `/api/auth/find-email`

**Request Body (JSON)**

```json
{
  "userName": "최종혁",
  "userBirth": "2000-01-01"
}
```

**Response Example**

```json
{
  "email": "test@test.com"
}
```

> 정보 불일치 시: `4xx` Status Code + 에러 메시지

### 1-6. 비밀번호 재설정 (임시 비밀번호)

  - **Method**: `POST`
  - **URL**: `/api/auth/reset-password`

**Request Body (JSON)**

```json
{
  "userName": "최종혁",
  "email": "test@test.com"
}
```

**Response Example**

```json
{
  "message": "임시 비밀번호가 이메일로 발송되었습니다."
}
```

-----

## 2\. User API (사용자 정보)

### 2-1. 내 정보 조회

  - **Method**: `GET`
  - **URL**: `/api/user/me`
  - **Header**: `Authorization` 필수

**Response Example**

```json
{
  "email": "test@test.com",
  "userName": "최종혁",
  "nickname": "hyuk",
  "userBirth": "2000-01-01",
  "preference": "DAILY_LIFE,TECHNOLOGY",
  "goal": "올해 토익 900",
  "dailyWordGoal": 20
}
```

### 2-2. 회원 정보 수정

  - **Method**: `PATCH`
  - **URL**: `/api/user`
  - **Header**: `Authorization` 필수

**Request Body (JSON)**
수정할 필드만 선택적으로 보냅니다.

```json
{
  "nickname": "새닉네임",
  "userBirth": "1999-01-01",
  "preference": "DAILY_LIFE",
  "goal": "새 목표",
  "dailyWordGoal": 30
}
```

**Response Example**

```json
{
  "success": true
}
```

### 2-3. 비밀번호 변경

  - **Method**: `PATCH`
  - **URL**: `/api/user/password`
  - **Header**: `Authorization` 필수

**Request Body (JSON)**

```json
{
  "currentPassword": "OLD_PASSWORD",
  "newPassword": "NEW_PASSWORD"
}
```

> 기존 비밀번호 불일치 시: `4xx` Status Code 반환

-----

## 3\. Dashboard API

### 3-1. 대시보드 데이터 조회

  - **Method**: `GET`
  - **URL**: `/api/dashboard`
  - **Header**: `Authorization` 필수

**Response Example**
프론트엔드는 `percentage` 값이 없으면 `(todayProgress / dailyGoal) * 100` 공식으로 계산하여 사용합니다.

```json
{
  "dailyGoal": 20,       // 일일 목표 단어 수
  "todayProgress": 15,   // 오늘 학습한 단어 수
  "percentage": 75       // 달성률 (0~100)
}
```

-----

## 4\. 인증/권한 요약 (Summary)

### Public Endpoints (토큰 불필요)

  - `POST /api/auth/signup`
  - `POST /api/auth/login`
  - `POST /api/auth/refresh`
  - `POST /api/auth/find-email`
  - `POST /api/auth/reset-password`

### Protected Endpoints (토큰 필수)

  - `POST /api/auth/logout/{email}`
  - `GET /api/user/me`
  - `PATCH /api/user`
  - `PATCH /api/user/password`
  - `GET /api/dashboard`
  - 그 외 모든 단어(Word) 관련 API
