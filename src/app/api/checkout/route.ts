import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { membershipId, userId } = body;

    if (!membershipId) {
      return NextResponse.json({ error: "membershipId required" }, { status: 400 });
    }

    // Mock checkout - i produktion skulle detta integrera med Stripe
    const mockOrder = {
      id: `order-${Date.now()}`,
      membershipId,
      userId,
      status: "completed",
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json({ order: mockOrder, success: true }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}






