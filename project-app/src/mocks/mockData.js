// src/mocks/mockData.js

export const mockUser = {
  userId: 1,
  email: "test@example.com",
  nickname: "Mock User",
  userName: "목업 유저",
  userBirth: "2000-01-01",
  preference: "Narrative",
  goal: "영어 마스터하기",
  dailyWordGoal: 10,
};

export const mockWordList = [
  {
    wordId: 1,
    word: "Resilience",
    meaning: "회복탄력성",
    partOfSpeech: "Noun",
    category: "Business",
    level: 2,
    isFavorite: true,
    isCompleted: false,
    exampleSentenceEn: "Resilience helps you recover from setbacks.",
    exampleSentenceKo: "회복탄력성은 좌절에서 회복하게 해준다.",
  },
  {
    wordId: 2,
    word: "Ambiguous",
    meaning: "모호한",
    partOfSpeech: "Adjective",
    category: "Business",
    level: 2,
    isFavorite: false,
    isCompleted: true,
    exampleSentenceEn: "The requirement is ambiguous.",
    exampleSentenceKo: "요구사항이 모호하다.",
  },
  {
    wordId: 3,
    word: "Innovative",
    meaning: "혁신적인",
    partOfSpeech: "Adjective",
    category: "Technology",
    level: 2,
    isFavorite: true,
    isCompleted: false,
    exampleSentenceEn: "The startup introduced an innovative solution to the problem.",
    exampleSentenceKo: "그 스타트업은 문제에 혁신적인 해결책을 내놓았다.",
  },
  {
    wordId: 4,
    word: "Algorithm",
    meaning: "알고리즘",
    partOfSpeech: "Noun",
    category: "Technology",
    level: 3,
    isFavorite: false,
    isCompleted: true,
    exampleSentenceEn: "The algorithm sorts data in logarithmic time.",
    exampleSentenceKo: "이 알고리즘은 데이터를 로그 시간 안에 정렬한다.",
  },
  {
    wordId: 5,
    word: "Perseverance",
    meaning: "인내, 끈기",
    partOfSpeech: "Noun",
    category: "Daily Life",
    level: 2,
    isFavorite: false,
    isCompleted: false,
    exampleSentenceEn: "Perseverance is the key to long-term success.",
    exampleSentenceKo: "인내는 장기적인 성공의 열쇠다.",
  },
  {
    wordId: 6,
    word: "Eloquent",
    meaning: "유창한, 설득력 있는",
    partOfSpeech: "Adjective",
    category: "Literature",
    level: 3,
    isFavorite: true,
    isCompleted: false,
    exampleSentenceEn: "She gave an eloquent speech that moved the audience.",
    exampleSentenceKo: "그녀는 청중을 감동시키는 유창한 연설을 했다.",
  },
  {
    wordId: 7,
    word: "Hypothesis",
    meaning: "가설",
    partOfSpeech: "Noun",
    category: "Science",
    level: 3,
    isFavorite: false,
    isCompleted: true,
    exampleSentenceEn: "The scientist tested her hypothesis through experiments.",
    exampleSentenceKo: "과학자는 실험을 통해 가설을 검증했다.",
  },
  {
    wordId: 8,
    word: "Collaborate",
    meaning: "협력하다",
    partOfSpeech: "Verb",
    category: "Business",
    level: 1,
    isFavorite: false,
    isCompleted: false,
    exampleSentenceEn: "Teams collaborate to deliver the project on time.",
    exampleSentenceKo: "팀들은 프로젝트를 제때 완료하기 위해 협력한다.",
  },
  {
    wordId: 9,
    word: "Ephemeral",
    meaning: "일시적인, 덧없는",
    partOfSpeech: "Adjective",
    category: "Literature",
    level: 3,
    isFavorite: true,
    isCompleted: false,
    exampleSentenceEn: "Fame can be ephemeral if not backed by talent.",
    exampleSentenceKo: "재능이 뒷받침되지 않으면 명성은 덧없을 수 있다.",
  },
  {
    wordId: 10,
    word: "Momentum",
    meaning: "추진력, 가속도",
    partOfSpeech: "Noun",
    category: "Science",
    level: 2,
    isFavorite: false,
    isCompleted: true,
    exampleSentenceEn: "The project gained momentum after the first milestone.",
    exampleSentenceKo: "첫 번째 마일스톤 이후 프로젝트가 추진력을 얻었다.",
  },
  {
    wordId: 11,
    word: "Transparent",
    meaning: "투명한, 솔직한",
    partOfSpeech: "Adjective",
    category: "Business",
    level: 1,
    isFavorite: false,
    isCompleted: false,
    exampleSentenceEn: "The company maintains a transparent communication policy.",
    exampleSentenceKo: "회사는 투명한 소통 정책을 유지한다.",
  },
  {
    wordId: 12,
    word: "Pragmatic",
    meaning: "실용적인",
    partOfSpeech: "Adjective",
    category: "Daily Life",
    level: 2,
    isFavorite: true,
    isCompleted: false,
    exampleSentenceEn: "A pragmatic approach focuses on practical results.",
    exampleSentenceKo: "실용적인 접근 방식은 실질적인 결과에 집중한다.",
  },
];

