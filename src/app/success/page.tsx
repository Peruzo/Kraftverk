"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { analytics } from "@/lib/analytics";

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
        // Get real payment data from server-side API
        const response = await fetch(`/api/verify-payment?session_id=${sessionId}`);
        const paymentData = await response.json();
        
        if (!response.ok) {
          throw new Error(paymentData.error || 'Payment verification failed');
        }
        
        // Extract payment data
        const {
          amount,
          currency,
          customerEmail,
          customerName,
          cardBrand,
          cardLast4,
          cardExpMonth,
          cardExpYear,
          productType,
          productName,
          priceId,
          productId,
          quantity,
          inventoryAction,
          userId,
          paymentMethod,
          customerId,
          timestamp
        } = paymentData;
        
        // For demo purposes, we'll consider any session ID as successful
        // In production, you would verify the payment with Stripe API
        setPaymentStatus("success");
        
        // Track successful payment completion with real data
        analytics.trackCheckout('completed', amount / 100, currency); // Convert cents to currency units
        analytics.trackMembershipAction('payment_completed', productType);
        
        // Send correct customer data to portal
        const paymentData = {
          sessionId,
          amount, // Real amount in cents
          currency,
          status: 'completed',
          customerEmail, // Real customer email
          customerName, // Real customer name
          cardBrand,
          cardLast4,
          cardExpMonth,
          cardExpYear,
          productType, // Real product type
          productName, // Real product name
          priceId,
          productId,
          quantity,
          inventoryAction,
          userId,
          paymentMethod,
          customerId,
          timestamp
        };

        console.log('🚀 Sending payment data to analytics:', paymentData);
        
        // Send via analytics service
        analytics.sendCustomEvent('customer_payment', paymentData);
        
        // Direct fallback to ensure data reaches your endpoint
        try {
          const directResponse = await fetch('https://source-database.onrender.com/api/analytics/track', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              event: 'customer_payment',
              data: paymentData,
              domain: 'kraftverk.com',
              tenant: 'kraftverk'
            }),
          });
          
          if (directResponse.ok) {
            const result = await directResponse.json();
            console.log('✅ Direct payment data sent successfully:', result);
          } else {
            console.error('❌ Direct payment data failed:', directResponse.status);
          }
        } catch (directError) {
          console.error('❌ Direct payment data error:', directError);
        }
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
