import React from "react";
import styles from "./Card.module.css";

type CardProps = {
  children: React.ReactNode;
  variant?: "default" | "highlighted";
  padding?: "sm" | "md" | "lg";
  onClick?: () => void;
  className?: string;
};

export default function Card({
  children,
  variant = "default",
  padding = "md",
  onClick,
  className = "",
}: CardProps) {
  const Tag = onClick ? "button" : "div";
  
  return (
    <Tag
      onClick={onClick}
      className={`${styles.card} ${styles[variant]} ${styles[`padding-${padding}`]} ${
        onClick ? styles.clickable : ""
      } ${className}`}
    >
      {children}
    </Tag>
  );
}






