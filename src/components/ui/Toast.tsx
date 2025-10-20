"use client";

import React, { useEffect } from "react";
import styles from "./Toast.module.css";

type ToastProps = {
  message: string;
  type?: "success" | "error" | "info";
  onClose: () => void;
  duration?: number;
};

export default function Toast({ message, type = "info", onClose, duration = 3000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div className={`${styles.toast} ${styles[type]} ${styles.show}`}>
      <div className={styles.message}>{message}</div>
      <button className={styles.close} onClick={onClose} aria-label="Stäng">
        ×
      </button>
    </div>
  );
}






