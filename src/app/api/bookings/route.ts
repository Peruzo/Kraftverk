import { NextRequest, NextResponse } from "next/server";

// Mock database - i produktion skulle detta använda Prisma
const mockBookings: any[] = [];

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ error: "userId required" }, { status: 400 });
  }

  const userBookings = mockBookings.filter((b) => b.userId === userId);
  return NextResponse.json(userBookings);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, classInstanceId } = body;

    if (!userId || !classInstanceId) {
      return NextResponse.json(
        { error: "userId and classInstanceId required" },
        { status: 400 }
      );
    }

    // Mock booking logic
    const booking = {
      id: `booking-${Date.now()}`,
      userId,
      classInstanceId,
      status: "confirmed",
      bookedAt: new Date().toISOString(),
    };

    mockBookings.push(booking);

    return NextResponse.json({ booking }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}





