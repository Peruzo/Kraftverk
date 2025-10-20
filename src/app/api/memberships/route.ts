import { NextResponse } from "next/server";
import memberships from "@/data/memberships.json";

export async function GET() {
  return NextResponse.json(memberships);
}





