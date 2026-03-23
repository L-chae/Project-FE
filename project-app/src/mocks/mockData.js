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

/**
 * 카테고리: Business×3, Technology×3, Daily Life×2, Literature×2, Science×2
 * 레벨:     1×4, 2×4, 3×4  |  isFavorite: 6true / 6false  |  isCompleted: 5true / 7false
 */
export const mockWordList = [
  // ── Business ────────────────────────────────────────────────────────────────
  {
    wordId: 1,
    word: "Resilience",
    meaning: "회복탄력성",
    partOfSpeech: "Noun",
    category: "Business",
    level: 2,
    isFavorite: true,
    isCompleted: false,
    exampleSentenceEn: "Resilience helps leaders recover from setbacks and keep moving forward.",
    exampleSentenceKo: "회복탄력성은 리더가 좌절에서 회복하고 계속 나아가게 해준다.",
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
    exampleSentenceEn: "The contract terms were ambiguous, leading to a dispute between the parties.",
    exampleSentenceKo: "계약 조건이 모호해서 당사자 간 분쟁이 발생했다.",
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
    exampleSentenceEn: "Cross-functional teams collaborate to deliver the product on schedule.",
    exampleSentenceKo: "부서 간 팀이 협력하여 제품을 일정에 맞게 납품한다.",
  },
  // ── Technology ──────────────────────────────────────────────────────────────
  {
    wordId: 3,
    word: "Innovative",
    meaning: "혁신적인",
    partOfSpeech: "Adjective",
    category: "Technology",
    level: 2,
    isFavorite: true,
    isCompleted: false,
    exampleSentenceEn: "The startup introduced an innovative approach to data privacy.",
    exampleSentenceKo: "그 스타트업은 데이터 프라이버시에 혁신적인 접근 방식을 도입했다.",
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
    exampleSentenceEn: "The sorting algorithm reduced processing time by forty percent.",
    exampleSentenceKo: "정렬 알고리즘이 처리 시간을 40퍼센트 단축시켰다.",
  },
  {
    wordId: 11,
    word: "Prototype",
    meaning: "시제품, 원형",
    partOfSpeech: "Noun",
    category: "Technology",
    level: 1,
    isFavorite: false,
    isCompleted: true,
    exampleSentenceEn: "The engineers built a working prototype before the product launch.",
    exampleSentenceKo: "엔지니어들은 제품 출시 전에 작동하는 시제품을 제작했다.",
  },
  // ── Daily Life ──────────────────────────────────────────────────────────────
  {
    wordId: 5,
    word: "Perseverance",
    meaning: "인내, 끈기",
    partOfSpeech: "Noun",
    category: "Daily Life",
    level: 1,
    isFavorite: false,
    isCompleted: false,
    exampleSentenceEn: "With perseverance, she finally earned her certification after three attempts.",
    exampleSentenceKo: "끈기 덕분에 그녀는 세 번의 시도 끝에 마침내 자격증을 취득했다.",
  },
  {
    wordId: 12,
    word: "Pragmatic",
    meaning: "실용적인",
    partOfSpeech: "Adjective",
    category: "Daily Life",
    level: 1,
    isFavorite: true,
    isCompleted: false,
    exampleSentenceEn: "Taking a pragmatic approach, she chose the solution that worked best right now.",
    exampleSentenceKo: "실용적인 접근 방식을 택해 그녀는 지금 당장 가장 잘 작동하는 해결책을 선택했다.",
  },
  // ── Literature ──────────────────────────────────────────────────────────────
  {
    wordId: 6,
    word: "Eloquent",
    meaning: "유창한, 설득력 있는",
    partOfSpeech: "Adjective",
    category: "Literature",
    level: 3,
    isFavorite: true,
    isCompleted: false,
    exampleSentenceEn: "The poet delivered an eloquent tribute that moved every member of the audience.",
    exampleSentenceKo: "시인은 청중 모두를 감동시킨 유창한 헌사를 낭독했다.",
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
    exampleSentenceEn: "The cherry blossoms are ephemeral, blooming for only a week each spring.",
    exampleSentenceKo: "벚꽃은 매년 봄 단 일주일만 피는 덧없는 존재다.",
  },
  // ── Science ─────────────────────────────────────────────────────────────────
  {
    wordId: 7,
    word: "Hypothesis",
    meaning: "가설",
    partOfSpeech: "Noun",
    category: "Science",
    level: 3,
    isFavorite: true,
    isCompleted: true,
    exampleSentenceEn: "The research team formulated a hypothesis and designed experiments to test it.",
    exampleSentenceKo: "연구팀은 가설을 세우고 이를 검증하기 위한 실험을 설계했다.",
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
    exampleSentenceEn: "The spacecraft used Jupiter's gravity to gain momentum on its journey outward.",
    exampleSentenceKo: "우주선은 목성의 중력을 이용해 외행성 여정에서 추진력을 얻었다.",
  },
  // ── clusterMap inMyList:true 단어 (wordId 13~16) ────────────────────────────
  {
    wordId: 13,
    word: "Endurance",
    meaning: "인내력, 지구력",
    partOfSpeech: "Noun",
    category: "Daily Life",
    level: 2,
    isFavorite: false,
    isCompleted: true,
    exampleSentenceEn: "Running a marathon requires both physical strength and mental endurance.",
    exampleSentenceKo: "마라톤을 완주하려면 체력과 정신적 인내력이 모두 필요하다.",
  },
  {
    wordId: 14,
    word: "Clear",
    meaning: "명확한, 분명한",
    partOfSpeech: "Adjective",
    category: "Daily Life",
    level: 1,
    isFavorite: true,
    isCompleted: false,
    exampleSentenceEn: "The teacher gave a clear explanation that everyone could understand.",
    exampleSentenceKo: "선생님은 모두가 이해할 수 있는 명확한 설명을 해주었다.",
  },
  {
    wordId: 15,
    word: "Creative",
    meaning: "창의적인",
    partOfSpeech: "Adjective",
    category: "Literature",
    level: 2,
    isFavorite: false,
    isCompleted: false,
    exampleSentenceEn: "She took a creative approach to solving problems that others had overlooked.",
    exampleSentenceKo: "그녀는 다른 사람들이 간과했던 문제를 창의적인 방식으로 해결했다.",
  },
  {
    wordId: 16,
    word: "Method",
    meaning: "방법, 방식",
    partOfSpeech: "Noun",
    category: "Technology",
    level: 1,
    isFavorite: true,
    isCompleted: true,
    exampleSentenceEn: "The research team developed a new method for analyzing large datasets efficiently.",
    exampleSentenceKo: "연구팀은 대용량 데이터셋을 효율적으로 분석하는 새로운 방법을 개발했다.",
  },
  // ── cluster inMyList:true 확장 단어 (wordId 17~32) ─────────────────────────
  {
    wordId: 17,
    word: "Tenacity",
    meaning: "끈질김, 집요함",
    partOfSpeech: "Noun",
    category: "Daily Life",
    level: 2,
    isFavorite: true,
    isCompleted: false,
    exampleSentenceEn: "His tenacity in learning new languages impressed everyone around him.",
    exampleSentenceKo: "새로운 언어를 배우는 그의 끈질긴 노력은 주변 모든 사람에게 깊은 인상을 주었다.",
  },
  {
    wordId: 18,
    word: "Fragility",
    meaning: "취약함, 깨지기 쉬움",
    partOfSpeech: "Noun",
    category: "Daily Life",
    level: 2,
    isFavorite: false,
    isCompleted: false,
    exampleSentenceEn: "The fragility of the ecosystem became evident after years of neglect.",
    exampleSentenceKo: "수년간의 방치 끝에 생태계의 취약함이 분명해졌다.",
  },
  {
    wordId: 19,
    word: "Weakness",
    meaning: "나약함, 약점",
    partOfSpeech: "Noun",
    category: "Daily Life",
    level: 1,
    isFavorite: false,
    isCompleted: true,
    exampleSentenceEn: "Recognizing your weakness is the first step toward turning it into a strength.",
    exampleSentenceKo: "자신의 약점을 인식하는 것이 그것을 강점으로 바꾸는 첫 번째 단계다.",
  },
  {
    wordId: 20,
    word: "Vague",
    meaning: "불분명한, 막연한",
    partOfSpeech: "Adjective",
    category: "Daily Life",
    level: 2,
    isFavorite: true,
    isCompleted: false,
    exampleSentenceEn: "Her explanation was so vague that no one knew what the next step was.",
    exampleSentenceKo: "그녀의 설명이 너무 막연해서 다음 단계가 무엇인지 아무도 몰랐다.",
  },
  {
    wordId: 21,
    word: "Unclear",
    meaning: "불명확한, 불분명한",
    partOfSpeech: "Adjective",
    category: "Daily Life",
    level: 1,
    isFavorite: false,
    isCompleted: false,
    exampleSentenceEn: "The deadline was unclear, causing the team to miss the submission window.",
    exampleSentenceKo: "마감 기한이 불분명하여 팀은 제출 시간을 놓치고 말았다.",
  },
  {
    wordId: 22,
    word: "Obscure",
    meaning: "모호한, 잘 알려지지 않은",
    partOfSpeech: "Adjective",
    category: "Literature",
    level: 3,
    isFavorite: false,
    isCompleted: true,
    exampleSentenceEn: "The novel referenced an obscure historical event that few readers recognized.",
    exampleSentenceKo: "그 소설은 소수의 독자만 알아챌 수 있는 잘 알려지지 않은 역사적 사건을 언급했다.",
  },
  {
    wordId: 23,
    word: "Definite",
    meaning: "확실한, 명확한",
    partOfSpeech: "Adjective",
    category: "Daily Life",
    level: 2,
    isFavorite: true,
    isCompleted: true,
    exampleSentenceEn: "Please give me a definite answer before the end of the day.",
    exampleSentenceKo: "오늘이 끝나기 전에 확실한 대답을 주세요.",
  },
  {
    wordId: 24,
    word: "Pioneering",
    meaning: "선구적인, 개척하는",
    partOfSpeech: "Adjective",
    category: "Business",
    level: 3,
    isFavorite: false,
    isCompleted: false,
    exampleSentenceEn: "Her pioneering research laid the foundation for modern data science.",
    exampleSentenceKo: "그녀의 선구적인 연구는 현대 데이터 과학의 토대를 마련했다.",
  },
  {
    wordId: 25,
    word: "Groundbreaking",
    meaning: "획기적인, 혁신적인",
    partOfSpeech: "Adjective",
    category: "Technology",
    level: 3,
    isFavorite: true,
    isCompleted: false,
    exampleSentenceEn: "The company unveiled a groundbreaking battery that could last an entire week.",
    exampleSentenceKo: "그 회사는 일주일 내내 사용할 수 있는 획기적인 배터리를 공개했다.",
  },
  {
    wordId: 26,
    word: "Conventional",
    meaning: "전통적인, 관습적인",
    partOfSpeech: "Adjective",
    category: "Business",
    level: 2,
    isFavorite: false,
    isCompleted: true,
    exampleSentenceEn: "The board preferred conventional strategies over experimental ones.",
    exampleSentenceKo: "이사회는 실험적인 방법보다 전통적인 전략을 선호했다.",
  },
  {
    wordId: 27,
    word: "Outdated",
    meaning: "구식의, 시대에 뒤처진",
    partOfSpeech: "Adjective",
    category: "Technology",
    level: 1,
    isFavorite: false,
    isCompleted: false,
    exampleSentenceEn: "The software was so outdated that it could no longer run on modern systems.",
    exampleSentenceKo: "그 소프트웨어는 너무 구식이어서 더 이상 현대 시스템에서 실행할 수 없었다.",
  },
  {
    wordId: 28,
    word: "Cooperate",
    meaning: "협동하다, 협조하다",
    partOfSpeech: "Verb",
    category: "Business",
    level: 2,
    isFavorite: true,
    isCompleted: true,
    exampleSentenceEn: "The two rival companies agreed to cooperate on the joint research project.",
    exampleSentenceKo: "두 경쟁사는 공동 연구 프로젝트에서 협력하기로 합의했다.",
  },
  {
    wordId: 29,
    word: "Partner",
    meaning: "협력하다, 파트너가 되다",
    partOfSpeech: "Verb",
    category: "Business",
    level: 1,
    isFavorite: false,
    isCompleted: false,
    exampleSentenceEn: "Small businesses often partner with larger firms to expand their reach.",
    exampleSentenceKo: "소규모 기업들은 종종 더 큰 회사들과 협력하여 사업 영역을 확장한다.",
  },
  {
    wordId: 30,
    word: "Coordinate",
    meaning: "조율하다, 조정하다",
    partOfSpeech: "Verb",
    category: "Business",
    level: 2,
    isFavorite: false,
    isCompleted: true,
    exampleSentenceEn: "It was her job to coordinate the logistics across three different time zones.",
    exampleSentenceKo: "세 개의 서로 다른 시간대에 걸친 물류를 조율하는 것이 그녀의 업무였다.",
  },
  {
    wordId: 31,
    word: "Compete",
    meaning: "경쟁하다",
    partOfSpeech: "Verb",
    category: "Business",
    level: 2,
    isFavorite: false,
    isCompleted: false,
    exampleSentenceEn: "Startups must compete aggressively to gain their first hundred customers.",
    exampleSentenceKo: "스타트업은 처음 100명의 고객을 확보하기 위해 적극적으로 경쟁해야 한다.",
  },
  {
    wordId: 32,
    word: "Isolate",
    meaning: "고립시키다, 격리하다",
    partOfSpeech: "Verb",
    category: "Science",
    level: 2,
    isFavorite: true,
    isCompleted: false,
    exampleSentenceEn: "Scientists isolate variables in experiments to accurately measure cause and effect.",
    exampleSentenceKo: "과학자들은 원인과 결과를 정확히 측정하기 위해 실험에서 변수를 분리한다.",
  },
  // ── wordDetailMockCases 전용 (9000번대 — 단어 상세 페이지 테스트 케이스) ──────
  {
    wordId: 9001,
    word: "Resilient",
    meaning: "회복력이 있는",
    partOfSpeech: "Adjective",
    category: "People & Feelings",
    level: 2,
    isFavorite: true,
    isCompleted: false,
    exampleSentenceEn: "She remained resilient after many setbacks.",
    exampleSentenceKo: "그녀는 여러 번의 좌절 후에도 회복력을 유지했다.",
  },
  {
    wordId: 9002,
    word: "Execute",
    meaning: "실행하다",
    partOfSpeech: "Verb",
    category: "Business",
    level: 3,
    isFavorite: false,
    isCompleted: true,
    exampleSentenceEn: "The team needs to execute the plan without delay.",
    exampleSentenceKo: "팀은 지체 없이 계획을 실행해야 한다.",
  },
  {
    wordId: 9003,
    word: "Distinguish",
    meaning: "구별하다",
    partOfSpeech: "Verb",
    category: "School & Learning",
    level: 3,
    isFavorite: true,
    isCompleted: false,
    exampleSentenceEn: "Can you distinguish fact from opinion?",
    exampleSentenceKo: "사실과 의견을 구별할 수 있나요?",
  },
  {
    wordId: 9005,
    word: "Prototype",
    meaning: "시제품",
    partOfSpeech: "Noun",
    category: "Technology",
    level: 3,
    isFavorite: false,
    isCompleted: false,
    exampleSentenceEn: "The team tested a new prototype this week.",
    exampleSentenceKo: "팀은 이번 주 새로운 시제품을 테스트했다.",
  },
];

