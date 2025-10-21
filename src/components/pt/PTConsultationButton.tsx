"use client";

import React from "react";
import Button from "@/components/ui/Button";
import { analytics } from "@/lib/analytics";

export default function PTConsultationButton() {
  const handleConsultationClick = () => {
    // Track consultation booking attempt
    analytics.trackCTAClick('pt_consultation', 'Boka kostnadsfri konsultation', 'pt_cta');
    analytics.trackMembershipAction('consultation_request', 'pt');
    
    // TODO: Implement actual consultation booking logic
    console.log('PT consultation clicked');
  };

  return (
    <Button 
      size="lg"
      onClick={handleConsultationClick}
      analyticsEvent="pt_consultation"
      analyticsData={{ 
        location: 'pt_cta',
        type: 'free_consultation'
      }}
    >
      Boka kostnadsfri konsultation
    </Button>
  );
}