export const mockClusterMap = {
  1: {
    similar: [
      { text: "Tenacity", meaning: "끈질김", type: "similar", score: 0.91, inMyList: false },
      { text: "Endurance", meaning: "인내력", type: "similar", score: 0.87, inMyList: true },
    ],
    opposite: [
      { text: "Fragility", meaning: "취약함", type: "opposite", score: 0.85, inMyList: false },
      { text: "Weakness", meaning: "나약함", type: "opposite", score: 0.80, inMyList: false },
    ],
  },
  2: {
    similar: [
      { text: "Vague", meaning: "불분명한", type: "similar", score: 0.93, inMyList: false },
      { text: "Unclear", meaning: "불명확한", type: "similar", score: 0.88, inMyList: false },
    ],
    opposite: [
      { text: "Clear", meaning: "명확한", type: "opposite", score: 0.92, inMyList: true },
      { text: "Definite", meaning: "확실한", type: "opposite", score: 0.84, inMyList: false },
    ],
  },
  3: {
    similar: [
      { text: "Creative", meaning: "창의적인", type: "similar", score: 0.89, inMyList: true },
      { text: "Pioneering", meaning: "선구적인", type: "similar", score: 0.83, inMyList: false },
    ],
    opposite: [
      { text: "Conventional", meaning: "전통적인", type: "opposite", score: 0.86, inMyList: false },
      { text: "Outdated", meaning: "구식의", type: "opposite", score: 0.78, inMyList: false },
    ],
  },
  6: {
    similar: [
      { text: "Articulate", meaning: "명확히 표현하는", type: "similar", score: 0.90, inMyList: false },
      { text: "Expressive", meaning: "표현력이 풍부한", type: "similar", score: 0.85, inMyList: false },
    ],
    opposite: [
      { text: "Inarticulate", meaning: "말을 잘 못하는", type: "opposite", score: 0.88, inMyList: false },
    ],
  },
  9: {
    similar: [
      { text: "Transient", meaning: "일시적인", type: "similar", score: 0.94, inMyList: false },
      { text: "Fleeting", meaning: "순간적인", type: "similar", score: 0.90, inMyList: false },
    ],
    opposite: [
      { text: "Permanent", meaning: "영구적인", type: "opposite", score: 0.91, inMyList: true },
      { text: "Enduring", meaning: "지속적인", type: "opposite", score: 0.86, inMyList: false },
    ],
  },
};

export const DEFAULT_CLUSTER = {
  similar: [
    { text: "Similar Word", meaning: "유사 단어", type: "similar", score: 0.80, inMyList: false },
  ],
  opposite: [
    { text: "Opposite Word", meaning: "반대 단어", type: "opposite", score: 0.75, inMyList: false },
  ],
};

// wordId → { totalCorrect, totalWrong, status, lastStudyAt }
// Map 자체는 const이지만 .set()으로 내부 상태 변경 가능
export const mockStudyLog = new Map([
  [2,  { totalCorrect: 5, totalWrong: 1, status: "correct", lastStudyAt: "2026-03-20T10:00:00.000Z" }],
  [4,  { totalCorrect: 3, totalWrong: 3, status: "review",  lastStudyAt: "2026-03-19T14:30:00.000Z" }],
  [7,  { totalCorrect: 8, totalWrong: 0, status: "correct", lastStudyAt: "2026-03-21T09:15:00.000Z" }],
  [10, { totalCorrect: 2, totalWrong: 4, status: "wrong",   lastStudyAt: "2026-03-18T16:00:00.000Z" }],
]);
