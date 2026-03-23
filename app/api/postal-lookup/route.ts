import { NextRequest, NextResponse } from "next/server";
import { lookupPostalCode } from "@/lib/postalLookup";

export async function GET(req: NextRequest) {
  const postalCode = req.nextUrl.searchParams.get("postalCode");
  const subtotal = parseFloat(req.nextUrl.searchParams.get("subtotal") || "0");

  if (!postalCode) {
    return NextResponse.json({ error: "Postal code required" }, { status: 400 });
  }

  const result = lookupPostalCode(postalCode, subtotal);
  return NextResponse.json(result);
}
