import React from "react";
import styles from "./Logo.module.css";

export default function Logo() {
  return (
    <div className={styles.logo}>
      <svg
        width="40"
        height="40"
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={styles.logoIcon}
      >
        {/* Hexagon shape */}
        <path
          d="M20 2L35 11V29L20 38L5 29V11L20 2Z"
          stroke="url(#logo-gradient)"
          strokeWidth="2"
          fill="rgba(34, 211, 238, 0.1)"
        />
        
        {/* Lightning bolt / K shape */}
        <path
          d="M23 8L15 20H20L17 32L28 17H23L27 8H23Z"
          fill="url(#logo-gradient)"
        />
        
        <defs>
          <linearGradient id="logo-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#22D3EE" />
            <stop offset="100%" stopColor="#10B981" />
          </linearGradient>
        </defs>
      </svg>
      
      <div className={styles.logoText}>
        <span className={styles.logoName}>KRAFTVERK</span>
        <span className={styles.logoTagline}>STUDIO</span>
      </div>
    </div>
  );
}





