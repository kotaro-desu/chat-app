import React, { useState } from "react";
import styles from "../styles/QuestionInput.module.css";

export default function QuestionInput({ onAddQuestion }) {
  const [content, setContent] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false); // 匿名フラグ

  const handleSubmit = (e) => {
    e.preventDefault();
    if (content.trim() === "") {
      alert("質問内容を入力してください");
      return;
    }
    onAddQuestion(content, isAnonymous); // 匿名フラグを渡す
    setContent("");
    setIsAnonymous(false); // 初期化
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <label className={styles.checkboxLabel}>
        <input
          type="checkbox"
          checked={isAnonymous}
          onChange={(e) => setIsAnonymous(e.target.checked)}
          className={styles.checkbox}
        />
        匿名
      </label>
      <textarea
        className={styles.textarea}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="質問を入力してください..."
        rows="2" // 初期表示の行数
        cols="50" // 初期表示の列幅（任意）
      ></textarea>
      <button type="submit" className={styles.button}>
        送信
      </button>
    </form>
  );
}
