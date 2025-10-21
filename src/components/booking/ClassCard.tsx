"use client";

import React from "react";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { analytics } from "@/lib/analytics";
import type { ClassInstance } from "@/types";
import styles from "./ClassCard.module.css";

type ClassCardProps = {
  classInstance: ClassInstance;
  onBook: () => void;
  loading?: boolean;
};

export default function ClassCard({ classInstance, onBook, loading = false }: ClassCardProps) {
  const { template, trainer, startTime, spots, bookedSpots = 0 } = classInstance;
  const spotsLeft = spots - bookedSpots;
  const isFull = spotsLeft <= 0;

  const handleBookingClick = () => {
    analytics.trackClassBooking(
      template?.title || 'Unknown Class',
      trainer?.name || 'Unknown Instructor',
      formatTime(startTime)
    );
    onBook();
  };

  const getIntensityZone = (intensity: string) => {
    switch (intensity) {
      case "Låg":
        return "grey";
      case "Medel":
        return "green";
      case "Hög":
        return "red";
      default:
        return "blue";
    }
  };

  const formatTime = (time: string) => {
    const date = new Date(time);
    return date.toLocaleTimeString("sv-SE", { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <Card padding="md">
      <div className={styles.card}>
        {template?.image && (
          <div className={styles.imageWrapper}>
            <img src={template.image} alt={template.title} className={styles.image} />
            <div className={styles.imageOverlay}></div>
          </div>
        )}
        <div className={styles.header}>
          <div>
            <h3 className={styles.title}>{template?.title}</h3>
            <p className={styles.trainer}>{trainer?.name}</p>
          </div>
          {template?.intensity && (
            <Badge zone={getIntensityZone(template.intensity)}>
              {template.intensity}
            </Badge>
          )}
        </div>

        <div className={styles.meta}>
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>Kategori</span>
            <span className={styles.metaValue}>{template?.category}</span>
          </div>
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>Tid</span>
            <span className={styles.metaValue}>{formatTime(startTime)}</span>
          </div>
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>Längd</span>
            <span className={styles.metaValue}>{template?.duration} min</span>
          </div>
        </div>

        {template?.zoneProfile && (
          <div className={styles.zones}>
            <div className={styles.zonesLabel}>Pulszoner:</div>
            <div className={styles.zonesBar}>
              {Object.entries(template.zoneProfile).map(([zone, minutes]) => {
                const percentage = (minutes / 60) * 100;
                return (
                  <div
                    key={zone}
                    className={styles.zoneSegment}
                    style={{
                      width: `${percentage}%`,
                      background: `var(--zone-${zone})`,
                    }}
                    title={`${zone}: ${minutes} min`}
                  />
                );
              })}
            </div>
          </div>
        )}

        <div className={styles.footer}>
          <div className={styles.spots}>
            {isFull ? (
              <Badge variant="error">Fullt</Badge>
            ) : spotsLeft <= 3 ? (
              <Badge variant="warning">{spotsLeft} platser kvar</Badge>
            ) : (
              <span className={styles.spotsText}>{spotsLeft} platser kvar</span>
            )}
          </div>
          <Button 
            size="sm" 
            onClick={handleBookingClick} 
            disabled={isFull || loading}
            analyticsEvent="class_booking"
            analyticsData={{ 
              className: template?.title,
              instructor: trainer?.name,
              intensity: template?.intensity,
              category: template?.category
            }}
          >
            {loading ? "Bearbetar..." : (isFull ? "Ställ i kö" : "Boka")}
          </Button>
        </div>
      </div>
    </Card>
  );
}

