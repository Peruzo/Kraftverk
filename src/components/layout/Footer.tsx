import React from "react";
import Link from "next/link";
import Logo from "./Logo";
import styles from "./Footer.module.css";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className="container">
        <div className={styles.grid}>
          <div className={styles.column}>
            <div className={styles.footerLogo}>
              <Logo />
            </div>
            <p className={styles.tagline}>
              Träna smart. Känn dig hemma.
              <br />
              Noll prestige, 100% progression.
            </p>
          </div>

          <div className={styles.column}>
            <h4 className={styles.columnTitle}>Träning</h4>
            <nav className={styles.links}>
              <Link href="/medlemskap">Medlemskap</Link>
              <Link href="/schema">Schema</Link>
              <Link href="/pt">PT & Coaching</Link>
            </nav>
          </div>

          <div className={styles.column}>
            <h4 className={styles.columnTitle}>Om oss</h4>
            <nav className={styles.links}>
              <Link href="/om-oss">Om Kraftverk</Link>
              <Link href="/om-oss#instruktorer">Instruktörer</Link>
              <Link href="/om-oss#lokaler">Lokaler</Link>
            </nav>
          </div>

          <div className={styles.column}>
            <h4 className={styles.columnTitle}>Support</h4>
            <nav className={styles.links}>
              <Link href="/kontakt">Kontakt</Link>
              <Link href="/villkor">Villkor</Link>
              <Link href="/integritet">Integritet</Link>
              <Link href="/tillganglighet">Tillgänglighet</Link>
            </nav>
          </div>
        </div>

        <div className={styles.bottom}>
          <p className={styles.copyright}>
            © {currentYear} Kraftverk Studio. Alla rättigheter reserverade.
          </p>
        </div>
      </div>
    </footer>
  );
}

