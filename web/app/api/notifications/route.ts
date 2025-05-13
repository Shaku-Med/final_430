import { NextResponse } from 'next/server';
import db from '@/app/Database/Supabase/Base1';
import IsAuth from '@/app/Auth/IsAuth/IsAuth';

interface User {
  user_id: string;
  email: string;
  id: string;
  firstname: string;
  name: string;
  lastname: string;
  joinedAt: string;
}

export async function GET(request: Request) {
  try {
    const user = await IsAuth(true);
    if (!user || typeof user === 'boolean') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    const userData = user as User;

    // Get total count
    const { count, error: countError } = await db
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userData.user_id);

    if (countError) {
      return NextResponse.json({ error: countError.message }, { status: 500 });
    }

    // Get paginated data
    const { data, error } = await db
      .from('notifications')
      .select('*')
      .eq('user_id', userData.user_id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      notifications: data,
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil((count || 0) / limit),
        hasMore: count ? offset + limit < count : false
      }
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await IsAuth(true);
    if (!user || typeof user === 'boolean') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userData = user as User;
    const { notificationId } = await request.json();

    const { error } = await db
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId)
      .eq('user_id', userData.user_id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 