import React from "react";
import styles from "./CloudsBackground.module.css";

export const CloudsBackground = () => {
  return (
    <div
      // AQUÍ ESTÁ EL TRUCO: Tailwind controla la opacidad directamente
      className={`
        ${styles.skyContainer} 
        transition-opacity duration-1000 ease-in-out
        opacity-100 dark:opacity-0
      `}
    >
      <div className={`${styles.cloudLayer} ${styles.clouds1}`}></div>
      <div className={`${styles.cloudLayer} ${styles.clouds2}`}></div>
    </div>
  );
};
