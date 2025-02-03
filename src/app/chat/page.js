"use client";

import React, { useState, useEffect } from "react";
import QuestionList from "./components/QuestionList";
import QuestionInput from "./components/QuestionInput";
import SearchBar from "./components/SearchBar";
import LogoutButton from "./components/LogoutButton";
import Popup from "./components/Popup"; // ポップアップコンポーネントをインポート
import styles from "./styles/chat.module.css";

export default function ChatPage() {
  const [questions, setQuestions] = useState([]);
  const [role, setRole] = useState(""); // ユーザーのロール
  const [searchQuery, setSearchQuery] = useState("");
  const [showAnswered, setShowAnswered] = useState(false); // デフォルトは未回答の質問を表示
  const [showPopup, setShowPopup] = useState(true); // ポップアップ表示状態

  useEffect(() => {
    const storedRole = localStorage.getItem("role");
    setRole(storedRole || "student");

    const fetchQuestions = async () => {
      try {
        const token = localStorage.getItem("token"); // ローカルストレージからトークンを取得
        if (!token) throw new Error("トークンが存在しません");

        const response = await fetch("/api/questions", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`, // JWTトークンをヘッダーに追加
          },
        });

        if (!response.ok) {
          throw new Error("サーバーエラー: 質問の取得に失敗しました");
        }

        const data = await response.json();
        setQuestions(data); // 質問データを状態に保存
      } catch (error) {
        console.error("質問の取得に失敗しました:", error.message);
      }
    };

    fetchQuestions();

    // 10秒後にポップアップを非表示にする
    const popupTimer = setTimeout(() => setShowPopup(false), 10000);
    return () => clearTimeout(popupTimer); // クリーンアップ
  }, []);

  const handleAddQuestion = async (content, isAnonymous) => {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");

    if (!token || !userId) {
      alert("ログイン情報が見つかりません。再ログインしてください。");
      return;
    }

    try {
      const response = await fetch("/api/questions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content, isAnonymous }),
      });

      if (response.ok) {
        const data = await response.json();
        setQuestions((prevQuestions) => [...prevQuestions, data.question]);
      } else {
        const error = await response.json();
        console.error("質問投稿エラー:", error.message);
      }
    } catch (error) {
      console.error("質問投稿中にエラーが発生しました:", error.message);
    }
  };

  const handleDeleteQuestion = async (id) => {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId"); // ローカルストレージからユーザーIDを取得

    if (!token || !userId) {
      alert("ログイン情報が見つかりません。再ログインしてください。");
      return;
    }

    try {
      const response = await fetch(`/api/questions/${id}?userId=${userId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setQuestions((prev) => prev.filter((question) => question.id !== id));
        alert("質問を削除しました");
      } else {
        const error = await response.json();
        console.error("質問削除エラー:", error.message);
        alert(`質問削除エラー: ${error.message}`);
      }
    } catch (error) {
      console.error("質問削除中にエラーが発生しました:", error.message);
      alert("質問削除中にエラーが発生しました");
    }
  };

  const handleMarkAnswered = (questionId, isAnswered) => {
    setQuestions((prevQuestions) =>
      prevQuestions.map((q) =>
        q.id === questionId ? { ...q, isAnswered } : q
      )
    );
  };

  const toggleAnsweredFilter = () => {
    setShowAnswered((prevState) => !prevState); // 状態をトグル
  };

  const filteredQuestions = questions.filter((question) => {
    // showAnswered の状態に基づいてフィルタリング
    return showAnswered ? question.isAnswered : !question.isAnswered;
  });

  const searchFilteredQuestions = filteredQuestions.filter((question) =>
    question.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={styles.chatContainer}>
      <header className={styles.header}>
        <h1>質問アプリ</h1>
        <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
        <LogoutButton />
      </header>
      {showPopup && <Popup message="分からないことを質問しよう！" />} {/* ポップアップを追加 */}
      <button onClick={toggleAnsweredFilter} className={styles.button}>
        {showAnswered ? "未回答の質問を表示する" : "回答済みの質問を表示する"}
      </button>
      <main className={styles.main}>
        <QuestionList
          questions={searchFilteredQuestions}
          onDeleteQuestion={handleDeleteQuestion}
          role={role}
          onMarkAnswered={handleMarkAnswered}
        />
      </main>
      <footer className={styles.footer}>
        {role === "student" && <QuestionInput onAddQuestion={handleAddQuestion} />}
      </footer>
    </div>
  );
}
