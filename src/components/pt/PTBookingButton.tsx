"use client";

import React from "react";
import Button from "@/components/ui/Button";
import { analytics } from "@/lib/analytics";

interface PTBookingButtonProps {
  pkg: {
    id: string;
    name: string;
    sessions: number;
    price: number;
    description: string;
    popular?: boolean;
  };
}

export default function PTBookingButton({ pkg }: PTBookingButtonProps) {
  const handleBookingClick = () => {
    // Track PT booking attempt
    analytics.trackCTAClick('pt_booking', `Boka ${pkg.name}`, 'pt_packages');
    analytics.trackMembershipAction('pt_booking_attempt', pkg.id);
    
    // TODO: Implement actual booking logic
    console.log('PT booking clicked:', pkg.name);
  };

  return (
    <Button 
      fullWidth 
      variant={pkg.popular ? "primary" : "secondary"}
      onClick={handleBookingClick}
      analyticsEvent="pt_booking"
      analyticsData={{ 
        packageName: pkg.name,
        packageId: pkg.id,
        sessions: pkg.sessions,
        price: pkg.price,
        location: 'pt_packages'
      }}
    >
      Boka {pkg.name}
    </Button>
  );
}
