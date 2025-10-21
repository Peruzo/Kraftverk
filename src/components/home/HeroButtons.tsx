"use client";

import React from "react";
import Link from "next/link";
import Button from "@/components/ui/Button";
import { analytics } from "@/lib/analytics";

export default function HeroButtons() {
  const handleMembershipClick = () => {
    analytics.trackCTAClick('membership', 'Bli medlem', 'hero');
  };

  const handleDayPassClick = () => {
    analytics.trackCTAClick('day_pass', 'Prova dagpass', 'hero');
  };

  return (
    <div className="hero-cta">
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
  );
}
