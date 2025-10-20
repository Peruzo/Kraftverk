"use client";

import { useEffect, useRef } from "react";
import styles from "./ParallaxHero.module.css";

export default function ParallaxHero({ children }: { children: React.ReactNode }) {
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!heroRef.current) return;
      const scrolled = window.scrollY;
      const parallaxSpeed = 0.5;
      heroRef.current.style.transform = `translateY(${scrolled * parallaxSpeed}px)`;
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div ref={heroRef} className={styles.parallax}>
      {children}
    </div>
  );
}





