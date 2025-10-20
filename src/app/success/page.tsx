"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

function SuccessPageContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [loading, setLoading] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState<"success" | "error" | "loading">("loading");

  useEffect(() => {
    const verifyPayment = async () => {
      if (!sessionId) {
        setPaymentStatus("error");
        setLoading(false);
        return;
      }

      try {
        // For demo purposes, we'll consider any session ID as successful
        // In production, you would verify the payment with Stripe API
        setPaymentStatus("success");
      } catch (error) {
        console.error("Payment verification failed:", error);
        setPaymentStatus("error");
      } finally {
        setLoading(false);
      }
    };

    verifyPayment();
  }, [sessionId]);

  if (loading) {
    return (
      <div className="container">
        <div style={{ textAlign: "center", padding: "2rem" }}>
          <p>Verifierar betalning...</p>
        </div>
      </div>
    );
  }

  if (paymentStatus === "error") {
    return (
      <div className="container">
        <div style={{ textAlign: "center", padding: "2rem" }}>
          <h1>❌ Betalning misslyckades</h1>
          <p>Någonting gick fel med din betalning.</p>
          <div style={{ marginTop: "2rem" }}>
            <Link href="/" style={{ marginRight: "1rem" }}>Tillbaka till startsidan</Link>
            <Link href="/medlemskap">Försök igen</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div style={{ textAlign: "center", padding: "2rem" }}>
        <h1>✅ Betalning lyckades!</h1>
        <p>Tack för din betalning. Du kommer att få en bekräftelse via email inom kort.</p>
        <div style={{ marginTop: "2rem" }}>
          <Link href="/" style={{ marginRight: "1rem" }}>Tillbaka till startsidan</Link>
          <Link href="/min-sida">Till min sida</Link>
        </div>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="container">
        <div style={{ textAlign: "center", padding: "2rem" }}>
          <p>Laddar...</p>
        </div>
      </div>
    }>
      <SuccessPageContent />
    </Suspense>
  );
}
