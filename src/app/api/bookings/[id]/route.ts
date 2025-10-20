import { NextRequest, NextResponse } from "next/server";

// Mock database
const mockBookings: any[] = [];

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const index = mockBookings.findIndex((b) => b.id === id);

  if (index === -1) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }

  // Mock 2-hour cancellation policy check
  const booking = mockBookings[index];
  const classTime = new Date(); // Skulle komma från classInstance i produktion
  const now = new Date();
  const hoursUntilClass = (classTime.getTime() - now.getTime()) / (1000 * 60 * 60);

  if (hoursUntilClass < 2) {
    return NextResponse.json(
      { error: "Avbokning måste ske minst 2 timmar före start" },
      { status: 400 }
    );
  }

  mockBookings.splice(index, 1);

  return NextResponse.json({ success: true });
}






