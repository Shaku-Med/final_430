import { NextResponse } from 'next/server';
// import webpush from 'web-push';
import IsAuth from '@/app/Auth/IsAuth/IsAuth';
import db from '@/app/Database/Supabase/Base1';
import { v4 as uuidv4 } from 'uuid';

// Configure web-push with your VAPID keys
// webpush.setVapidDetails(
//   'mailto:jujubelt124@gmail.com',
//   process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
//   process.env.VAPID_PRIVATE_KEY!
// );

interface User {
  user_id: string;
  email: string;
  id: string;
  firstname: string;
  name: string;
  lastname: string;
  joinedAt: string;
}

export async function POST(req: Request) {
  try {
    // Verify user authentication
    const user = await IsAuth(true);
    if (!user || typeof user === 'boolean') {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const userData = user as User;
    const subscription = await req.json();

    // Validate the subscription
    if (!subscription || !subscription.endpoint) {
      return NextResponse.json(
        { error: 'Invalid subscription object' },
        { status: 400 }
      );
    }

    // Store the subscription in the database
    const { error: dbError } = await db
      .from('push_subscriptions')
      .upsert({
        id: uuidv4(),
        user_id: userData.user_id,
        endpoint: subscription.endpoint,
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

    if (dbError) {
      console.error('Error storing subscription:', dbError);
      return NextResponse.json(
        { error: 'Failed to store subscription' },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: 'Subscription successful' });
  } catch (error) {
    console.error('Error handling subscription:', error);
    return NextResponse.json(
      { error: 'Failed to process subscription' },
      { status: 500 }
    );
  }
} 