"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";

export default function LoginPage() {
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleLogin = async () => {
    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, password }),
      });
  
      if (response.ok) {
        const data = await response.json();
        localStorage.setItem("token", data.token); // JWTトークン保存
        localStorage.setItem("userId", id); // ユーザーID保存
        localStorage.setItem("role", data.role); // ロール保存
        router.push("/chat"); // チャット画面に遷移
      } else {
        const errorData = await response.json();
        console.error("ログイン失敗:", errorData.message);
        alert(`ログイン失敗: ${errorData.message}`);
      }
    } catch (error) {
      console.error("ログインエラー:", error.message);
      alert("ログイン処理中にエラーが発生しました");
    }
  };
  

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>ログイン</h1>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleLogin();
        }}
        className={styles.form}
      >
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
        <button type="submit" className={styles.button}>ログイン</button>
      </form>
      <div className={styles.newRegister}>
        <a href="/register" className={styles.link}>新規登録はこちら</a>
      </div>
    </div>
  );

}
