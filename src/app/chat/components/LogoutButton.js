import React from "react";
import { useRouter } from "next/navigation";
import styles from "../styles/LogoutButton.module.css"; // CSSモジュールを正しくインポート

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = () => {
    alert("ログアウトしました");
    localStorage.removeItem("role");
    router.push("/");
  };

  return <button onClick={handleLogout} className={styles.logoutButton}>ログアウト</button>;
}
