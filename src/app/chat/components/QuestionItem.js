import React, { useState, useEffect } from "react";
import styles from "../styles/QuestionItem.module.css";

export default function QuestionItem({
  question,
  onDeleteQuestion,
  role,
  onMarkAnswered,
}) {
  const [replies, setReplies] = useState([]);
  const [replyContent, setReplyContent] = useState("");

  useEffect(() => {
    const fetchReplies = async () => {
      try {
        const response = await fetch(`http://localhost:5001/questions/${question.id}/replies`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        const data = await response.json();
        setReplies(data);
      } catch (error) {
        console.error("返信取得エラー:", error);
      }
    };
    fetchReplies();
  }, [question.id]);

  const handleReplySubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token");
    if (!token) {
      alert("ログイン情報がありません。再ログインしてください。");
      return;
    }

    if (!replyContent.trim()) {
      alert("返信内容を入力してください");
      return;
    }

    try {
      const response = await fetch(`/api/questions/${question.id}/replies`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content: replyContent }),
      });

      if (response.ok) {
        const newReply = await response.json();
        setReplies((prevReplies) => [...prevReplies, newReply.reply]);
        setReplyContent("");
      } else {
        const error = await response.json();
        console.error("返信投稿エラー:", error);
      }
    } catch (error) {
      console.error("返信投稿中にエラーが発生しました:", error);
    }
  };

  return (
    <li className={styles.questionItem}>
      <div className={styles.header}>
  <span className={styles.user}>
    投稿者: {question.isAnonymous ? "匿名" : question.userId}
  </span>
  <div className={styles.answeredContainer}>
    {role === "teacher" ? (
      <>
        <input
          type="checkbox"
          checked={question.isAnswered}
          onChange={(e) => onMarkAnswered(question.id, e.target.checked)}
          title="回答済みとしてマーク"
        />
        <span className={styles.answeredLabel}>回答済み</span>
      </>
    ) : (
      <span
        className={`${styles.answerStatus} ${
          question.isAnswered ? styles.answered : styles.unanswered
        }`}
      >
        {question.isAnswered ? "回答済みです" : "未回答です"}
      </span>
    )}
  </div>
</div>

      <p className={styles.content}>{question.content}</p>
      {localStorage.getItem("userId") === question.userId && (
        <div className={styles.actions}>
          <button className={styles.button} onClick={() => onDeleteQuestion(question.id)}>
            削除
          </button>
        </div>
      )}
      <ul className={styles.replies}>
        {replies.map((reply) => (
          <li key={reply.id}>
            <span className={styles.replyUser}>
              {reply.userId} さんの返信:
            </span>
            <p className={styles.replyContent}>{reply.content}</p>
          </li>
        ))}
      </ul>
      <form onSubmit={handleReplySubmit}>
        <textarea
          value={replyContent}
          onChange={(e) => setReplyContent(e.target.value)}
          placeholder="返信を入力"
          className={styles.replyInput}
        />
        <button type="submit" className={styles.replyButton}>
          返信
        </button>
      </form>
    </li>
  );
}
