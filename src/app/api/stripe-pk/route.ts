import { NextResponse } from 'next/server';

export async function GET() {
  const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
  if (!key) {
    return NextResponse.json({ error: 'Publishable key not set' }, { status: 500 });
  }
  return NextResponse.json({ publishableKey: key });
}