/**
 * wordId별 유의어(similar) 3개 / 반의어(opposite) 2개
 */
export const mockClusterMap = {
  1: { // Resilience
    similar: [
      { wordId: 17, text: "Tenacity",    meaning: "끈질김",       type: "similar", score: 0.93, inMyList: true  },
      { wordId: 13, text: "Endurance",   meaning: "인내력",        type: "similar", score: 0.89, inMyList: true  },
      { text: "Grit",        meaning: "투지",          type: "similar", score: 0.85, inMyList: false },
    ],
    opposite: [
      { wordId: 18, text: "Fragility",   meaning: "취약함",        type: "opposite", score: 0.88, inMyList: true  },
      { wordId: 19, text: "Weakness",    meaning: "나약함",         type: "opposite", score: 0.82, inMyList: true  },
    ],
  },
  2: { // Ambiguous
    similar: [
      { wordId: 20, text: "Vague",       meaning: "불분명한",       type: "similar", score: 0.94, inMyList: true  },
      { wordId: 21, text: "Unclear",     meaning: "불명확한",       type: "similar", score: 0.90, inMyList: true  },
      { wordId: 22, text: "Obscure",     meaning: "애매한",         type: "similar", score: 0.85, inMyList: true  },
    ],
    opposite: [
      { wordId: 14, text: "Clear",       meaning: "명확한",         type: "opposite", score: 0.93, inMyList: true  },
      { wordId: 23, text: "Definite",    meaning: "확실한",         type: "opposite", score: 0.87, inMyList: true  },
    ],
  },
  3: { // Innovative
    similar: [
      { wordId: 15, text: "Creative",       meaning: "창의적인",     type: "similar", score: 0.91, inMyList: true  },
      { wordId: 24, text: "Pioneering",     meaning: "선구적인",     type: "similar", score: 0.86, inMyList: true  },
      { wordId: 25, text: "Groundbreaking", meaning: "획기적인",     type: "similar", score: 0.83, inMyList: true  },
    ],
    opposite: [
      { wordId: 26, text: "Conventional",   meaning: "전통적인",     type: "opposite", score: 0.89, inMyList: true  },
      { wordId: 27, text: "Outdated",       meaning: "구식의",       type: "opposite", score: 0.80, inMyList: true  },
    ],
  },
  4: { // Algorithm
    similar: [
      { text: "Procedure",   meaning: "절차",           type: "similar", score: 0.88, inMyList: false },
      { wordId: 16, text: "Method",      meaning: "방법",           type: "similar", score: 0.85, inMyList: true  },
      { text: "Formula",     meaning: "공식",           type: "similar", score: 0.81, inMyList: false },
    ],
    opposite: [
      { text: "Chaos",       meaning: "혼돈",           type: "opposite", score: 0.84, inMyList: false },
      { text: "Randomness",  meaning: "무작위성",       type: "opposite", score: 0.78, inMyList: false },
    ],
  },
  5: { // Perseverance
    similar: [
      { text: "Persistence",   meaning: "지속성",       type: "similar", score: 0.95, inMyList: false },
      { text: "Determination", meaning: "결단력",       type: "similar", score: 0.90, inMyList: false },
      { text: "Diligence",     meaning: "성실함",       type: "similar", score: 0.85, inMyList: false },
    ],
    opposite: [
      { text: "Surrender",   meaning: "포기",           type: "opposite", score: 0.90, inMyList: false },
      { text: "Laziness",    meaning: "게으름",         type: "opposite", score: 0.83, inMyList: false },
    ],
  },
  6: { // Eloquent
    similar: [
      { text: "Articulate",  meaning: "명확히 표현하는", type: "similar", score: 0.92, inMyList: false },
      { text: "Expressive",  meaning: "표현력이 풍부한", type: "similar", score: 0.87, inMyList: false },
      { text: "Fluent",      meaning: "유창한",          type: "similar", score: 0.83, inMyList: true  },
    ],
    opposite: [
      { text: "Inarticulate",meaning: "말을 잘 못하는", type: "opposite", score: 0.89, inMyList: false },
      { text: "Incoherent",  meaning: "두서없는",        type: "opposite", score: 0.81, inMyList: false },
    ],
  },
  7: { // Hypothesis
    similar: [
      { text: "Theory",      meaning: "이론",           type: "similar", score: 0.90, inMyList: false },
      { text: "Assumption",  meaning: "가정",           type: "similar", score: 0.86, inMyList: false },
      { text: "Conjecture",  meaning: "추측",           type: "similar", score: 0.82, inMyList: false },
    ],
    opposite: [
      { text: "Fact",        meaning: "사실",           type: "opposite", score: 0.88, inMyList: true  },
      { text: "Proof",       meaning: "증거",           type: "opposite", score: 0.83, inMyList: false },
    ],
  },
  8: { // Collaborate
    similar: [
      { wordId: 28, text: "Cooperate",   meaning: "협동하다",       type: "similar", score: 0.93, inMyList: true  },
      { wordId: 29, text: "Partner",     meaning: "협력하다",       type: "similar", score: 0.88, inMyList: true  },
      { wordId: 30, text: "Coordinate",  meaning: "조율하다",       type: "similar", score: 0.84, inMyList: true  },
    ],
    opposite: [
      { wordId: 31, text: "Compete",     meaning: "경쟁하다",       type: "opposite", score: 0.87, inMyList: true  },
      { wordId: 32, text: "Isolate",     meaning: "고립시키다",     type: "opposite", score: 0.79, inMyList: true  },
    ],
  },
  9: { // Ephemeral
    similar: [
      { text: "Transient",   meaning: "일시적인",       type: "similar", score: 0.95, inMyList: false },
      { text: "Fleeting",    meaning: "순간적인",       type: "similar", score: 0.91, inMyList: false },
      { text: "Momentary",   meaning: "잠깐의",         type: "similar", score: 0.86, inMyList: false },
    ],
    opposite: [
      { text: "Permanent",   meaning: "영구적인",       type: "opposite", score: 0.92, inMyList: true  },
      { text: "Enduring",    meaning: "지속적인",       type: "opposite", score: 0.87, inMyList: false },
    ],
  },
  10: { // Momentum
    similar: [
      { text: "Impetus",     meaning: "추진력",         type: "similar", score: 0.91, inMyList: false },
      { text: "Drive",       meaning: "동력",           type: "similar", score: 0.87, inMyList: false },
      { text: "Thrust",      meaning: "추력",           type: "similar", score: 0.82, inMyList: false },
    ],
    opposite: [
      { text: "Stagnation",  meaning: "정체",           type: "opposite", score: 0.89, inMyList: false },
      { text: "Inertia",     meaning: "관성, 무기력",   type: "opposite", score: 0.84, inMyList: false },
    ],
  },
  11: { // Prototype
    similar: [
      { text: "Model",       meaning: "모형",           type: "similar", score: 0.90, inMyList: false },
      { text: "Draft",       meaning: "초안",           type: "similar", score: 0.85, inMyList: false },
      { text: "Blueprint",   meaning: "청사진",         type: "similar", score: 0.81, inMyList: true  },
    ],
    opposite: [
      { text: "Finalized",   meaning: "완성된",         type: "opposite", score: 0.86, inMyList: false },
      { text: "Polished",    meaning: "완성도 높은",    type: "opposite", score: 0.80, inMyList: false },
    ],
  },
  12: { // Pragmatic
    similar: [
      { text: "Practical",   meaning: "실용적인",       type: "similar", score: 0.94, inMyList: false },
      { text: "Realistic",   meaning: "현실적인",       type: "similar", score: 0.89, inMyList: false },
      { text: "Sensible",    meaning: "합리적인",       type: "similar", score: 0.84, inMyList: false },
    ],
    opposite: [
      { text: "Idealistic",  meaning: "이상주의적인",   type: "opposite", score: 0.91, inMyList: false },
      { text: "Impractical", meaning: "비실용적인",     type: "opposite", score: 0.86, inMyList: false },
    ],
  },
  13: { // Endurance
    similar: [
      { text: "Stamina",     meaning: "체력, 스태미나",   type: "similar",  score: 0.93, inMyList: false },
      { text: "Fortitude",   meaning: "불굴의 의지",       type: "similar",  score: 0.88, inMyList: false },
      { wordId: 17, text: "Tenacity",    meaning: "끈질김",            type: "similar",  score: 0.84, inMyList: true  },
    ],
    opposite: [
      { wordId: 19, text: "Weakness",    meaning: "나약함",            type: "opposite", score: 0.90, inMyList: true  },
      { text: "Frailty",     meaning: "허약함",            type: "opposite", score: 0.83, inMyList: false },
    ],
  },
  14: { // Clear
    similar: [
      { text: "Transparent", meaning: "투명한, 명백한",    type: "similar",  score: 0.91, inMyList: false },
      { text: "Obvious",     meaning: "분명한",            type: "similar",  score: 0.87, inMyList: false },
      { wordId: 23, text: "Definite",    meaning: "확실한",            type: "similar",  score: 0.86, inMyList: true  },
    ],
    opposite: [
      { wordId: 2,  text: "Ambiguous",   meaning: "모호한",            type: "opposite", score: 0.94, inMyList: true  },
      { wordId: 20, text: "Vague",       meaning: "불분명한",          type: "opposite", score: 0.89, inMyList: true  },
    ],
  },
  15: { // Creative
    similar: [
      { text: "Imaginative",  meaning: "상상력이 풍부한",  type: "similar",  score: 0.92, inMyList: false },
      { wordId: 3,  text: "Innovative",  meaning: "혁신적인",          type: "similar",  score: 0.88, inMyList: true  },
      { wordId: 24, text: "Pioneering",  meaning: "선구적인",          type: "similar",  score: 0.85, inMyList: true  },
    ],
    opposite: [
      { wordId: 26, text: "Conventional", meaning: "전통적인",         type: "opposite", score: 0.86, inMyList: true  },
      { text: "Unoriginal",  meaning: "독창성이 없는",     type: "opposite", score: 0.80, inMyList: false },
    ],
  },
  16: { // Method
    similar: [
      { text: "Approach",    meaning: "접근법",            type: "similar",  score: 0.90, inMyList: false },
      { text: "Technique",   meaning: "기술, 기법",        type: "similar",  score: 0.86, inMyList: false },
      { text: "Procedure",   meaning: "절차",              type: "similar",  score: 0.82, inMyList: false },
    ],
    opposite: [
      { text: "Chaos",       meaning: "혼돈",              type: "opposite", score: 0.85, inMyList: false },
      { text: "Disorder",    meaning: "무질서",            type: "opposite", score: 0.78, inMyList: false },
    ],
  },
  17: { // Tenacity
    similar: [
      { wordId: 13, text: "Endurance",    meaning: "인내력",        type: "similar",  score: 0.92, inMyList: true  },
      { wordId: 1,  text: "Resilience",   meaning: "회복탄력성",    type: "similar",  score: 0.87, inMyList: true  },
      { wordId: 5,  text: "Perseverance", meaning: "인내, 끈기",    type: "similar",  score: 0.84, inMyList: true  },
    ],
    opposite: [
      { wordId: 19, text: "Weakness",    meaning: "나약함",         type: "opposite", score: 0.90, inMyList: true  },
      { wordId: 18, text: "Fragility",   meaning: "취약함",         type: "opposite", score: 0.85, inMyList: true  },
    ],
  },
  18: { // Fragility
    similar: [
      { wordId: 19, text: "Weakness",    meaning: "나약함",         type: "similar",  score: 0.91, inMyList: true  },
      { wordId: 9,  text: "Ephemeral",   meaning: "덧없는, 순간적인", type: "similar", score: 0.76, inMyList: true  },
    ],
    opposite: [
      { wordId: 1,  text: "Resilience",  meaning: "회복탄력성",    type: "opposite", score: 0.94, inMyList: true  },
      { wordId: 17, text: "Tenacity",    meaning: "끈질김",         type: "opposite", score: 0.89, inMyList: true  },
      { wordId: 13, text: "Endurance",   meaning: "인내력",         type: "opposite", score: 0.84, inMyList: true  },
    ],
  },
  19: { // Weakness
    similar: [
      { wordId: 18, text: "Fragility",   meaning: "취약함",         type: "similar",  score: 0.91, inMyList: true  },
    ],
    opposite: [
      { wordId: 1,  text: "Resilience",  meaning: "회복탄력성",    type: "opposite", score: 0.93, inMyList: true  },
      { wordId: 17, text: "Tenacity",    meaning: "끈질김",         type: "opposite", score: 0.90, inMyList: true  },
      { wordId: 13, text: "Endurance",   meaning: "인내력",         type: "opposite", score: 0.87, inMyList: true  },
    ],
  },
  20: { // Vague
    similar: [
      { wordId: 21, text: "Unclear",    meaning: "불명확한",        type: "similar",  score: 0.93, inMyList: true  },
      { wordId: 2,  text: "Ambiguous",  meaning: "모호한",          type: "similar",  score: 0.90, inMyList: true  },
      { wordId: 22, text: "Obscure",    meaning: "모호한",          type: "similar",  score: 0.86, inMyList: true  },
    ],
    opposite: [
      { wordId: 14, text: "Clear",      meaning: "명확한",          type: "opposite", score: 0.94, inMyList: true  },
      { wordId: 23, text: "Definite",   meaning: "확실한",          type: "opposite", score: 0.89, inMyList: true  },
    ],
  },
  21: { // Unclear
    similar: [
      { wordId: 20, text: "Vague",      meaning: "불분명한",        type: "similar",  score: 0.93, inMyList: true  },
      { wordId: 2,  text: "Ambiguous",  meaning: "모호한",          type: "similar",  score: 0.90, inMyList: true  },
      { wordId: 22, text: "Obscure",    meaning: "모호한",          type: "similar",  score: 0.85, inMyList: true  },
    ],
    opposite: [
      { wordId: 14, text: "Clear",      meaning: "명확한",          type: "opposite", score: 0.93, inMyList: true  },
      { wordId: 23, text: "Definite",   meaning: "확실한",          type: "opposite", score: 0.88, inMyList: true  },
    ],
  },
  22: { // Obscure
    similar: [
      { wordId: 20, text: "Vague",      meaning: "불분명한",        type: "similar",  score: 0.90, inMyList: true  },
      { wordId: 21, text: "Unclear",    meaning: "불명확한",        type: "similar",  score: 0.87, inMyList: true  },
      { wordId: 2,  text: "Ambiguous",  meaning: "모호한",          type: "similar",  score: 0.84, inMyList: true  },
    ],
    opposite: [
      { wordId: 14, text: "Clear",      meaning: "명확한",          type: "opposite", score: 0.91, inMyList: true  },
      { wordId: 6,  text: "Eloquent",   meaning: "설득력 있는",     type: "opposite", score: 0.83, inMyList: true  },
    ],
  },
  23: { // Definite
    similar: [
      { wordId: 14, text: "Clear",      meaning: "명확한",          type: "similar",  score: 0.91, inMyList: true  },
      { wordId: 6,  text: "Eloquent",   meaning: "설득력 있는",     type: "similar",  score: 0.82, inMyList: true  },
    ],
    opposite: [
      { wordId: 20, text: "Vague",      meaning: "불분명한",        type: "opposite", score: 0.93, inMyList: true  },
      { wordId: 2,  text: "Ambiguous",  meaning: "모호한",          type: "opposite", score: 0.90, inMyList: true  },
      { wordId: 21, text: "Unclear",    meaning: "불명확한",        type: "opposite", score: 0.87, inMyList: true  },
    ],
  },
  24: { // Pioneering
    similar: [
      { wordId: 3,  text: "Innovative",     meaning: "혁신적인",    type: "similar",  score: 0.93, inMyList: true  },
      { wordId: 25, text: "Groundbreaking", meaning: "획기적인",    type: "similar",  score: 0.90, inMyList: true  },
      { wordId: 15, text: "Creative",       meaning: "창의적인",    type: "similar",  score: 0.85, inMyList: true  },
    ],
    opposite: [
      { wordId: 26, text: "Conventional",   meaning: "전통적인",    type: "opposite", score: 0.91, inMyList: true  },
      { wordId: 27, text: "Outdated",       meaning: "구식의",      type: "opposite", score: 0.86, inMyList: true  },
    ],
  },
  25: { // Groundbreaking
    similar: [
      { wordId: 24, text: "Pioneering",     meaning: "선구적인",    type: "similar",  score: 0.92, inMyList: true  },
      { wordId: 3,  text: "Innovative",     meaning: "혁신적인",    type: "similar",  score: 0.89, inMyList: true  },
      { wordId: 15, text: "Creative",       meaning: "창의적인",    type: "similar",  score: 0.85, inMyList: true  },
    ],
    opposite: [
      { wordId: 26, text: "Conventional",   meaning: "전통적인",    type: "opposite", score: 0.90, inMyList: true  },
      { wordId: 27, text: "Outdated",       meaning: "구식의",      type: "opposite", score: 0.85, inMyList: true  },
    ],
  },
  26: { // Conventional
    similar: [
      { wordId: 27, text: "Outdated",       meaning: "구식의",      type: "similar",  score: 0.85, inMyList: true  },
      { wordId: 12, text: "Pragmatic",      meaning: "실용적인",    type: "similar",  score: 0.72, inMyList: true  },
    ],
    opposite: [
      { wordId: 3,  text: "Innovative",     meaning: "혁신적인",    type: "opposite", score: 0.93, inMyList: true  },
      { wordId: 24, text: "Pioneering",     meaning: "선구적인",    type: "opposite", score: 0.89, inMyList: true  },
      { wordId: 25, text: "Groundbreaking", meaning: "획기적인",    type: "opposite", score: 0.86, inMyList: true  },
    ],
  },
  27: { // Outdated
    similar: [
      { wordId: 26, text: "Conventional",   meaning: "전통적인",    type: "similar",  score: 0.85, inMyList: true  },
    ],
    opposite: [
      { wordId: 3,  text: "Innovative",     meaning: "혁신적인",    type: "opposite", score: 0.94, inMyList: true  },
      { wordId: 25, text: "Groundbreaking", meaning: "획기적인",    type: "opposite", score: 0.89, inMyList: true  },
      { wordId: 15, text: "Creative",       meaning: "창의적인",    type: "opposite", score: 0.84, inMyList: true  },
    ],
  },
  28: { // Cooperate
    similar: [
      { wordId: 8,  text: "Collaborate",    meaning: "협력하다",    type: "similar",  score: 0.94, inMyList: true  },
      { wordId: 29, text: "Partner",        meaning: "협력하다",    type: "similar",  score: 0.88, inMyList: true  },
      { wordId: 30, text: "Coordinate",     meaning: "조율하다",    type: "similar",  score: 0.84, inMyList: true  },
    ],
    opposite: [
      { wordId: 31, text: "Compete",        meaning: "경쟁하다",    type: "opposite", score: 0.91, inMyList: true  },
      { wordId: 32, text: "Isolate",        meaning: "고립시키다",  type: "opposite", score: 0.86, inMyList: true  },
    ],
  },
  29: { // Partner
    similar: [
      { wordId: 8,  text: "Collaborate",    meaning: "협력하다",    type: "similar",  score: 0.91, inMyList: true  },
      { wordId: 28, text: "Cooperate",      meaning: "협동하다",    type: "similar",  score: 0.88, inMyList: true  },
      { wordId: 30, text: "Coordinate",     meaning: "조율하다",    type: "similar",  score: 0.83, inMyList: true  },
    ],
    opposite: [
      { wordId: 31, text: "Compete",        meaning: "경쟁하다",    type: "opposite", score: 0.89, inMyList: true  },
      { wordId: 32, text: "Isolate",        meaning: "고립시키다",  type: "opposite", score: 0.84, inMyList: true  },
    ],
  },
  30: { // Coordinate
    similar: [
      { wordId: 8,  text: "Collaborate",    meaning: "협력하다",    type: "similar",  score: 0.90, inMyList: true  },
      { wordId: 28, text: "Cooperate",      meaning: "협동하다",    type: "similar",  score: 0.86, inMyList: true  },
      { wordId: 29, text: "Partner",        meaning: "협력하다",    type: "similar",  score: 0.83, inMyList: true  },
    ],
    opposite: [
      { wordId: 31, text: "Compete",        meaning: "경쟁하다",    type: "opposite", score: 0.88, inMyList: true  },
      { wordId: 32, text: "Isolate",        meaning: "고립시키다",  type: "opposite", score: 0.82, inMyList: true  },
    ],
  },
  31: { // Compete
    similar: [
      { wordId: 5,  text: "Perseverance",   meaning: "인내, 끈기",  type: "similar",  score: 0.72, inMyList: true  },
      { wordId: 32, text: "Isolate",        meaning: "고립시키다",  type: "similar",  score: 0.68, inMyList: true  },
    ],
    opposite: [
      { wordId: 8,  text: "Collaborate",    meaning: "협력하다",    type: "opposite", score: 0.92, inMyList: true  },
      { wordId: 28, text: "Cooperate",      meaning: "협동하다",    type: "opposite", score: 0.89, inMyList: true  },
      { wordId: 29, text: "Partner",        meaning: "협력하다",    type: "opposite", score: 0.85, inMyList: true  },
    ],
  },
  32: { // Isolate
    similar: [
      { wordId: 31, text: "Compete",        meaning: "경쟁하다",    type: "similar",  score: 0.68, inMyList: true  },
    ],
    opposite: [
      { wordId: 8,  text: "Collaborate",    meaning: "협력하다",    type: "opposite", score: 0.93, inMyList: true  },
      { wordId: 28, text: "Cooperate",      meaning: "협동하다",    type: "opposite", score: 0.89, inMyList: true  },
      { wordId: 30, text: "Coordinate",     meaning: "조율하다",    type: "opposite", score: 0.84, inMyList: true  },
    ],
  },
  // ── 9000번대 (wordDetailMockCases 전용) ─────────────────────────────────────
  9001: { // Resilient
    similar: [
      { text: "Flexible",    meaning: "유연한",         type: "similar", score: 0.91, inMyList: false },
      { text: "Adaptable",   meaning: "적응력 있는",    type: "similar", score: 0.88, inMyList: true  },
      { text: "Tough",       meaning: "강인한",         type: "similar", score: 0.84, inMyList: false },
    ],
    opposite: [
      { text: "Fragile",     meaning: "취약한",         type: "opposite", score: 0.90, inMyList: false },
      { text: "Vulnerable",  meaning: "상처받기 쉬운",  type: "opposite", score: 0.84, inMyList: false },
    ],
  },
  9002: { // Execute
    similar: [
      { text: "Perform",     meaning: "수행하다",       type: "similar", score: 0.92, inMyList: false },
      { text: "Carry out",   meaning: "실행하다",       type: "similar", score: 0.88, inMyList: false },
      { text: "Implement",   meaning: "이행하다",       type: "similar", score: 0.85, inMyList: false },
    ],
    opposite: [
      { text: "Abandon",     meaning: "포기하다",       type: "opposite", score: 0.87, inMyList: false },
      { text: "Neglect",     meaning: "방치하다",       type: "opposite", score: 0.81, inMyList: false },
    ],
  },
  9003: { // Distinguish
    similar: [
      { text: "Differentiate", meaning: "구분하다",     type: "similar", score: 0.94, inMyList: false },
      { text: "Discern",     meaning: "식별하다",       type: "similar", score: 0.89, inMyList: false },
      { text: "Separate",    meaning: "분리하다",       type: "similar", score: 0.83, inMyList: false },
    ],
    opposite: [
      { text: "Confuse",     meaning: "혼동하다",       type: "opposite", score: 0.91, inMyList: false },
      { text: "Merge",       meaning: "합치다",         type: "opposite", score: 0.79, inMyList: false },
    ],
  },
  9005: { // Prototype (test case — cluster error scenario handled by clusterMode: "error")
    similar: [],
    opposite: [],
  },
};

