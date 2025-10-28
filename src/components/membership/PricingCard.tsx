'use client';

import React, { useState, useEffect } from "react";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import type { Membership } from "@/types";
import { 
  fetchActiveCampaigns, 
  findApplicableCampaign, 
  calculateDiscountedPrice, 
  formatDiscount,
  type Campaign 
} from "@/lib/campaigns";
import { getCampaignPriceForProduct } from "@/lib/campaign-price-service";
import styles from "./PricingCard.module.css";

type PricingCardProps = {
  membership: Membership;
  onSelect?: (campaignId?: string) => void;
};

export default function PricingCard({ membership, onSelect }: PricingCardProps) {
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [discountedPrice, setDiscountedPrice] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadCampaignData() {
      try {
        // Prefer local store (persisted) check for campaign price
        const result = await getCampaignPriceForProduct('kraftverk', membership.id);
        if (result?.hasCampaignPrice && result.priceId) {
          // Fetch price from server-side API to compute amount in SEK
          const res = await fetch(`/api/price?id=${encodeURIComponent(result.priceId)}`, { cache: 'no-store' });
          if (res.ok) {
            const price = await res.json();
            if (typeof price.unit_amount === 'number') {
              const amountSek = Math.round(price.unit_amount / 100);
              setCampaign({
                id: result.campaignId || 'campaign',
                name: result.campaignName || 'Kampanj',
                type: 'discount',
                status: 'active',
                discountType: 'fixed',
                discountValue: Math.max(0, membership.price - amountSek),
                products: [membership.id],
                startDate: new Date().toISOString(),
                endDate: new Date(Date.now() + 365*24*60*60*1000).toISOString(),
                stripePriceId: result.priceId,
                originalProductId: membership.id,
                usageCount: 0,
              });
              setDiscountedPrice(amountSek);
            }
          }
          return;
        }

        // Fallback: query server active endpoint (hydrated) for freshest state
        const activeRes = await fetch('/api/campaigns/active', { cache: 'no-store' });
        const activeJson = activeRes.ok ? (await activeRes.json()) : { campaigns: [] };
        const campaigns = activeJson.campaigns?.length ? activeJson.campaigns : await fetchActiveCampaigns();
        const applicable = findApplicableCampaign(membership.id, campaigns);
        if (applicable) {
          setCampaign(applicable);
          setDiscountedPrice(calculateDiscountedPrice(membership.price, applicable));
        }
      } catch (error) {
        console.error('Failed to load campaign price:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadCampaignData();
  }, [membership.id, membership.price]);

  const handleSelect = () => {
    if (onSelect) {
      onSelect(campaign?.id);
    }
  };

  return (
    <div className={`${styles.card} ${membership.popular ? styles.popular : ""}`}>
      {membership.popular && (
        <div className={styles.popularBadge}>
          <Badge variant="success">Mest valt</Badge>
        </div>
      )}

      {campaign && !isLoading && (
        <div className={styles.campaignBadge}>
          <Badge variant="accent">{formatDiscount(campaign)}</Badge>
        </div>
      )}

      <div className={styles.header}>
        <h3 className={styles.name}>{membership.name}</h3>
        <div className={styles.price}>
          {campaign && discountedPrice ? (
            <>
              <span className={styles.originalPrice}>{membership.price}</span>
              <span className={styles.amount}>{Math.round(discountedPrice)}</span>
              <span className={styles.currency}>kr/mån</span>
            </>
          ) : (
            <>
              <span className={styles.amount}>{membership.price}</span>
              <span className={styles.currency}>kr/mån</span>
            </>
          )}
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
          onClick={handleSelect}
        >
          {membership.id === "dagpass" ? "Köp dagpass" : "Välj plan"}
        </Button>
      </div>
    </div>
  );
}






