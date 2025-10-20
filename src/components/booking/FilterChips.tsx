"use client";

import React from "react";
import styles from "./FilterChips.module.css";

type FilterChipsProps = {
  label: string;
  options: string[];
  selected: string | null;
  onSelect: (option: string | null) => void;
};

export default function FilterChips({ label, options, selected, onSelect }: FilterChipsProps) {
  return (
    <div className={styles.filter}>
      <label className={styles.label}>{label}</label>
      <div className={styles.chips}>
        <button
          className={`${styles.chip} ${selected === null ? styles.active : ""}`}
          onClick={() => onSelect(null)}
        >
          Alla
        </button>
        {options.map((option) => (
          <button
            key={option}
            className={`${styles.chip} ${selected === option ? styles.active : ""}`}
            onClick={() => onSelect(option)}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}





