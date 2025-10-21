import React from "react";
import Link from "next/link";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import ParallaxHero from "@/components/effects/ParallaxHero";
import { analytics } from "@/lib/analytics";
import styles from "./page.module.css";

export default function HomePage() {
  const handleMembershipClick = () => {
    analytics.trackCTAClick('membership', 'Bli medlem', 'hero');
  };

  const handleDayPassClick = () => {
    analytics.trackCTAClick('day_pass', 'Prova dagpass', 'hero');
  };

  const handleUpgradeClick = () => {
    analytics.trackCTAClick('upgrade', 'Uppgradera till Studio+', 'training_quests');
  };

  const handleAppDownloadClick = () => {
    analytics.trackCTAClick('app_download', 'Ladda ner appen', 'app_teaser');
  };

  const handleStudioPlusClick = () => {
    analytics.trackCTAClick('studio_plus', 'Läs mer om Studio+', 'recovery');
  };

  return (
    <div className={styles.home}>
      {/* Hero with Background Image */}
      <section className={styles.hero}>
        <ParallaxHero>
          <div className={styles.heroImage}>
            <div className={styles.heroOverlay}></div>
            <img 
              src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070" 
              alt="Person tränar"
              className={styles.heroBg}
            />
          </div>
        </ParallaxHero>
        <div className="container">
          <div className={styles.heroContent}>
            <h1 className={styles.heroTitle}>
              Träna smart.
              <br />
              Känn dig hemma.
            </h1>
            <p className={styles.heroSubtitle}>
              Vetenskaplig träning, mjuk miljö, tydlig progress.
              <br />
              Noll prestige, 100% progression.
            </p>
            <div className={styles.heroCta}>
              <Link href="/medlemskap">
                <Button 
                  size="lg" 
                  onClick={handleMembershipClick}
                  analyticsEvent="membership"
                  analyticsData={{ location: 'hero' }}
                >
                  Bli medlem
                </Button>
              </Link>
              <Link href="/medlemskap#dagpass">
                <Button 
                  size="lg" 
                  variant="secondary"
                  onClick={handleDayPassClick}
                  analyticsEvent="day_pass"
                  analyticsData={{ location: 'hero' }}
                >
                  Prova dagpass
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Social proof - Bento Grid */}
      <section className={styles.section}>
        <div className="container">
          <div className={styles.bentoGrid}>
            <Card padding="lg" className={styles.bentoLarge}>
              <div className={styles.bentoCard}>
                <div className={styles.pulseIndicator}></div>
                <div className={styles.statValue}>2,450+</div>
                <div className={styles.statLabel}>Genomförda pass denna månad</div>
                <div className={styles.statTrend}>+12% från förra månaden</div>
              </div>
            </Card>
            
            <Card padding="md" className={styles.bentoMedium}>
              <div className={styles.bentoCard}>
                <div className={styles.statValue}>850+</div>
                <div className={styles.statLabel}>Aktiva medlemmar</div>
              </div>
            </Card>
            
            <Card padding="md" className={styles.bentoMedium}>
              <div className={styles.bentoCard}>
                <div className={styles.statValue}>45k+</div>
                <div className={styles.statLabel}>Träningsminuter</div>
              </div>
            </Card>

            <Card padding="lg" className={styles.bentoWide}>
              <div className={styles.bentoCard}>
                <h3 className={styles.bentoTitle}>Live Community Pulse</h3>
                <div className={styles.zoneBar}>
                  <div className={styles.zoneSegment} style={{width: '15%', background: 'var(--zone-grey)'}}></div>
                  <div className={styles.zoneSegment} style={{width: '25%', background: 'var(--zone-blue)'}}></div>
                  <div className={styles.zoneSegment} style={{width: '30%', background: 'var(--zone-green)'}}></div>
                  <div className={styles.zoneSegment} style={{width: '20%', background: 'var(--zone-orange)'}}></div>
                  <div className={styles.zoneSegment} style={{width: '10%', background: 'var(--zone-red)'}}></div>
                </div>
                <p className={styles.bentoSubtext}>127 medlemmar tränar just nu</p>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Träningsuppdrag teaser */}
      <section className={styles.section}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Dina Träningsuppdrag</h2>
            <p className={styles.sectionSubtitle}>
              Personliga program som tar dig mot dina mål. Välj ett uppdrag och följ din progress.
            </p>
          </div>

          <div className={styles.questGrid}>
            <Card padding="lg">
              <div className={styles.quest}>
                <Badge variant="success">30 dagar</Badge>
                <h3 className={styles.questTitle}>Stark Rygg</h3>
                <p className={styles.questDesc}>
                  Bygg stabilitet och kraft i rygg och core. 3 pass/vecka med progression.
                </p>
                <div className={styles.questMeta}>
                  <span>12 av 850 medlemmar genomför</span>
                </div>
              </div>
            </Card>

            <Card padding="lg">
              <div className={styles.quest}>
                <Badge variant="warning">6 veckor</Badge>
                <h3 className={styles.questTitle}>5K Kondition</h3>
                <p className={styles.questDesc}>
                  Spring 5 km utan stopp. Progressiv löpträning + styrka för löpare.
                </p>
                <div className={styles.questMeta}>
                  <span>28 av 850 medlemmar genomför</span>
                </div>
              </div>
            </Card>

            <Card padding="lg">
              <div className={styles.quest}>
                <Badge>4 veckor</Badge>
                <h3 className={styles.questTitle}>Rörlighet 10×10</h3>
                <p className={styles.questDesc}>
                  10 minuter mobilitet varje dag i 10 dagar. Återställ din rörlighet.
                </p>
                <div className={styles.questMeta}>
                  <span>45 av 850 medlemmar genomför</span>
                </div>
              </div>
            </Card>
          </div>

          <div className={styles.questCta}>
            <p className={styles.questCtaText}>
              Träningsuppdrag tillgängliga för Studio+ medlemmar
            </p>
            <Link href="/medlemskap">
              <Button 
                variant="secondary"
                onClick={handleUpgradeClick}
                analyticsEvent="upgrade"
                analyticsData={{ location: 'training_quests' }}
              >
                Uppgradera till Studio+
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Schema teaser */}
      <section className={styles.section}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Kommande klasser</h2>
            <Link href="/schema" className={styles.sectionLink}>
              Se hela schemat →
            </Link>
          </div>

          <div className={styles.classGrid}>
            <Card padding="sm">
              <div className={styles.classCard}>
                <div className={styles.classImage}>
                  <img 
                    src="https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=800" 
                    alt="Strength Foundation"
                    className={styles.classImg}
                  />
                  <div className={styles.classImageOverlay}></div>
                </div>
                <div className={styles.classContent}>
                  <div className={styles.classHeader}>
                    <div>
                      <h4 className={styles.classTitle}>Strength Foundation</h4>
                      <p className={styles.classInstructor}>Emma Lindberg</p>
                    </div>
                    <Badge zone="green">Medel</Badge>
                  </div>
                  <div className={styles.classTime}>
                    <span>Idag 18:00</span>
                    <span className={styles.classDuration}>60 min</span>
                  </div>
                  <div className={styles.classSpots}>
                    <span>8 platser kvar</span>
                  </div>
                </div>
              </div>
            </Card>

            <Card padding="sm">
              <div className={styles.classCard}>
                <div className={styles.classImage}>
                  <img 
                    src="https://images.unsplash.com/photo-1549576490-b0b4831ef60a?q=80&w=800" 
                    alt="HIIT Blast"
                    className={styles.classImg}
                  />
                  <div className={styles.classImageOverlay}></div>
                </div>
                <div className={styles.classContent}>
                  <div className={styles.classHeader}>
                    <div>
                      <h4 className={styles.classTitle}>HIIT Blast</h4>
                      <p className={styles.classInstructor}>David Strömberg</p>
                    </div>
                    <Badge zone="red">Hög</Badge>
                  </div>
                  <div className={styles.classTime}>
                    <span>Idag 19:30</span>
                    <span className={styles.classDuration}>30 min</span>
                  </div>
                  <div className={styles.classSpots}>
                    <Badge variant="warning">Kö 3</Badge>
                  </div>
                </div>
              </div>
            </Card>

            <Card padding="sm">
              <div className={styles.classCard}>
                <div className={styles.classImage}>
                  <img 
                    src="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=800" 
                    alt="Mobility Flow"
                    className={styles.classImg}
                  />
                  <div className={styles.classImageOverlay}></div>
                </div>
                <div className={styles.classContent}>
                  <div className={styles.classHeader}>
                    <div>
                      <h4 className={styles.classTitle}>Mobility Flow</h4>
                      <p className={styles.classInstructor}>Alex Nguyen</p>
                    </div>
                    <Badge zone="grey">Låg</Badge>
                  </div>
                  <div className={styles.classTime}>
                    <span>Imorgon 07:00</span>
                    <span className={styles.classDuration}>45 min</span>
                  </div>
                  <div className={styles.classSpots}>
                    <span>12 platser kvar</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* App teaser */}
      <section className={styles.section}>
        <div className="container">
          <Card variant="highlighted" padding="lg">
            <div className={styles.appTeaser}>
              <div className={styles.appContent}>
                <h2 className={styles.appTitle}>Allt i din mobil</h2>
                <ul className={styles.appFeatures}>
                  <li>Boka klasser direkt i appen</li>
                  <li>Digitalt medlemskort med QR-kod</li>
                  <li>Pushnotiser när du får plats i kö</li>
                  <li>Följ din träningshistorik och progress</li>
                  <li>Se schemaändringar i realtid</li>
                </ul>
              </div>
              <div className={styles.appCta}>
                <Button 
                  size="lg"
                  onClick={handleAppDownloadClick}
                  analyticsEvent="app_download"
                  analyticsData={{ location: 'app_teaser' }}
                >
                  Ladda ner appen
                </Button>
                <p className={styles.appNote}>iOS & Android</p>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Recovery teaser */}
      <section className={styles.section}>
        <div className="container">
          <div className={styles.recovery}>
            <h2 className={styles.recoveryTitle}>Träna + Återhämta snabbare</h2>
            <p className={styles.recoveryText}>
              Studio+ medlemmar får tillgång till vår recovery-zon med IR-bastu, kalla bad och
              massage. Boka recovery-slots precis som klasser.
            </p>
            <Link href="/medlemskap">
              <Button 
                variant="secondary"
                onClick={handleStudioPlusClick}
                analyticsEvent="studio_plus"
                analyticsData={{ location: 'recovery' }}
              >
                Läs mer om Studio+
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

