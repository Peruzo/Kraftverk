"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store/auth";
import styles from "./layout.module.css";

export default function MinSidaLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  // Simple demo login for MVP - i produktion skulle detta vara en riktig auth-flow
  useEffect(() => {
    if (!isAuthenticated) {
      // Auto-login för demo
      const demoLogin = async () => {
        const { login } = useAuthStore.getState();
        await login("demo@kraftverk.se", "flex");
      };
      demoLogin();
    }
  }, [isAuthenticated]);

  return (
    <div className={styles.layout}>
      {children}
    </div>
  );
}






