"use client";

import React from "react";
import Link from "next/link";
import Button from "@/components/ui/Button";
import { analytics } from "@/lib/analytics";

export default function ProductsButton() {
  const handleProductsClick = () => {
    analytics.trackCTAClick('view_products', 'Se våra produkter', 'membership_section');
  };

  return (
    <Link href="/produkter">
      <Button 
        variant="secondary"
        onClick={handleProductsClick}
        analyticsEvent="view_products"
        analyticsData={{ 
          location: 'membership_section',
          action: 'navigate_to_products'
        }}
      >
        Se våra produkter
      </Button>
    </Link>
  );
}
