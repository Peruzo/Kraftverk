"use client";

import React from "react";
import Link from "next/link";
import Button from "@/components/ui/Button";
import { analytics } from "@/lib/analytics";

export default function StudioPlusButton() {
  const handleStudioPlusClick = () => {
    analytics.trackCTAClick('studio_plus', 'Läs mer om Studio+', 'recovery');
  };

  return (
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
  );
}
