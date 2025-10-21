"use client";

import React from "react";
import Button from "@/components/ui/Button";
import { analytics } from "@/lib/analytics";

export default function AppDownloadButton() {
  const handleAppDownloadClick = () => {
    analytics.trackCTAClick('app_download', 'Ladda ner appen', 'app_teaser');
  };

  return (
    <Button 
      size="lg"
      onClick={handleAppDownloadClick}
      analyticsEvent="app_download"
      analyticsData={{ location: 'app_teaser' }}
    >
      Ladda ner appen
    </Button>
  );
}