// mockClusterMap에 없는 wordId 요청 시 반환되는 기본값
// (wordId 1~12는 전부 mockClusterMap에 정의되어 있어 실제 사용 빈도 낮음)
export const DEFAULT_CLUSTER = {
  similar: [
    { text: "Adapt",    meaning: "적응하다",   type: "similar", score: 0.78, inMyList: false },
    { text: "Flexible", meaning: "유연한",     type: "similar", score: 0.74, inMyList: false },
    { text: "Adjust",   meaning: "조정하다",   type: "similar", score: 0.70, inMyList: false },
  ],
  opposite: [
    { text: "Rigid",    meaning: "경직된",     type: "opposite", score: 0.75, inMyList: false },
    { text: "Resist",   meaning: "저항하다",   type: "opposite", score: 0.71, inMyList: false },
  ],
};

export const mockStoryList = [
  {
    storyId: 1,
    title: "The Journey of Resilience",
    titleKo: "회복탄력성의 여정",
    storyEn:
      "Maya had always struggled with Resilience, but an Ambiguous challenge at work forced her to confront her fears head-on. " +
      "The project brief was so Ambiguous that her team spent days debating what success even looked like. " +
      "Instead of giving up, Maya drew on every ounce of Resilience she had built over the years. " +
      "She decided to Collaborate with two colleagues who had faced similar setbacks before. " +
      "Their combined Perseverance turned the Ambiguous assignment into a focused, achievable plan. " +
      "Day by day, small wins gave the team Momentum, and that Momentum became impossible to stop. " +
      "By the deadline, what had started as chaos was now an Eloquent presentation that impressed the entire board. " +
      "Maya smiled, knowing that her Resilience — tested time and again — had finally become her greatest strength.",
    storyKo:
      "마야는 항상 회복탄력성(Resilience)에 어려움을 겪었지만, 직장에서의 모호한(Ambiguous) 도전이 그녀를 두려움과 정면으로 맞서게 만들었다. " +
      "프로젝트 개요가 너무 모호해서(Ambiguous) 팀은 성공이 무엇인지조차 며칠째 논쟁했다. " +
      "포기하는 대신, 마야는 수년간 쌓아온 모든 회복탄력성(Resilience)을 발휘했다. " +
      "그녀는 이전에 비슷한 역경을 겪은 두 동료와 협력(Collaborate)하기로 했다. " +
      "그들의 합쳐진 인내(Perseverance)는 모호한(Ambiguous) 과제를 집중적이고 실현 가능한 계획으로 바꾸어 놓았다. " +
      "날마다 작은 승리가 팀에게 추진력(Momentum)을 주었고, 그 추진력(Momentum)은 멈출 수 없는 힘이 되었다. " +
      "마감일이 되자, 혼돈으로 시작했던 것이 이사회 전체를 감동시킨 설득력 있는(Eloquent) 발표가 되었다. " +
      "마야는 미소지었다 — 수없이 시험받았던 회복탄력성(Resilience)이 마침내 자신의 가장 큰 강점이 되었음을 알면서.",
    createdAt: "2026-03-20T09:00:00",
  },
  {
    storyId: 2,
    title: "Ambiguous Paths",
    titleKo: "모호한 길",
    storyEn:
      "The instructions were Ambiguous from the start, and no one on the team could agree on the right direction. " +
      "James found the Ambiguous situation deeply uncomfortable, but he chose Perseverance over paralysis. " +
      "Rather than waiting for clarity, he decided to Collaborate with each member and map out all possibilities on a shared board. " +
      "It was a Pragmatic approach: instead of demanding perfect information, they worked with what they had. " +
      "As the team began to Collaborate more openly, the fog slowly lifted and a shared vision emerged. " +
      "Their Innovative use of visual mapping tools helped everyone see connections that words alone had hidden. " +
      "The process was slow, but it transformed confusion into a Pragmatic and resilient plan of action. " +
      "Sometimes the most courageous thing is to Collaborate through the Ambiguous and trust the process.",
    storyKo:
      "지시 사항은 처음부터 모호했고(Ambiguous), 팀 내 누구도 올바른 방향에 동의할 수 없었다. " +
      "제임스는 모호한(Ambiguous) 상황이 몹시 불편했지만, 마비 대신 인내(Perseverance)를 선택했다. " +
      "명확함이 오기를 기다리는 대신, 그는 각 구성원과 협력(Collaborate)하여 공유 보드에 모든 가능성을 정리하기로 했다. " +
      "그것은 실용적인(Pragmatic) 접근이었다 — 완벽한 정보를 요구하는 대신, 있는 것으로 움직였다. " +
      "팀이 더 개방적으로 협력(Collaborate)하기 시작하자, 안개가 서서히 걷히고 공유된 비전이 나타났다. " +
      "시각적 매핑 도구를 혁신적으로(Innovative) 활용한 방식 덕분에 말만으로는 숨겨져 있던 연결고리들이 드러났다. " +
      "과정은 느렸지만, 혼란을 실용적(Pragmatic)이고 탄력 있는 행동 계획으로 바꾸어 놓았다. " +
      "때로는 모호함(Ambiguous) 속에서 협력(Collaborate)하고 과정을 믿는 것이 가장 용기 있는 일이다.",
    createdAt: "2026-03-21T14:00:00",
  },
  {
    storyId: 3,
    title: "Momentum of Change",
    titleKo: "변화의 추진력",
    storyEn:
      "The Prototype had failed three times, but the engineers refused to abandon their Hypothesis. " +
      "Each failed Prototype taught them something the original Hypothesis had not anticipated. " +
      "They began building an Algorithm that could adapt to unexpected inputs, learning from every error. " +
      "The Algorithm grew more accurate with each iteration, and so did their confidence. " +
      "Each iteration gave them new Momentum, pushing the project forward despite the Ephemeral bursts of doubt. " +
      "They documented every result meticulously, treating each setback as data rather than defeat. " +
      "When the breakthrough finally came, it validated not just the Hypothesis but the entire Momentum-driven process. " +
      "It was not luck — it was the Momentum of relentless Perseverance and an Innovative spirit that refused to quit.",
    storyKo:
      "시제품(Prototype)은 세 번이나 실패했지만, 엔지니어들은 자신들의 가설(Hypothesis)을 포기하지 않았다. " +
      "실패한 시제품(Prototype)마다 원래의 가설(Hypothesis)이 예상하지 못했던 무언가를 가르쳐 주었다. " +
      "그들은 예상치 못한 입력에 적응하고 매 오류에서 배우는 알고리즘(Algorithm)을 구축하기 시작했다. " +
      "알고리즘(Algorithm)은 반복할수록 더 정확해졌고, 그들의 자신감도 함께 커졌다. " +
      "반복할 때마다 새로운 추진력(Momentum)이 생겼고, 순간적인(Ephemeral) 의심의 순간들에도 불구하고 프로젝트는 앞으로 나아갔다. " +
      "그들은 모든 결과를 꼼꼼히 기록했으며, 각 좌절을 패배가 아닌 데이터로 다루었다. " +
      "마침내 찾아온 돌파구는 가설(Hypothesis)뿐만 아니라, 추진력(Momentum)으로 움직이는 과정 전체를 입증했다. " +
      "그것은 운이 아니었다 — 끊임없는 인내(Perseverance)의 추진력(Momentum)과 포기를 거부한 혁신적(Innovative)인 정신이었다.",
    createdAt: "2026-03-22T10:00:00",
  },
];

