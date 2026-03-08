const makeClusterItem = ({ id, wordId, text, meaning, type = "similar", inMyList = false }) => ({
  id,
  wordId,
  text,
  meaning,
  type,
  inMyList,
});

export const WORD_DETAIL_MOCK_CASES = [
  {
    id: 9001,
    label: "기본",
    word: {
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
    studyStatus: "none",
    studyLog: { totalCorrect: 0, totalWrong: 0, lastStudyAt: null },
    clusterMode: "ready",
    clusters: {
      similar: [
        makeClusterItem({
          id: "9001-s-1",
          wordId: 9101,
          text: "Flexible",
          meaning: "유연한",
          type: "similar",
        }),
        makeClusterItem({
          id: "9001-s-2",
          wordId: 9102,
          text: "Adaptable",
          meaning: "적응력 있는",
          type: "similar",
          inMyList: true,
        }),
        makeClusterItem({
          id: "9001-s-3",
          wordId: 9106,
          text: "Durable",
          meaning: "쉽게 무너지지 않는",
          type: "similar",
        }),
        makeClusterItem({
          id: "9001-s-4",
          wordId: 9107,
          text: "Tough",
          meaning: "강인한",
          type: "similar",
        }),
      ],
      opposite: [
        makeClusterItem({
          id: "9001-o-1",
          wordId: 9201,
          text: "Fragile",
          meaning: "취약한",
          type: "opposite",
        }),
      ],
    },
  },
  {
    id: 9002,
    label: "완료/예문없음",
    word: {
      wordId: 9002,
      word: "Execute",
      meaning: "실행하다",
      partOfSpeech: "Verb",
      category: "Business",
      level: 3,
      isFavorite: false,
      isCompleted: true,
      exampleSentenceEn: "",
      exampleSentenceKo: "",
    },
    studyStatus: "correct",
    studyLog: {
      totalCorrect: 9,
      totalWrong: 1,
      lastStudyAt: "2026-03-05T10:00:00.000Z",
    },
    clusterMode: "ready",
    clusters: {
      similar: [
        makeClusterItem({
          id: "9002-s-1",
          wordId: 9103,
          text: "Perform",
          meaning: "수행하다",
          type: "similar",
        }),
        makeClusterItem({
          id: "9002-s-2",
          wordId: 9108,
          text: "Carry out",
          meaning: "실행하다",
          type: "similar",
        }),
      ],
      opposite: [],
    },
  },
  {
    id: 9003,
    label: "재학습",
    word: {
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
    studyStatus: "wrong",
    studyLog: {
      totalCorrect: 3,
      totalWrong: 5,
      lastStudyAt: "2026-03-07T13:30:00.000Z",
    },
    clusterMode: "ready",
    clusters: {
      similar: [
        makeClusterItem({
          id: "9003-s-1",
          wordId: 9109,
          text: "Differentiate",
          meaning: "구분하다",
          type: "similar",
        }),
      ],
      opposite: [
        makeClusterItem({
          id: "9003-o-1",
          wordId: 9202,
          text: "Confuse",
          meaning: "혼동하다",
          type: "opposite",
        }),
      ],
    },
  },
  {
    id: 9005,
    label: "연관오류",
    word: {
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
    studyStatus: "none",
    studyLog: { totalCorrect: 1, totalWrong: 1, lastStudyAt: "2026-03-06T05:00:00.000Z" },
    clusterMode: "error",
    clusters: { similar: [], opposite: [] },
  },
];

const WORD_DETAIL_MOCK_CASE_MAP = new Map(
  WORD_DETAIL_MOCK_CASES.map((item) => [Number(item.id), item])
);

export const getWordDetailMockCase = (wordId) =>
  WORD_DETAIL_MOCK_CASE_MAP.get(Number(wordId)) ?? null;
