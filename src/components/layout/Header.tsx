"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/lib/store/auth";
import Logo from "./Logo";
import styles from "./Header.module.css";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { isAuthenticated, user, logout } = useAuthStore();

  const navLinks = [
    { href: "/medlemskap", label: "Medlemskap" },
    { href: "/schema", label: "Schema" },
    { href: "/pt", label: "PT & Coaching" },
    { href: "/produkter", label: "Produkter" },
    { href: "/om-oss", label: "Om oss" },
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <header className={styles.header}>
      <div className="container">
        <div className={styles.inner}>
          <Link href="/">
            <Logo />
          </Link>

          {/* Desktop nav */}
          <nav className={styles.nav}>
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`${styles.navLink} ${isActive(link.href) ? styles.active : ""}`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className={styles.actions}>
            {isAuthenticated ? (
              <>
                <Link href="/min-sida" className={styles.userLink}>
                  {user?.name || "Min sida"}
                </Link>
                <button onClick={logout} className={styles.logoutBtn}>
                  Logga ut
                </button>
              </>
            ) : (
              <Link href="/min-sida" className={styles.loginBtn}>
                Logga in
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className={styles.mobileMenuBtn}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className={styles.mobileMenu}>
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`${styles.mobileNavLink} ${isActive(link.href) ? styles.active : ""}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            {isAuthenticated ? (
              <>
                <Link
                  href="/min-sida"
                  className={styles.mobileNavLink}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Min sida
                </Link>
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className={styles.mobileNavLink}
                >
                  Logga ut
                </button>
              </>
            ) : (
              <Link
                href="/min-sida"
                className={styles.mobileNavLink}
                onClick={() => setMobileMenuOpen(false)}
              >
                Logga in
              </Link>
            )}
          </div>
        )}
      </div>
    </header>
  );
}

