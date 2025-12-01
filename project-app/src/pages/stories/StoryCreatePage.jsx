import React, { useState } from 'react';
import './StoryCreatePage.css';

const StoryCreatePage = () => {
// Mock Data: 오답 노트 데이터 (예시)
  const [mistakePool, setMistakePool] = useState([
    { id: 1, word: 'ambiguous', meaning: '애매모호한', type: 'adj' },
    { id: 2, word: 'mitigate', meaning: '완화하다', type: 'verb' },
    { id: 3, word: 'scrutinize', meaning: '세밀히 조사하다', type: 'verb' },
    { id: 4, word: 'fluctuate', meaning: '변동하다', type: 'verb' },
    { id: 5, word: 'paradigm', meaning: '패러다임', type: 'noun' },
    { id: 6, word: 'eloquent', meaning: '웅변을 잘하는', type: 'adj' },
    { id: 7, word: 'bias', meaning: '편견', type: 'noun' },
  ]);

  const [selectedWords, setSelectedWords] = useState([]);
  const [customInput, setCustomInput] = useState('');
  const [options, setOptions] = useState({ difficulty: 'intermediate', style: 'narrative' });
  const [isGenerating, setIsGenerating] = useState(false);

  // --- Actions ---

  // 1. 오답 노트에서 단어 선택 (Left -> Right)
  const selectWord = (wordObj) => {
    if (selectedWords.length >= 5) return alert("단어는 최대 5개까지만 선택할 수 있어요.");
    if (selectedWords.find((w) => w.text === wordObj.word)) return;

    setSelectedWords([...selectedWords, { text: wordObj.word, source: 'mistake' }]);
  };

  // 2. 선택된 단어 제거 (Right -> X)
  const removeWord = (textToRemove) => {
    setSelectedWords(selectedWords.filter((w) => w.text !== textToRemove));
  };

  // 3. 직접 입력 추가 (Input -> Right)
  const handleCustomInput = (e) => {
    if (e.key === 'Enter' && customInput.trim()) {
      if (selectedWords.length >= 5) return alert("단어는 최대 5개까지만 선택할 수 있어요.");
      
      const newWord = customInput.trim();
      if (!selectedWords.find((w) => w.text === newWord)) {
        setSelectedWords([...selectedWords, { text: newWord, source: 'custom' }]);
        setCustomInput('');
      }
    }
  };

  const handleGenerate = () => {
    setIsGenerating(true);
    // API 호출 로직 시뮬레이션
    setTimeout(() => setIsGenerating(false), 2000);
  };

  return (
    <div className="page-container">
      <header className="wb-header">
        <h2>AI 스토리 스튜디오</h2>
        <p>복습할 단어를 골라 나만의 영어 문맥을 만들어보세요.</p>
      </header>

      <div className="wb-grid">
        {/* --- LEFT PANEL: 오답 노트 (Source) --- */}
        <section className="panel source-panel">
          <div className="panel-header">
            <h3>📂 나의 오답 노트</h3>
            <span className="count-badge">{mistakePool.length}개</span>
          </div>
          <div className="word-list">
            {mistakePool.map((item) => {
              const isSelected = selectedWords.find(w => w.text === item.word);
              return (
                <div 
                  key={item.id} 
                  className={`word-card ${isSelected ? 'disabled' : ''}`}
                  onClick={() => !isSelected && selectWord(item)}
                >
                  <div className="word-info">
                    <span className="word-text">{item.word}</span>
                    <span className="word-meaning">{item.meaning}</span>
                  </div>
                  {/* 선택됨 표시 (한글) */}
                  {isSelected && <div className="selected-overlay">선택됨</div>}
                </div>
              );
            })}
          </div>
        </section>

        {/* --- RIGHT PANEL: 작업 공간 (Builder) --- */}
        <section className="panel builder-panel">
          <div className="panel-header">
            <h3>✨ 스토리 구성하기</h3>
            <span className={`limit-badge ${selectedWords.length === 5 ? 'full' : ''}`}>
              {selectedWords.length} / 5
            </span>
          </div>

          {/* 1. 선택된 단어 영역 */}
          <div className="selected-area">
            {selectedWords.length === 0 ? (
              <div className="empty-state">
                <p>좌측 오답 노트에서 단어를 클릭하거나<br/>아래 입력창에 직접 추가해보세요.</p>
              </div>
            ) : (
              <div className="chips-wrapper">
                {selectedWords.map((item, idx) => (
                  <span key={idx} className={`chip ${item.source}`}>
                    {item.text}
                    <button onClick={() => removeWord(item.text)}>×</button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* 2. 직접 입력 및 옵션 */}
          <div className="controls-area">
            <div className="input-group">
              <label>단어 직접 추가</label>
              <input
                type="text"
                placeholder="단어 입력 후 엔터 (예: sustainability)"
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                onKeyDown={handleCustomInput}
                disabled={selectedWords.length >= 5}
              />
            </div>

            <div className="options-grid">
              <div className="input-group">
                <label>난이도</label>
                <select onChange={(e) => setOptions({...options, difficulty: e.target.value})}>
                  <option value="beginner">초급 (Beginner)</option>
                  <option value="intermediate">중급 (Intermediate)</option>
                  <option value="advanced">고급 (Advanced)</option>
                </select>
              </div>
              <div className="input-group">
                <label>글 스타일</label>
                <select onChange={(e) => setOptions({...options, style: e.target.value})}>
                  <option value="narrative">📖 소설/동화</option>
                  <option value="news">📰 뉴스 기사</option>
                  <option value="conversation">💬 일상 대화</option>
                  <option value="business">💼 비즈니스</option>
                </select>
              </div>
            </div>
          </div>

          {/* 3. Action Button */}
          <button 
            className="generate-full-btn"
            disabled={selectedWords.length === 0 || isGenerating}
            onClick={handleGenerate}
          >
            {isGenerating ? 'AI가 스토리를 쓰고 있어요...' : '스토리 생성하기 🚀'}
          </button>
        </section>
      </div>
    </div>
  );
};
export default StoryCreatePage;