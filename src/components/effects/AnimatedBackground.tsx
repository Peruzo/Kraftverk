"use client";

import React, { useEffect, useRef } from "react";
import styles from "./AnimatedBackground.module.css";

export default function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    const setCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    setCanvasSize();
    window.addEventListener("resize", setCanvasSize);

    // Gradient orbs
    const orbs: Array<{
      x: number;
      y: number;
      radius: number;
      vx: number;
      vy: number;
      color: string;
    }> = [
      {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: 300,
        vx: 0.3,
        vy: 0.2,
        color: "rgba(34, 211, 238, 0.15)", // Accent turkos
      },
      {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: 250,
        vx: -0.2,
        vy: 0.3,
        color: "rgba(59, 130, 246, 0.1)", // Blue zone
      },
      {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: 350,
        vx: 0.25,
        vy: -0.15,
        color: "rgba(16, 185, 129, 0.08)", // Green zone
      },
    ];

    // Animation loop
    const animate = () => {
      ctx.fillStyle = "rgba(11, 18, 32, 0.05)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      orbs.forEach((orb) => {
        // Update position
        orb.x += orb.vx;
        orb.y += orb.vy;

        // Bounce off edges
        if (orb.x < 0 || orb.x > canvas.width) orb.vx *= -1;
        if (orb.y < 0 || orb.y > canvas.height) orb.vy *= -1;

        // Draw gradient
        const gradient = ctx.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, orb.radius);
        gradient.addColorStop(0, orb.color);
        gradient.addColorStop(1, "rgba(11, 18, 32, 0)");

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      });

      requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", setCanvasSize);
    };
  }, []);

  return <canvas ref={canvasRef} className={styles.canvas} />;
}






