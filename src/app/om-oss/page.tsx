import React from "react";
import Card from "@/components/ui/Card";
import TrainerCard from "@/components/pt/TrainerCard";
import ContactForm from "@/components/contact/ContactForm";
import trainers from "@/data/trainers.json";
import styles from "./page.module.css";

export const metadata = {
  title: "Om oss — Kraftverk Studio",
  description:
    "Noll prestige, 100% progression. Lär känna vår värdegrund, lokaler och instruktörer.",
};

export default function OmOssPage() {
  return (
    <div className="container">
      <div className={styles.page}>
        {/* Hero */}
        <div className={styles.hero}>
          <h1 className={styles.heroTitle}>Noll prestige, 100% progression</h1>
          <p className={styles.heroSubtitle}>
            Kraftverk Studio är ett vetenskapligt träningslabb med loungestämning. Här tränar du
            smart, följer din progress i realtid och känner dig hemma – utan machokultur eller
            prestige.
          </p>
        </div>

        {/* Värdegrund */}
        <section className={styles.section} id="vardegrund">
          <h2 className={styles.sectionTitle}>Vår värdegrund</h2>
          <div className={styles.valuesGrid}>
            <Card padding="lg">
              <div className={styles.value}>
                <div className={styles.valueIcon}>
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/>
                    <polyline points="12 6 12 12 16 14"/>
                  </svg>
                </div>
                <h3 className={styles.valueTitle}>Resultatorienterade</h3>
                <p className={styles.valueText}>
                  Vi tror på vetenskap, data och progression. Varje medlem följer sin utveckling
                  med pulszoner, volym och tydliga mål.
                </p>
              </div>
            </Card>

            <Card padding="lg">
              <div className={styles.value}>
                <div className={styles.valueIcon}>
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                    <circle cx="9" cy="7" r="4"/>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                  </svg>
                </div>
                <h3 className={styles.valueTitle}>Inkluderande community</h3>
                <p className={styles.valueText}>
                  Noll gym-skräck. Vi välkomnar alla nivåer och skapar en miljö där du känner dig
                  trygg att utmana dig själv.
                </p>
              </div>
            </Card>

            <Card padding="lg">
              <div className={styles.value}>
                <div className={styles.valueIcon}>
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 3v18h18"/>
                    <path d="M18 17V9"/>
                    <path d="M13 17V5"/>
                    <path d="M8 17v-3"/>
                  </svg>
                </div>
                <h3 className={styles.valueTitle}>Transparens & data</h3>
                <p className={styles.valueText}>
                  Din data är din. Exportera träningslogg, följ pulshistorik och se hur communityt
                  utvecklas tillsammans.
                </p>
              </div>
            </Card>

            <Card padding="lg">
              <div className={styles.value}>
                <div className={styles.valueIcon}>
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
                  </svg>
                </div>
                <h3 className={styles.valueTitle}>Smart träning</h3>
                <p className={styles.valueText}>
                  Personliga träningsuppdrag (quests) som kombinerar klasser, styrka och
                  återhämtning för optimal progression.
                </p>
              </div>
            </Card>
          </div>
        </section>

        {/* Anti-douche policy */}
        <section className={styles.section}>
          <Card variant="highlighted" padding="lg">
            <div className={styles.policy}>
              <h2 className={styles.policyTitle}>Vår &quot;Anti-Prestige&quot; Policy</h2>
              <div className={styles.policyContent}>
                <p className={styles.policyText}>
                  Kraftverk Studio har nolltolerans mot gym-skräck, nedvärderande beteende eller
                  prestationsångest. Vi är här för att träna, utvecklas och må bra – tillsammans.
                </p>
                <ul className={styles.policyList}>
                  <li>Alla är välkomna oavsett nivå eller erfarenhet</li>
                  <li>Instruktörer finns för stöd, inte bedömning</li>
                  <li>Gemenskapen bygger på respekt och uppmuntran</li>
                  <li>Progress är personligt – jämför dig med dig själv</li>
                </ul>
              </div>
            </div>
          </Card>
        </section>

        {/* Lokaler */}
        <section className={styles.section} id="lokaler">
          <h2 className={styles.sectionTitle}>Våra lokaler</h2>
          <div className={styles.studiosGrid}>
            <Card padding="lg">
              <div className={styles.studio}>
                <h3 className={styles.studioName}>Stockholm City</h3>
                <p className={styles.studioAddress}>
                  Drottninggatan 88
                  <br />
                  111 36 Stockholm
                </p>
                <div className={styles.studioHours}>
                  <strong>Öppettider:</strong>
                  <br />
                  Måndag–Fredag: 06:00–22:00
                  <br />
                  Helger: 08:00–20:00
                </div>
                <div className={styles.studioFeatures}>
                  <h4 className={styles.studioFeaturesTitle}>Faciliteter:</h4>
                  <ul className={styles.studioFeaturesList}>
                    <li>Styrkeområde med fria vikter</li>
                    <li>Funktionell träningszon</li>
                    <li>2 klassrum</li>
                    <li>Recovery-zon (Studio+ medlemmar)</li>
                    <li>Omklädningsrum med dusch</li>
                  </ul>
                </div>
              </div>
            </Card>

            <Card padding="lg">
              <div className={styles.studio}>
                <h3 className={styles.studioName}>Södermalm</h3>
                <p className={styles.studioAddress}>
                  Götgatan 45
                  <br />
                  118 26 Stockholm
                </p>
                <div className={styles.studioHours}>
                  <strong>Öppettider:</strong>
                  <br />
                  Måndag–Fredag: 06:00–22:00
                  <br />
                  Helger: 08:00–20:00
                </div>
                <div className={styles.studioFeatures}>
                  <h4 className={styles.studioFeaturesTitle}>Faciliteter:</h4>
                  <ul className={styles.studioFeaturesList}>
                    <li>Styrkeområde med fria vikter</li>
                    <li>Cardio-zon</li>
                    <li>1 klassrum</li>
                    <li>Omklädningsrum med dusch</li>
                  </ul>
                </div>
              </div>
            </Card>
          </div>
        </section>

        {/* Instruktörer */}
        <section className={styles.section} id="instruktorer">
          <h2 className={styles.sectionTitle}>Möt våra instruktörer</h2>
          <p className={styles.sectionSubtitle}>
            Alla våra instruktörer är certifierade och brinner för att hjälpa dig nå dina mål.
          </p>
          <div className={styles.trainersGrid}>
            {trainers.slice(0, 4).map((trainer) => (
              <TrainerCard key={trainer.id} trainer={trainer} />
            ))}
          </div>
        </section>

        {/* Säkerhet & Tillgänglighet */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Säkerhet & Tillgänglighet</h2>
          <div className={styles.accessibilityGrid}>
            <Card padding="md">
              <div className={styles.accessItem}>
                <h3 className={styles.accessTitle}>Tillgänglighet</h3>
                <p className={styles.accessText}>
                  Våra lokaler är tillgänglighetsanpassade med hiss, rullstolstoaletter och
                  anpassad utrustning.
                </p>
              </div>
            </Card>

            <Card padding="md">
              <div className={styles.accessItem}>
                <h3 className={styles.accessTitle}>Säkerhet</h3>
                <p className={styles.accessText}>
                  All personal är utbildad i första hjälpen. Hjärtstartare finns tillgänglig i
                  båda lokaler.
                </p>
              </div>
            </Card>

            <Card padding="md">
              <div className={styles.accessItem}>
                <h3 className={styles.accessTitle}>Trygghet</h3>
                <p className={styles.accessText}>
                  Säkra skåp, kameraövervakning i gemensamma utrymmen och personal på plats under
                  öppettider.
                </p>
              </div>
            </Card>
          </div>
        </section>

        {/* Integritet & Cookies */}
        <section className={styles.section} id="integritet">
          <h2 className={styles.sectionTitle}>Integritet & Cookies</h2>
          <Card padding="lg">
            <div className={styles.privacyContent}>
              <h3 className={styles.privacyTitle}>Din integritet är viktig för oss</h3>
              <p className={styles.privacyText}>
                Kraftverk Studio följer GDPR (Dataskyddsförordningen) och tar ditt personliga integritet på största allvar.
              </p>
              
              <h4 className={styles.privacySubtitle}>Vad är cookies?</h4>
              <p className={styles.privacyText}>
                Cookies är små textfiler som lagras på din enhet när du besöker vår webbplats. Vi använder cookies för att:
              </p>
              <ul className={styles.privacyList}>
                <li>Analysera trafik och användarbeteende på vår webbplats</li>
                <li>Förbättra användarupplevelsen</li>
                <li>Visa relevant innehåll och erbjudanden</li>
              </ul>

              <h4 className={styles.privacySubtitle}>Dina rättigheter</h4>
              <p className={styles.privacyText}>
                Enligt GDPR har du rätt att:
              </p>
              <ul className={styles.privacyList}>
                <li>Veta vilka personuppgifter vi samlar in</li>
                <li>Få tillgång till dina personuppgifter</li>
                <li>Rätta felaktiga uppgifter</li>
                <li>Begära radering av dina uppgifter</li>
                <li>När som helst ändra dina cookie-inställningar</li>
              </ul>

              <h4 className={styles.privacySubtitle}>Hur vi använder dina uppgifter</h4>
              <p className={styles.privacyText}>
                Vi samlar endast in nödvändig information för att tillhandahålla vår tjänst och förbättra din upplevelse. 
                Vi delar aldrig dina personuppgifter med tredje part utan ditt samtycke, utom i de fall som krävs enligt lag.
              </p>

              <h4 className={styles.privacySubtitle}>Cookies-inställningar</h4>
              <p className={styles.privacyText}>
                Du kan när som helst ändra dina cookie-inställningar genom att rensa din webbläsares cookies-inställningar 
                eller kontakta oss. Observera att vissa funktioner på webbplatsen kanske inte fungerar optimalt om du väljer 
                att avvisa cookies.
              </p>

              <h4 className={styles.privacySubtitle}>Kontakt</h4>
              <p className={styles.privacyText}>
                Om du har frågor om vår integritetspolicy eller vill utöva dina rättigheter, kontakta oss via formuläret nedan 
                eller på <a href="mailto:integritet@kraftverk.se" className={styles.privacyLink}>integritet@kraftverk.se</a>.
              </p>
            </div>
          </Card>
        </section>

        {/* Contact Form */}
        <section className={styles.section}>
          <ContactForm />
        </section>
      </div>
    </div>
  );
}

