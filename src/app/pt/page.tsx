import React from "react";
import TrainerCard from "@/components/pt/TrainerCard";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import trainers from "@/data/trainers.json";
import styles from "./page.module.css";

export const metadata = {
  title: "PT & Coaching — Kraftverk Studio",
  description: "Personlig träning och coaching med våra erfarna instruktörer.",
};

export default function PTPage() {
  const packages = [
    {
      id: "screening",
      name: "Startscreening",
      sessions: 1,
      price: 599,
      description: "Grundlig screening, mål och träningsplan",
    },
    {
      id: "starter",
      name: "Starter",
      sessions: 3,
      price: 1599,
      description: "3 sessioner för att komma igång rätt",
      popular: false,
    },
    {
      id: "progress",
      name: "Progress",
      sessions: 10,
      price: 4999,
      description: "10 sessioner med strukturerad progression",
      popular: true,
    },
    {
      id: "transform",
      name: "Transform",
      sessions: 20,
      price: 8999,
      description: "20 sessioner för djupgående förändring",
      popular: false,
    },
  ];

  return (
    <div className="container">
      <div className={styles.page}>
        <div className={styles.header}>
          <h1 className={styles.title}>PT & Coaching</h1>
          <p className={styles.subtitle}>
            Jobba en-till-en med våra erfarna instruktörer. Vi hjälper dig nå dina mål med
            skräddarsydda träningsprogram och kontinuerlig uppföljning.
          </p>
        </div>

        {/* Packages */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Välj ditt paket</h2>
          <div className={styles.packagesGrid}>
            {packages.map((pkg) => (
              <Card
                key={pkg.id}
                padding="lg"
                variant={pkg.popular ? "highlighted" : "default"}
              >
                <div className={styles.package}>
                  <h3 className={styles.packageName}>{pkg.name}</h3>
                  <div className={styles.packagePrice}>
                    <span className={styles.priceAmount}>{pkg.price}</span>
                    <span className={styles.priceCurrency}>kr</span>
                  </div>
                  <p className={styles.packageSessions}>{pkg.sessions} session{pkg.sessions > 1 ? 'er' : ''}</p>
                  <p className={styles.packageDesc}>{pkg.description}</p>
                  <div className={styles.packageCta}>
                    <Button fullWidth variant={pkg.popular ? "primary" : "secondary"}>
                      Boka {pkg.name}
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* What's included */}
        <section className={styles.section}>
          <Card padding="lg" variant="highlighted">
            <div className={styles.included}>
              <h2 className={styles.includedTitle}>Vad ingår?</h2>
              <div className={styles.includedGrid}>
                <div className={styles.includedItem}>
                  <div className={styles.includedIcon}>
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M3 3v18h18"/>
                      <path d="M18 17V9"/>
                      <path d="M13 17V5"/>
                      <path d="M8 17v-3"/>
                    </svg>
                  </div>
                  <h3 className={styles.includedItemTitle}>Screening & Analys</h3>
                  <p className={styles.includedItemDesc}>
                    Grundlig genomgång av mål, historik och eventuella begränsningar
                  </p>
                </div>
                <div className={styles.includedItem}>
                  <div className={styles.includedIcon}>
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                      <polyline points="14 2 14 8 20 8"/>
                      <line x1="12" y1="18" x2="12" y2="12"/>
                      <line x1="9" y1="15" x2="15" y2="15"/>
                    </svg>
                  </div>
                  <h3 className={styles.includedItemTitle}>Personlig Plan</h3>
                  <p className={styles.includedItemDesc}>
                    Skräddarsydd träningsplan anpassad efter dina behov och mål
                  </p>
                </div>
                <div className={styles.includedItem}>
                  <div className={styles.includedIcon}>
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"/>
                      <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
                      <line x1="9" y1="9" x2="9.01" y2="9"/>
                      <line x1="15" y1="9" x2="15.01" y2="9"/>
                    </svg>
                  </div>
                  <h3 className={styles.includedItemTitle}>1-till-1 Sessioner</h3>
                  <p className={styles.includedItemDesc}>
                    Fokuserad träning med teknikcoaching och motivationsstöd
                  </p>
                </div>
                <div className={styles.includedItem}>
                  <div className={styles.includedIcon}>
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                    </svg>
                  </div>
                  <h3 className={styles.includedItemTitle}>Uppföljning</h3>
                  <p className={styles.includedItemDesc}>
                    Kontinuerlig utvärdering och justering av din plan
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </section>

        {/* Trainers */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Möt våra instruktörer</h2>
          <div className={styles.trainersGrid}>
            {trainers.map((trainer) => (
              <TrainerCard key={trainer.id} trainer={trainer} />
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className={styles.cta}>
          <h2 className={styles.ctaTitle}>Redo att börja?</h2>
          <p className={styles.ctaText}>
            Boka en kostnadsfri konsultation så hjälper vi dig hitta rätt paket och instruktör.
          </p>
          <Button size="lg">Boka kostnadsfri konsultation</Button>
        </section>
      </div>
    </div>
  );
}