export const mockStoryWords = {
  1: [
    { text: "Resilience",    pos: "Noun", meaning: "회복탄력성" },
    { text: "Ambiguous",     pos: "Adj",  meaning: "모호한" },
    { text: "Collaborate",   pos: "Verb", meaning: "협력하다" },
    { text: "Perseverance",  pos: "Noun", meaning: "인내, 끈기" },
    { text: "Momentum",      pos: "Noun", meaning: "추진력, 가속도" },
    { text: "Eloquent",      pos: "Adj",  meaning: "설득력 있는, 유창한" },
  ],
  2: [
    { text: "Ambiguous",     pos: "Adj",  meaning: "모호한" },
    { text: "Perseverance",  pos: "Noun", meaning: "인내, 끈기" },
    { text: "Collaborate",   pos: "Verb", meaning: "협력하다" },
    { text: "Pragmatic",     pos: "Adj",  meaning: "실용적인" },
    { text: "Innovative",    pos: "Adj",  meaning: "혁신적인" },
  ],
  3: [
    { text: "Prototype",     pos: "Noun", meaning: "시제품, 원형" },
    { text: "Hypothesis",    pos: "Noun", meaning: "가설" },
    { text: "Algorithm",     pos: "Noun", meaning: "알고리즘" },
    { text: "Momentum",      pos: "Noun", meaning: "추진력, 가속도" },
    { text: "Ephemeral",     pos: "Adj",  meaning: "덧없는, 순간적인" },
    { text: "Perseverance",  pos: "Noun", meaning: "인내, 끈기" },
    { text: "Innovative",    pos: "Adj",  meaning: "혁신적인" },
  ],
};

