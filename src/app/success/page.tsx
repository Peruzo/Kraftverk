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
        // Get real payment data from Stripe session
        const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
        const session = await stripe.checkout.sessions.retrieve(sessionId);
        
        // Extract real customer and payment data
        const customerEmail = session.customer_email;
        const customerName = session.metadata?.customerName || '';
        const productType = session.metadata?.productType || '';
        const amount = session.amount_total; // Amount in cents
        const currency = session.currency;
        
        // For demo purposes, we'll consider any session ID as successful
        // In production, you would verify the payment with Stripe API
        setPaymentStatus("success");
        
        // Track successful payment completion with real data
        analytics.trackCheckout('completed', amount / 100, currency); // Convert cents to currency units
        analytics.trackMembershipAction('payment_completed', productType);
        const paymentIntent = session.payment_intent;
        
        // Get payment method details
        let cardBrand = '';
        let cardLast4 = '';
        let cardExpMonth = '';
        let cardExpYear = '';
        
        if (paymentIntent) {
          try {
            const paymentIntentDetails = await stripe.paymentIntents.retrieve(paymentIntent);
            const paymentMethod = paymentIntentDetails.payment_method;
            if (paymentMethod && typeof paymentMethod === 'string') {
              const pm = await stripe.paymentMethods.retrieve(paymentMethod);
              if (pm.card) {
                cardBrand = pm.card.brand || '';
                cardLast4 = pm.card.last4 || '';
                cardExpMonth = pm.card.exp_month?.toString() || '';
                cardExpYear = pm.card.exp_year?.toString() || '';
              }
            }
          } catch (error) {
            console.error('Error fetching payment method details:', error);
          }
        }
        
        // Map product type to display name
        const productNames: Record<string, string> = {
          'gym-shirt': 'Kraftverk Gym Shirt',
          'gym-hoodie': 'Kraftverk Gym Hoodie',
          'gym-bottle': 'Kraftverk Gym Bottle',
          'keychain': 'Kraftverk Keychain',
          'gym-bag': 'Kraftverk Gym Bag',
          'base': 'Base Medlemskap',
          'flex': 'Flex Medlemskap',
          'studio-plus': 'Studio+ Medlemskap',
          'dagpass': 'Dagpass',
        };
        
        const productName = productNames[productType] || productType;
        
        // Send correct customer data to portal
        analytics.sendCustomEvent('customer_payment', {
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
          priceId: session.metadata?.priceId || '',
          productId: productType,
          quantity: 1,
          inventoryAction: 'purchase',
          userId: session.metadata?.userId || '',
          paymentMethod: 'card',
          customerId: session.customer || '',
          timestamp: new Date().toISOString()
        });
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
