"use client";

import React, { useState } from "react";
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
  const [loading, setLoading] = useState(false);

  const handleBookingClick = async () => {
    setLoading(true);
    
    try {
      // Track PT booking attempt
      analytics.trackCTAClick('pt_booking', `Boka ${pkg.name}`, 'pt_packages');
      analytics.trackMembershipAction('pt_booking_attempt', pkg.id);
      
      // Get customer data
      const customerEmail = prompt("Ange din e-postadress för att fortsätta:");
      if (!customerEmail) {
        alert("E-postadress krävs för att fortsätta.");
        setLoading(false);
        return;
      }
      
      const customerName = prompt("Ange ditt namn (valfritt):") || undefined;

      // Create checkout session
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId: `pt-${pkg.id}`, // Use PT package as product
          userId: "demo-user",
          customerEmail: customerEmail,
          customerName: customerName,
        }),
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url; // Redirect to Stripe
      } else {
        alert(`Betalningsfel: ${data.error}`);
      }
    } catch (error) {
      console.error("PT booking error:", error);
      alert("Nätverksfel - försök igen senare");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button 
      fullWidth 
      variant={pkg.popular ? "primary" : "secondary"}
      onClick={handleBookingClick}
      disabled={loading}
      analyticsEvent="pt_booking"
      analyticsData={{ 
        packageName: pkg.name,
        packageId: pkg.id,
        sessions: pkg.sessions,
        price: pkg.price,
        location: 'pt_packages'
      }}
    >
      {loading ? "Bearbetar..." : `Boka ${pkg.name}`}
    </Button>
  );
}
