import React from "react";
import styles from "../styles/SearchBar.module.css";

export default function SearchBar({ searchQuery, setSearchQuery }) {
  return (
    <div className={styles.searchBar}>
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="質問を検索"
        className={styles.input}
      />
    </div>
  );
}
