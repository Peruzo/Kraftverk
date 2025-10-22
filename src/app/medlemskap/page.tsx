"use client";

import React from "react";
import PricingCard from "@/components/membership/PricingCard";
import memberships from "@/data/memberships.json";
import styles from "./page.module.css";

export default function MedlemskapPage() {
  const regularMemberships = memberships.filter((m) => m.id !== "dagpass");
  const dagpass = memberships.find((m) => m.id === "dagpass");

  const handleMembershipSelect = async (membership: any, campaignId?: string) => {
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          membershipId: membership.id,
          userId: "demo-user", // Replace with actual user ID later
          campaignId: campaignId, // Pass campaign ID if available
        }),
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url; // Redirect to Stripe
      } else {
        alert(`Betalningsfel: ${data.error}`);
      }
    } catch (error) {
      alert("Nätverksfel - försök igen senare");
    }
  };

  return (
    <div className={styles.page}>
      {/* Hero Section with Image */}
      <div className={styles.heroSection}>
        <div className={styles.heroImage}>
          <img 
            src="https://images.unsplash.com/photo-1571902943202-507ec2618e8f?q=80&w=2070" 
            alt="Gym membership"
            className={styles.heroBg}
          />
          <div className={styles.heroOverlay}></div>
        </div>
        <div className="container">
          <div className={styles.heroContent}>
            <h1 className={styles.heroTitle}>Välj ditt medlemskap</h1>
            <p className={styles.heroSubtitle}>
              Alla medlemskap inkluderar tillgång till gym, digitalt medlemskort och vår
              medlemsapp. Välj den nivå som passar dig bäst.
            </p>
          </div>
        </div>
      </div>

      <div className="container">
        <div className={styles.content}>

        {/* Pricing cards */}
        <div className={styles.pricingGrid}>
          {regularMemberships.map((membership) => (
            <PricingCard 
              key={membership.id} 
              membership={membership}
              onSelect={(campaignId) => handleMembershipSelect(membership, campaignId)}
            />
          ))}
        </div>

        {/* Dagpass section */}
        {dagpass && (
          <div className={styles.dagpassSection} id="dagpass">
            <h2 className={styles.sectionTitle}>Eller prova oss först</h2>
            <div className={styles.dagpassCard}>
              <PricingCard 
                membership={dagpass}
                onSelect={(campaignId) => handleMembershipSelect(dagpass, campaignId)}
              />
            </div>
          </div>
        )}

        {/* Comparison table */}
        <div className={styles.comparison}>
          <h2 className={styles.sectionTitle}>Jämför medlemskap</h2>
          
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th className={styles.tableHeaderFirst}>Funktion</th>
                  <th className={styles.tableHeader}>Base</th>
                  <th className={styles.tableHeader}>Flex</th>
                  <th className={styles.tableHeader}>Studio+</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className={styles.tableCell}>Pris/månad</td>
                  <td className={styles.tableCell}>399 kr</td>
                  <td className={styles.tableCell}>599 kr</td>
                  <td className={styles.tableCell}>899 kr</td>
                </tr>
                <tr>
                  <td className={styles.tableCell}>Öppettider</td>
                  <td className={styles.tableCell}>Off-peak (06-16, helger)</td>
                  <td className={styles.tableCell}>Alla tider</td>
                  <td className={styles.tableCell}>Alla tider</td>
                </tr>
                <tr>
                  <td className={styles.tableCell}>Klasser</td>
                  <td className={styles.tableCell}>Utvalda</td>
                  <td className={styles.tableCell}>Alla</td>
                  <td className={styles.tableCell}>Alla + signatur</td>
                </tr>
                <tr>
                  <td className={styles.tableCell}>Bokningsfönster</td>
                  <td className={styles.tableCell}>5 dagar</td>
                  <td className={styles.tableCell}>7 dagar</td>
                  <td className={styles.tableCell}>9 dagar</td>
                </tr>
                <tr>
                  <td className={styles.tableCell}>Gästpass/månad</td>
                  <td className={styles.tableCell}>—</td>
                  <td className={styles.tableCell}>1</td>
                  <td className={styles.tableCell}>2</td>
                </tr>
                <tr>
                  <td className={styles.tableCell}>Recovery-zon</td>
                  <td className={styles.tableCell}>—</td>
                  <td className={styles.tableCell}>—</td>
                  <td className={styles.tableCell}>✓</td>
                </tr>
                <tr>
                  <td className={styles.tableCell}>PT-kredit</td>
                  <td className={styles.tableCell}>—</td>
                  <td className={styles.tableCell}>—</td>
                  <td className={styles.tableCell}>1 session/mån</td>
                </tr>
                <tr>
                  <td className={styles.tableCell}>Träningsuppdrag</td>
                  <td className={styles.tableCell}>—</td>
                  <td className={styles.tableCell}>—</td>
                  <td className={styles.tableCell}>✓</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Policy box */}
        <div className={styles.policyBox}>
          <h3 className={styles.policyTitle}>Bokningspolicy</h3>
          <p className={styles.policyText}>
            <strong>Bokningsfönster:</strong> Base 5 dagar • Flex 7 dagar • Studio+ 9 dagar
            <br />
            <strong>Avbokning:</strong> Senast 2 timmar före start
            <br />
            <strong>Kö:</strong> Hamnar du i kö får du pushnotis om du får plats
            <br />
            <strong>Bindningstid:</strong> Ingen – du kan säga upp när som helst
          </p>
        </div>
        </div>
      </div>
    </div>
  );
}

