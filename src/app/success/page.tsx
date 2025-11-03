"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { analytics } from "@/lib/enhanced-analytics";

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
        const apiResponse = await response.json();
        
        if (!response.ok) {
          throw new Error(apiResponse.error || 'Payment verification failed');
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
          paymentIntentId,
          timestamp
        } = apiResponse;
        
        // For demo purposes, we'll consider any session ID as successful
        // In production, you would verify the payment with Stripe API
        setPaymentStatus("success");
        
        // Track purchase event (match TRAFIKKALLOR guide format)
        // CRITICAL: value and revenue must be in öre (not SEK)
        const valueInOre = amount; // amount is already in cents/öre
        const revenueInOre = amount; // Total revenue
        
        analytics.trackPurchase(
          paymentIntentId || sessionId, // transactionId
          valueInOre, // CRITICAL: value in öre (not SEK)
          currency,
          [{
            item_id: productId || 'unknown',
            item_name: productName || 'Unknown Product',
            category: productType || 'unknown',
            quantity: quantity || 1,
            price: amount / 100, // Price per item in SEK (for display)
          }],
          revenueInOre // CRITICAL: revenue in öre
        );
        
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
          paymentIntentId,
          timestamp
        };

        console.log('🚀 Sending payment data to analytics:', paymentData);
        
        // Check if analytics already sent for this session (prevent duplicates)
        const analyticsKey = `analytics_sent_${sessionId}`;
        const alreadySent = localStorage.getItem(analyticsKey);
        
        if (!alreadySent) {
          console.log('📤 Sending payment data to customer portal webhook for session:', sessionId);
          
          // Send payment data to customer portal webhook in the correct format
          const portalPayload = {
            tenant: "kraftverk",
            customerEmail: paymentData.customerEmail,
            customerName: paymentData.customerName,
            sessionId: paymentData.sessionId,
            amount: Math.round(paymentData.amount / 100), // Convert cents to SEK
            currency: paymentData.currency,
            productType: paymentData.productType,
            productName: paymentData.productName,
            priceId: paymentData.priceId,
            productId: paymentData.productId,
            quantity: paymentData.quantity,
            inventoryAction: paymentData.inventoryAction,
            userId: paymentData.userId,
            paymentMethod: paymentData.paymentMethod,
            status: "completed",
            timestamp: paymentData.timestamp,
            paymentIntentId: paymentData.paymentIntentId || "",
            customerId: paymentData.customerId
          };

          try {
            const portalResponse = await fetch('https://source-database.onrender.com/webhooks/kraftverk-customer-data', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(portalPayload)
            });
            
            if (portalResponse.ok) {
              const result = await portalResponse.json();
              console.log('✅ Payment data sent to customer portal webhook successfully:', result);
            } else {
              const errorText = await portalResponse.text();
              console.error('❌ Failed to send payment data to customer portal webhook:', portalResponse.status, errorText);
            }
          } catch (error) {
            console.error('❌ Error sending payment data to customer portal webhook:', error);
          }
          
          // Also send via analytics service for internal tracking
          analytics.sendCustomEvent('customer_payment', paymentData);
          
          // Mark as sent to prevent duplicates
          localStorage.setItem(analyticsKey, 'true');
          console.log('✅ Payment data sent and marked as sent for session:', sessionId);
        } else {
          console.log('⚠️ Payment data already sent for session:', sessionId, '- skipping duplicate');
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
