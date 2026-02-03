import React from "react";
import styles from "./StarBackground.module.css";

export const StarBackground = () => {
  return (
    // Este contenedor solo es visible en modo 'dark'
    <div className={`hidden dark:block ${styles.starsContainer}`}>
      <div className={styles.stars1}></div>
      <div className={styles.stars2}></div>
    </div>
  );
};
