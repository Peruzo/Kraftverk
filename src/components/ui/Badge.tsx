import React from "react";
import styles from "./Badge.module.css";

type BadgeProps = {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "error" | "accent" | "zone";
  zone?: "grey" | "blue" | "green" | "orange" | "red";
  className?: string;
};

export default function Badge({
  children,
  variant = "default",
  zone,
  className = "",
}: BadgeProps) {
  const zoneClass = zone ? styles[`zone-${zone}`] : "";
  
  return (
    <span className={`${styles.badge} ${styles[variant]} ${zoneClass} ${className}`}>
      {children}
    </span>
  );
}






