import { NextResponse } from "next/server";

/**
 * Demo/local order creation: ID and timestamp are assigned server-side.
 */
export async function POST() {
  const createdAt = new Date().toISOString();
  const orderId = `JQ-${Math.floor(10000 + Math.random() * 90000)}`;
  return NextResponse.json({ orderId, createdAt });
}
