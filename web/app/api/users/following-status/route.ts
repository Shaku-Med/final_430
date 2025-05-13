import { NextResponse } from 'next/server';
import db from '@/app/Database/Supabase/Base1';
import IsAuth from '@/app/Auth/IsAuth/IsAuth';

export async function GET(request: Request) {
  try {
    const user = await IsAuth(true);
    if (!user || typeof user === 'boolean' || !('user_id' in user)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const targetUserId = searchParams.get('targetUserId');

    if (!targetUserId) {
      return NextResponse.json({ error: 'Target user ID is required' }, { status: 400 });
    }

    // Check if current user follows target user
    const { data: currentUserFollows, error: currentUserError } = await db
      .from('users_followers')
      .select('*')
      .eq('follower_id', user.user_id)
      .eq('followed_id', targetUserId)
      .single();

    if (currentUserError && currentUserError.code !== 'PGRST116') {
      throw currentUserError;
    }

    // Check if target user follows current user
    const { data: targetUserFollows, error: targetUserError } = await db
      .from('users_followers')
      .select('*')
      .eq('follower_id', targetUserId)
      .eq('followed_id', user.user_id)
      .single();

    if (targetUserError && targetUserError.code !== 'PGRST116') {
      throw targetUserError;
    }

    const isFollowingEachOther = currentUserFollows && targetUserFollows;

    return NextResponse.json({
      success: true,
      isFollowingEachOther,
      currentUserFollows: !!currentUserFollows,
      targetUserFollows: !!targetUserFollows
    });

  } catch (error) {
    console.error('Error checking following status:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 