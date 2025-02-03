import React from "react";
import styles from "../styles/RoleSpecificActions.module.css"; // CSSモジュールを正しくインポート

export default function RoleSpecificActions() {
  return (
    <div className={styles.roleActions}>
      <h2>教師専用機能</h2>
      <button onClick={() => alert("回答済みマーク")} className={styles.button}>
        回答済みをマーク
      </button>
    </div>
  );
}
