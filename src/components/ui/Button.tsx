import React from "react";
import { analytics } from "@/lib/analytics";
import styles from "./Button.module.css";

type ButtonProps = {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  className?: string;
  analyticsEvent?: string;
  analyticsData?: Record<string, any>;
};

export default function Button({
  children,
  variant = "primary",
  size = "md",
  fullWidth = false,
  disabled = false,
  onClick,
  type = "button",
  className = "",
  analyticsEvent,
  analyticsData,
}: ButtonProps) {
  const handleClick = () => {
    // Track analytics if event is provided
    if (analyticsEvent) {
      analytics.trackCTAClick(analyticsEvent, children?.toString() || '', analyticsData?.location);
    }
    
    // Call original onClick
    if (onClick) {
      onClick();
    }
  };

  return (
    <button
      type={type}
      onClick={handleClick}
      disabled={disabled}
      className={`${styles.button} ${styles[variant]} ${styles[size]} ${
        fullWidth ? styles.fullWidth : ""
      } ${className}`}
    >
      {children}
    </button>
  );
}






