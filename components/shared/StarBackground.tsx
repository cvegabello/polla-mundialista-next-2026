import React from "react";
import styles from "./StarBackground.module.css";

export const StarBackground = () => {
  return (
    <div
      // AQUÍ ESTÁ EL TRUCO INVERSO:
      className={`
        ${styles.starsContainer}
        transition-opacity duration-1000 ease-in-out
        opacity-0 dark:opacity-100
      `}
    >
      <div className={styles.stars1}></div>
      <div className={styles.stars2}></div>
    </div>
  );
};
