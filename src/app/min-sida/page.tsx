"use client";

import React, { useEffect, useState } from "react";
import { useAuthStore } from "@/lib/store/auth";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import styles from "./page.module.css";

type MockBooking = {
  id: string;
  className: string;
  instructor: string;
  date: string;
  time: string;
  status: "confirmed" | "waitlist";
};

export default function MinSidaPage() {
  const { user, membership } = useAuthStore();
  const [upcomingBookings, setUpcomingBookings] = useState<MockBooking[]>([]);
  const [pastBookings, setPastBookings] = useState<MockBooking[]>([]);

  useEffect(() => {
    // Mock data för bokningar
    setUpcomingBookings([
      {
        id: "1",
        className: "Strength Foundation",
        instructor: "Emma Lindberg",
        date: "2024-10-15",
        time: "18:00",
        status: "confirmed",
      },
      {
        id: "2",
        className: "HIIT Blast",
        instructor: "David Strömberg",
        date: "2024-10-16",
        time: "07:00",
        status: "confirmed",
      },
      {
        id: "3",
        className: "Mobility Flow",
        instructor: "Alex Nguyen",
        date: "2024-10-17",
        time: "19:30",
        status: "waitlist",
      },
    ]);

    setPastBookings([
      {
        id: "4",
        className: "Power Conditioning",
        instructor: "Sara Bergström",
        date: "2024-10-10",
        time: "18:00",
        status: "confirmed",
      },
      {
        id: "5",
        className: "Strength Foundation",
        instructor: "Emma Lindberg",
        date: "2024-10-08",
        time: "18:00",
        status: "confirmed",
      },
    ]);
  }, []);

  const handleCancelBooking = (bookingId: string) => {
    setUpcomingBookings((prev) => prev.filter((b) => b.id !== bookingId));
    alert("Bokning avbokad!");
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("sv-SE", {
      weekday: "short",
      day: "numeric",
      month: "short",
    });
  };

  return (
    <div className="container">
      <div className={styles.page}>
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>Min sida</h1>
            <p className={styles.subtitle}>Välkommen tillbaka, {user?.name}!</p>
          </div>
        </div>

        {/* Membership status */}
        <section className={styles.section}>
          <Card variant="highlighted" padding="lg">
            <div className={styles.membershipCard}>
              <div className={styles.membershipInfo}>
                <h2 className={styles.membershipName}>{membership?.name} Medlemskap</h2>
                <p className={styles.membershipPrice}>{membership?.price} kr/månad</p>
              </div>
              <div className={styles.membershipFeatures}>
                <div className={styles.feature}>
                  <span className={styles.featureLabel}>Bokningsfönster</span>
                  <span className={styles.featureValue}>
                    {membership?.bookingWindowDays} dagar
                  </span>
                </div>
                <div className={styles.feature}>
                  <span className={styles.featureLabel}>Gästpass/månad</span>
                  <span className={styles.featureValue}>{membership?.guestAllowance || 0}</span>
                </div>
              </div>
            </div>
          </Card>
        </section>

        {/* KPI Cards - Placeholder för framtida funktionalitet */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Din progress</h2>
          <div className={styles.kpiGrid}>
            <Card padding="md">
              <div className={styles.kpi}>
                <div className={styles.kpiValue}>12</div>
                <div className={styles.kpiLabel}>Pass denna månad</div>
              </div>
            </Card>

            <Card padding="md">
              <div className={styles.kpi}>
                <div className={styles.kpiValue}>780</div>
                <div className={styles.kpiLabel}>Träningsminuter</div>
              </div>
            </Card>

            <Card padding="md">
              <div className={styles.kpi}>
                <div className={styles.kpiValue}>85%</div>
                <div className={styles.kpiLabel}>Kontinuitet (vecka)</div>
              </div>
            </Card>
          </div>
          <p className={styles.kpiNote}>
            Detaljerad puls- och zon-data kommer i Studio+ medlemskap
          </p>
        </section>

        {/* Upcoming bookings */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Kommande bokningar</h2>
          {upcomingBookings.length > 0 ? (
            <div className={styles.bookingsList}>
              {upcomingBookings.map((booking) => (
                <Card key={booking.id} padding="md">
                  <div className={styles.booking}>
                    <div className={styles.bookingHeader}>
                      <div>
                        <h3 className={styles.bookingClass}>{booking.className}</h3>
                        <p className={styles.bookingInstructor}>{booking.instructor}</p>
                      </div>
                      {booking.status === "waitlist" && (
                        <Badge variant="warning">Kö</Badge>
                      )}
                      {booking.status === "confirmed" && (
                        <Badge variant="success">Bokad</Badge>
                      )}
                    </div>
                    <div className={styles.bookingMeta}>
                      <span className={styles.bookingDate}>
                        {formatDate(booking.date)} • {booking.time}
                      </span>
                    </div>
                    <div className={styles.bookingActions}>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleCancelBooking(booking.id)}
                      >
                        Avboka
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className={styles.emptyState}>
              <p>Du har inga kommande bokningar</p>
              <Button onClick={() => (window.location.href = "/schema")}>
                Boka ett pass
              </Button>
            </div>
          )}
        </section>

        {/* Past bookings */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Tidigare bokningar</h2>
          {pastBookings.length > 0 ? (
            <div className={styles.bookingsList}>
              {pastBookings.map((booking) => (
                <Card key={booking.id} padding="md">
                  <div className={styles.booking}>
                    <div className={styles.bookingHeader}>
                      <div>
                        <h3 className={styles.bookingClass}>{booking.className}</h3>
                        <p className={styles.bookingInstructor}>{booking.instructor}</p>
                      </div>
                    </div>
                    <div className={styles.bookingMeta}>
                      <span className={styles.bookingDate}>
                        {formatDate(booking.date)} • {booking.time}
                      </span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <p className={styles.emptyState}>Ingen historik ännu</p>
          )}
        </section>
      </div>
    </div>
  );
}