/**
 * wordId 1~12 + 9001~9005 전체 학습 통계
 * status: "none" / "correct" / "wrong" / "review"
 */
export const mockStudyLog = new Map([
  [1,    { totalCorrect: 0,  totalWrong: 0, status: "none",    lastStudyAt: null }],
  [2,    { totalCorrect: 7,  totalWrong: 2, status: "correct", lastStudyAt: "2026-03-20T10:00:00.000Z" }],
  [3,    { totalCorrect: 0,  totalWrong: 0, status: "none",    lastStudyAt: null }],
  [4,    { totalCorrect: 2,  totalWrong: 5, status: "wrong",   lastStudyAt: "2026-03-17T09:20:00.000Z" }],
  [5,    { totalCorrect: 3,  totalWrong: 0, status: "correct", lastStudyAt: "2026-03-19T14:30:00.000Z" }],
  [6,    { totalCorrect: 0,  totalWrong: 0, status: "none",    lastStudyAt: null }],
  [7,    { totalCorrect: 10, totalWrong: 1, status: "correct", lastStudyAt: "2026-03-21T09:15:00.000Z" }],
  [8,    { totalCorrect: 4,  totalWrong: 0, status: "correct", lastStudyAt: "2026-03-18T11:45:00.000Z" }],
  [9,    { totalCorrect: 1,  totalWrong: 4, status: "wrong",   lastStudyAt: "2026-03-16T16:00:00.000Z" }],
  [10,   { totalCorrect: 6,  totalWrong: 3, status: "correct", lastStudyAt: "2026-03-22T08:30:00.000Z" }],
  [11,   { totalCorrect: 5,  totalWrong: 0, status: "correct", lastStudyAt: "2026-03-21T15:00:00.000Z" }],
  [12,   { totalCorrect: 0,  totalWrong: 0, status: "none",    lastStudyAt: null }],
  [13,   { totalCorrect: 5,  totalWrong: 1, status: "correct", lastStudyAt: "2026-03-21T11:00:00.000Z" }],
  [14,   { totalCorrect: 0,  totalWrong: 0, status: "none",    lastStudyAt: null }],
  [15,   { totalCorrect: 2,  totalWrong: 4, status: "wrong",   lastStudyAt: "2026-03-19T16:20:00.000Z" }],
  [16,   { totalCorrect: 8,  totalWrong: 0, status: "correct", lastStudyAt: "2026-03-22T07:45:00.000Z" }],
  [17,   { totalCorrect: 4,  totalWrong: 0, status: "correct", lastStudyAt: "2026-03-20T14:00:00.000Z" }],
  [18,   { totalCorrect: 0,  totalWrong: 0, status: "none",    lastStudyAt: null }],
  [19,   { totalCorrect: 3,  totalWrong: 0, status: "correct", lastStudyAt: "2026-03-18T10:00:00.000Z" }],
  [20,   { totalCorrect: 1,  totalWrong: 3, status: "wrong",   lastStudyAt: "2026-03-17T09:00:00.000Z" }],
  [21,   { totalCorrect: 0,  totalWrong: 0, status: "none",    lastStudyAt: null }],
  [22,   { totalCorrect: 6,  totalWrong: 1, status: "correct", lastStudyAt: "2026-03-21T13:00:00.000Z" }],
  [23,   { totalCorrect: 7,  totalWrong: 0, status: "correct", lastStudyAt: "2026-03-22T09:30:00.000Z" }],
  [24,   { totalCorrect: 0,  totalWrong: 0, status: "none",    lastStudyAt: null }],
  [25,   { totalCorrect: 0,  totalWrong: 0, status: "none",    lastStudyAt: null }],
  [26,   { totalCorrect: 4,  totalWrong: 1, status: "correct", lastStudyAt: "2026-03-20T11:00:00.000Z" }],
  [27,   { totalCorrect: 0,  totalWrong: 0, status: "none",    lastStudyAt: null }],
  [28,   { totalCorrect: 9,  totalWrong: 0, status: "correct", lastStudyAt: "2026-03-22T08:00:00.000Z" }],
  [29,   { totalCorrect: 0,  totalWrong: 0, status: "none",    lastStudyAt: null }],
  [30,   { totalCorrect: 5,  totalWrong: 1, status: "correct", lastStudyAt: "2026-03-21T16:00:00.000Z" }],
  [31,   { totalCorrect: 0,  totalWrong: 0, status: "none",    lastStudyAt: null }],
  [32,   { totalCorrect: 0,  totalWrong: 0, status: "none",    lastStudyAt: null }],
  // 9000번대 — wordDetailMockCases 시나리오와 일치하도록 설정
  [9001, { totalCorrect: 0,  totalWrong: 0, status: "none",    lastStudyAt: null }],
  [9002, { totalCorrect: 9,  totalWrong: 1, status: "correct", lastStudyAt: "2026-03-05T10:00:00.000Z" }],
  [9003, { totalCorrect: 3,  totalWrong: 5, status: "wrong",   lastStudyAt: "2026-03-07T13:30:00.000Z" }],
  [9005, { totalCorrect: 1,  totalWrong: 1, status: "wrong",   lastStudyAt: "2026-03-06T05:00:00.000Z" }],
]);
