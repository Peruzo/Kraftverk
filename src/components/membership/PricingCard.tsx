import React from "react";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import type { Membership } from "@/types";
import styles from "./PricingCard.module.css";

type PricingCardProps = {
  membership: Membership;
  onSelect?: () => void;
};

export default function PricingCard({ membership, onSelect }: PricingCardProps) {
  return (
    <div className={`${styles.card} ${membership.popular ? styles.popular : ""}`}>
      {membership.popular && (
        <div className={styles.popularBadge}>
          <Badge variant="success">Mest valt</Badge>
        </div>
      )}

      <div className={styles.header}>
        <h3 className={styles.name}>{membership.name}</h3>
        <div className={styles.price}>
          <span className={styles.amount}>{membership.price}</span>
          <span className={styles.currency}>kr/mån</span>
        </div>
        <p className={styles.description}>{membership.description}</p>
      </div>

      <ul className={styles.features}>
        {membership.features.map((feature, index) => (
          <li key={index} className={styles.feature}>
            {feature}
          </li>
        ))}
      </ul>

      <div className={styles.action}>
        <Button
          fullWidth
          variant={membership.popular ? "primary" : "secondary"}
          onClick={onSelect}
        >
          {membership.id === "dagpass" ? "Köp dagpass" : "Välj plan"}
        </Button>
      </div>
    </div>
  );
}






