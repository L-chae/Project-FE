// src/pages/learning/CardLearningPage.jsx
import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { X, Circle } from "lucide-react";

import { Flashcard } from "./components/Flashcard";
import { ProgressBar } from "./components/ProgressBar";
import "./CardLearningPage.css";

import { fetchCardItems, submitCardResult } from "../../api/cardApi";

import { LearningProgressHeader } from "../learning/components/LearningProgressHeader";
import { LearningResultSection } from "../learning/components/LearningResultSection";

const MAX_UNKNOWN_DISPLAY = 20;

export default function CardLearningPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const source = searchParams.get("source") || "card"; // "card" | "wrong-note"
  const clusterId = searchParams.get("clusterId") || undefined;

  const wordIdsParam = searchParams.get("wordIds");
  const wordIds = wordIdsParam
    ? wordIdsParam
        .split(",")
        .map((x) => Number(x))
        .filter((n) => !Number.isNaN(n))
    : undefined;

  const limit = Number(searchParams.get("limit") || 20);

  // 레벨
  const rawLevel = searchParams.get("level");
  const rawLevelLower = rawLevel ? rawLevel.toLowerCase() : null;
  const levelLabel =
    !rawLevelLower || rawLevelLower === "all" ? "All" : rawLevel;

  // 분야(domain)
  const rawDomain = searchParams.get("domain") || "All";
  const DOMAIN_LABEL_MAP = {
    All: "전체 분야",
    "Daily Life": "일상생활",
    "People & Feelings": "사람/감정",
    Business: "직장/비즈니스",
    "School & Learning": "학교/학습",
    Travel: "여행/교통",
    "Food & Health": "음식/건강",
    Technology: "기술/IT",
  };
  const domainLabel = DOMAIN_LABEL_MAP[rawDomain] || rawDomain;

  // 배지용 텍스트
  const badgeText = `${domainLabel} | Lv.${levelLabel}`;

  const isWrongMode = source === "wrong-note";

  // 카드/학습 상태
  const [cards, setCards] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [knownCount, setKnownCount] = useState(0);
  const [unknownCount, setUnknownCount] = useState(0);
  const [unknownWords, setUnknownWords] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFinished, setIsFinished] = useState(false);

  const [animateBars, setAnimateBars] = useState(false);

  // 카드 데이터 로드
  useEffect(() => {
    const loadCards = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await fetchCardItems({
          source,
          wordIds,
          clusterId,
          limit,
        });

        if (!data || data.length === 0) {
          throw new Error("학습할 카드가 없습니다.");
        }

        setCards(data);
        setCurrentIndex(0);
        setIsFlipped(false);
        setKnownCount(0);
        setUnknownCount(0);
        setUnknownWords([]);
        setIsFinished(false);
      } catch (err) {
        console.error("❌ 카드 로드 실패:", err.response?.data || err);
        setError("카드 데이터를 불러오는 중 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    };

    loadCards();
  }, [source, clusterId, wordIdsParam, limit]);

  // 결과 화면 진행 막대 애니메이션
  useEffect(() => {
    if (isFinished) {
      const id = setTimeout(() => setAnimateBars(true), 50);
      return () => clearTimeout(id);
    }
    setAnimateBars(false);
  }, [isFinished]);

  const total = cards.length;
  const safeTotal = total || 1;
  const displayIndex = total > 0 ? Math.min(currentIndex + 1, total) : 0;

  const current = total > 0 ? cards[currentIndex] : null;
  const unknownWordsSafe = Array.isArray(unknownWords) ? unknownWords : [];

  const pageClassName = [
    "card-page",
    isWrongMode ? "card-page--wrong" : null,
  ]
    .filter(Boolean)
    .join(" ");

  const handleGoHome = () => {
    navigate("/learning");
  };

  const toggleFlip = () => {
    setIsFlipped((prev) => !prev);
  };

  // 알았다 / 모르겠다 공통 처리
  const handleAnswer = async (result) => {
    if (!current || isFinished) return;

    const wordId = current.wordId ?? current.id;

    if (result === "known") {
      setKnownCount((prev) => prev + 1);
    } else {
      setUnknownCount((prev) => prev + 1);

      setUnknownWords((prev) => {
        const key = wordId;
        if (prev.some((w) => (w.wordId ?? w.id) === key)) {
          return prev;
        }

        const item = {
          id: current.id,
          wordId: wordId,
          word: current.frontText,
          text: current.frontText,
          meaning: current.backText,
          meaningKo: current.backText,
          partOfSpeech: current.partOfSpeech,
          level: current.level,
        };

        return [...prev, item];
      });
    }

    try {
      await submitCardResult({ wordId, result });
    } catch (err) {
      console.error("❌ 카드 학습 결과 전송 실패:", err.response?.data || err);
    }

    if (currentIndex + 1 < total) {
      setCurrentIndex((prev) => prev + 1);
      setIsFlipped(false);
    } else {
      setIsFinished(true);
    }
  };

  const markKnown = () => handleAnswer("known");
  const markUnknown = () => handleAnswer("unknown");

  // 결과 화면에서 퀴즈로 이동
  const handleGoQuiz = () => {
    const quizSource = source === "wrong-note" ? "wrong-note" : "quiz";

    const params = new URLSearchParams();
    params.set("source", quizSource);

    if (unknownWordsSafe.length > 0) {
      const ids = unknownWordsSafe
        .map((w) => w.wordId ?? w.id)
        .filter(
          (id) => typeof id === "number" && !Number.isNaN(Number(id))
        );

      if (ids.length > 0) {
        params.set("wordIds", ids.join(","));
        params.set("limit", String(ids.length));
      } else {
        params.set("limit", String(limit));
      }
    } else {
      params.set("limit", String(limit));
    }

    if (rawLevel) {
      params.set("level", rawLevel);
    }
    if (rawDomain) {
      params.set("domain", rawDomain);
    }

    navigate(`/learning/quiz?${params.toString()}`);
  };

  if (loading) {
    return <div className="card-page card-page--loading">로딩 중...</div>;
  }

  if (error) {
    return (
      <div className="card-page card-page--error">
        카드 데이터를 불러오는 중 오류가 발생했습니다.
      </div>
    );
  }

  const resultTitle = isWrongMode ? "오답 카드 학습 완료" : "카드 학습 완료";
  const resultSubtitle = isWrongMode
    ? "이번에 헷갈렸던 단어들을 위주로 다시 확인해보세요."
    : "알았던 단어와 모르는 단어를 나눠서 한 번 더 점검해보면 좋습니다.";

  return (
    <div className={pageClassName}>
      {!isFinished ? (
        <section
          className={[
            "card-learning",
            isWrongMode ? "card-learning--wrong" : null,
          ]
            .filter(Boolean)
            .join(" ")}
        >
          <LearningProgressHeader
            title={isWrongMode ? "오답 카드 학습" : "카드 학습"}
            subtitle={
              isWrongMode
                ? "틀렸던 단어들만 골라 카드를 뒤집으며 복습합니다."
                : "플래시 카드로 암기하고 퀴즈로 확인하세요."
            }
            badgeLabel={badgeText}
            badgeVariant={isWrongMode ? "orange" : "purple"}
            showBackButton
            onBack={handleGoHome}
            progressText={`${displayIndex} / ${total}`}
            progressVariant={isWrongMode ? "warning" : "primary"}
            progressBar={
              <ProgressBar
                current={displayIndex}
                total={safeTotal}
                variant={isWrongMode ? "warning" : "primary"}
                showLabel={false}
                className="lp-progress-bar"
              />
            }
          />

          <div className="cl-main">
            <Flashcard
              front={current?.frontText}
              back={current?.backText}
              isFlipped={isFlipped}
              onToggle={toggleFlip}
            />

            <footer className="cl-actions actions-ox">
              <button
                type="button"
                className="btn-unknown"
                onClick={markUnknown}
                aria-label="모르겠다"
              >
                <X size={32} />
              </button>

              <button
                type="button"
                className="btn-known"
                onClick={markKnown}
                aria-label="알겠다"
              >
                <Circle size={28} strokeWidth={3} />
              </button>
            </footer>
          </div>
        </section>
      ) : (
        <section
          className={[
            "card-learning-result",
            isWrongMode ? "card-learning--wrong" : null,
          ]
            .filter(Boolean)
            .join(" ")}
        >
          <header className="cl-header">
            <h1 className="cl-title">{resultTitle}</h1>
            <p className="cl-subtitle">{resultSubtitle}</p>
          </header>

          <LearningResultSection
            unknownTitle="헷갈린 단어"
            unknownSubtitle='이번 학습에서 "모르겠다"로 표시한 단어들입니다.'
            emptyUnknownMessage="헷갈린 단어 없이 모두 알고 있었어요."
            unknownItems={unknownWordsSafe}
            maxUnknownDisplay={MAX_UNKNOWN_DISPLAY}
            getUnknownKey={(w, i) => w.wordId ?? w.id ?? w.text ?? i}
            getUnknownWord={(w) => w.text || w.word || ""}
            getUnknownMeaning={(w) =>
              w.meaning || w.korean || w.meaningKo || ""
            }
            getUnknownMetaTags={(w) => {
              const tags = [];
              const pos = w.partOfSpeech || w.pos;
              if (pos) tags.push(pos);
              if (w.level) tags.push(`Lv.${w.level}`);
              return tags;
            }}
            buildMoreHintMessage={(restCount) =>
              `그 외 ${restCount}개 단어는 오답 노트에서 계속 확인할 수 있어요.`
            }
            primaryLabel="알았다"
            primaryValue={`${knownCount}개`}
            primaryProgress={
              <ProgressBar
                value={animateBars ? (knownCount / safeTotal) * 100 : 0}
                variant="primary"
                showLabel={false}
                className="stat-progress"
              />
            }
            primaryValueClassName="stat-known"
            secondaryLabel="모르겠다"
            secondaryValue={`${unknownCount}개`}
            secondaryProgress={
              <ProgressBar
                value={animateBars ? (unknownCount / safeTotal) * 100 : 0}
                variant="warning"
                showLabel={false}
                className="stat-progress"
              />
            }
            secondaryValueClassName="stat-unknown"
            extraLabel="총 학습 단어"
            extraValue={`${total}개`}
            primaryButtonLabel={
              isWrongMode ? "오답 퀴즈 풀기" : "실전 퀴즈 풀기"
            }
            onPrimaryButtonClick={handleGoQuiz}
            secondaryButtonLabel="학습 홈으로 이동"
            onSecondaryButtonClick={handleGoHome}
          />
        </section>
      )}
    </div>
  );
}
