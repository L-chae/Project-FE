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
