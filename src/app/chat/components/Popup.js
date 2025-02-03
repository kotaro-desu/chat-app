import React, { useEffect, useState } from "react";
import styles from "../styles/Popup.module.css";

export default function Popup({ message, duration = 10000 }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
    }, duration);

    return () => clearTimeout(timer); // クリーンアップ
  }, [duration]);

  if (!visible) {
    return null; // 非表示時は何もレンダリングしない
  }

  return (
    <div className={styles.popup}>
      <p>{message}</p>
    </div>
  );
}
