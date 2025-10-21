"use client";

import React from "react";
import Link from "next/link";
import Button from "@/components/ui/Button";
import { analytics } from "@/lib/analytics";

export default function UpgradeButton() {
  const handleUpgradeClick = () => {
    analytics.trackCTAClick('upgrade', 'Uppgradera till Studio+', 'training_quests');
  };

  return (
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
  );
}
