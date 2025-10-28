import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    const stripeSecret = process.env.STRIPE_SECRET_KEY || "";
    if (!stripeSecret) {
      return NextResponse.json({ error: "Stripe not configured" }, { status: 500 });
    }

    const stripe = new Stripe(stripeSecret, { apiVersion: "2025-09-30.clover" });
    const price = await stripe.prices.retrieve(id);

    return NextResponse.json({
      id: price.id,
      currency: price.currency,
      unit_amount: price.unit_amount,
      recurring: price.recurring || null,
      nickname: price.nickname || null,
      product: price.product,
      type: price.type,
    });
  } catch (error) {
    console.error("price lookup error", error);
    return NextResponse.json({ error: "Price lookup failed" }, { status: 500 });
  }
}


