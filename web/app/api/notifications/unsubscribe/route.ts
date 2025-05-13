import { NextResponse } from 'next/server';
import IsAuth from '@/app/Auth/IsAuth/IsAuth';
import db from '@/app/Database/Supabase/Base1';

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

    // Remove the subscription from the database
    const { error: dbError } = await db
      .from('push_subscriptions')
      .delete()
      .match({
        user_id: userData.user_id,
        endpoint: subscription.endpoint
      });

    if (dbError) {
      console.error('Error removing subscription:', dbError);
      return NextResponse.json(
        { error: 'Failed to remove subscription' },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: 'Unsubscription successful' });
  } catch (error) {
    console.error('Error handling unsubscription:', error);
    return NextResponse.json(
      { error: 'Failed to process unsubscription' },
      { status: 500 }
    );
  }
} 