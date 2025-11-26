import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getWordDetail, addFavorite, removeFavorite } from "../../api/wordApi";
import "./WordDetailPage.css";

function WordDetailPage() {
  const { id } = useParams();
  const [word, setWord] = useState(null);
  const [isFav, setIsFav] = useState(false);

  useEffect(() => {
    loadWord();
  }, []);

  const loadWord = async () => {
    try {
      const res = await getWordDetail(id);
      setWord(res.data);
      setIsFav(res.data.isFavorite);
    } catch (err) {
      console.log(err);
    }
  };

  const toggleFavorite = async () => {
    try {
      await addFavorite(word.wordId);
      setIsFav(true);
    } catch (err) {
      console.log(err);
    }
  };

  if (!word) return <div className="loading">Loading...</div>;

  return (
    <div className="detail-container">
      <div className="detail-card">

        <div className="detail-header">
          <h2>{word.word}</h2>

          <button className="fav-btn" onClick={toggleFavorite}>
            {isFav ? "⭐" : "☆"}
          </button>
        </div>

        <p className="detail-meaning">{word.meaning}</p>

        <div className="detail-tags">
          <span className="tag">{word.partOfSpeech}</span>
          <span className="tag category">{word.category}</span>
          <span className="tag level">{word.level}</span>
        </div>

        <div className="example-box">
          <h4>EXAMPLE</h4>
          <p className="example-text">"{word.exampleSentence}"</p>
        </div>

        <div className="button-row">
          <button className="edit-btn">수정하기</button>
        </div>

      </div>
    </div>
  );
}

export default WordDetailPage;
