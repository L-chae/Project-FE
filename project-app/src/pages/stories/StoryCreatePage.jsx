// src/pages/stories/StoryCreatePage.jsx
import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import { Wand2 } from "lucide-react";
import Input from "../../components/common/Input";
import "./StoryCreatePage.css";

const StoryCreatePage = () => {
  const location = useLocation();
  // 퀴즈 오답에서 넘겨줄 때: navigate("/story/create", { state: { baseWords: [...] } })
  const baseWords = location.state?.baseWords || [];

  const [title, setTitle] = useState("");
  const [selectedWords, setSelectedWords] = useState(baseWords);
  const [prompt, setPrompt] = useState("");

  const handleToggleWord = (word) => {
    setSelectedWords((prev) =>
      prev.includes(word)
        ? prev.filter((w) => w !== word)
        : [...prev, word]
    );
  };

  const handleGenerate = () => {
    // 여기서 AI API 호출 로직 연결
    // selectedWords + prompt 기반으로 스토리 생성
  };

  return (
    <div className="story-create-page">
      <header className="story-create-header">
        <div>
          <h1 className="story-create-title">새 스토리 만들기</h1>
          <p className="story-create-subtitle">
            선택한 단어와 간단한 프롬프트로 AI가 이야기를 만들어 줍니다.
          </p>
        </div>
      </header>

      <main className="story-create-main">
        <section className="story-create-form">
          <Input
            label="스토리 제목"
            placeholder="예: First Snow in My City"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <div className="story-create-field">
            <label className="story-create-label">프롬프트 / 상황 설명</label>
            <textarea
              className="story-create-textarea"
              placeholder="예: 겨울 방학 첫날, 친구들과 눈사람을 만드는 이야기로 만들어줘."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
          </div>

          {baseWords.length > 0 && (
            <div className="story-create-field">
              <label className="story-create-label">
                사용할 단어 선택 (오답/학습 단어)
              </label>
              <div className="story-create-word-chips">
                {baseWords.map((word) => {
                  const active = selectedWords.includes(word);
                  return (
                    <button
                      key={word}
                      type="button"
                      className={
                        "story-create-chip" +
                        (active ? " story-create-chip--active" : "")
                      }
                      onClick={() => handleToggleWord(word)}
                    >
                      {word}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <button
            type="button"
            className="story-create-generate-button"
            onClick={handleGenerate}
          >
            <Wand2 className="icon-sm" />
            <span>AI로 스토리 생성</span>
          </button>
        </section>
      </main>
    </div>
  );
};

export default StoryCreatePage;
