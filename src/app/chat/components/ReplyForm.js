import React from "react";
import styles from "../styles/QuestionItem.module.css";

export default function QuestionItem({ question, onDeleteQuestion, role, onMarkAnswered }) {
  const currentUserId = localStorage.getItem("userId");

  const handleDelete = () => {
    onDeleteQuestion(question.id, currentUserId);
  };

  const handleMarkAnswered = (e) => {
    onMarkAnswered(question.id, e.target.checked);
  };

  return (
    <li className={styles.questionItem}>
      <div className={styles.header}>
        <span className={styles.user}>
          投稿者: {question.isAnonymous ? "匿名" : question.userId}
        </span>
        {role === "teacher" && (
          <div className={styles.answeredContainer}>
            <input
              type="checkbox"
              checked={question.isAnswered}
              onChange={handleMarkAnswered}
              title="回答済みとしてマーク"
            />
            <span className={styles.answeredLabel}>回答済み</span>
          </div>
        )}
      </div>
      <p className={styles.content}>{question.content}</p>
      {currentUserId === question.userId && (
        <div className={styles.actions}>
          <button className={styles.button} onClick={handleDelete}>
            削除
          </button>
        </div>
      )}
    </li>
  );
}
