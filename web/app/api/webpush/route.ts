import { NextResponse } from 'next/server';
// import webpush from 'web-push';

export async function GET() {
  try {
    // const vapidKeys = webpush.generateVAPIDKeys();
    // return NextResponse.json({ vapidKeys });
    return NextResponse.json({
        message: 'Hello World'
    }, { status: 200 })
  } catch (error) {
    console.error('Error generating VAPID keys:', error);
    return NextResponse.json({ error: 'Failed to generate VAPID keys' }, { status: 500 });
  }
} 