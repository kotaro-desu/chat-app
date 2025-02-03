"use client";

import React, { useState } from "react";
import styles from "./page.module.css";

export default function RegisterPage() {
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id, password }),
      });

      if (response.ok) {
        alert("登録成功！ログインページに戻ります。");
        window.location.href = "/"; // ログインページへリダイレクト
      } else {
        const error = await response.json();
        alert(error.message || "登録に失敗しました");
      }
    } catch (err) {
      console.error("登録エラー:", err);
      alert("登録中にエラーが発生しました");
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>生徒登録</h1>
      <form onSubmit={handleRegister} className={styles.form}>
        <div className={styles.inputGroup}>
          <label htmlFor="id">ID</label>
          <input
            type="text"
            id="id"
            value={id}
            onChange={(e) => setId(e.target.value)}
            className={styles.input}
            placeholder="IDを入力"
          />
        </div>
        <div className={styles.inputGroup}>
          <label htmlFor="password">パスワード</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={styles.input}
            placeholder="パスワードを入力"
          />
        </div>
        <button type="submit" className={styles.button}>
          登録
        </button>
      </form>
    </div>
  );

}
