import { NextResponse } from 'next/server';
import db from '@/app/Database/Supabase/Base1';
import IsAuth from '@/app/Auth/IsAuth/IsAuth';
import { v4 as uuidv4 } from 'uuid';

interface AuthUser {
  user_id: string;
  email: string;
  name: string;
}

export async function POST(request: Request) {
  try {
    const user = await IsAuth(true) as AuthUser;
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { targetUserId } = await request.json();

    if (!targetUserId) {
      return NextResponse.json({ error: 'Target user ID is required' }, { status: 400 });
    }

    // Check if target user exists
    const { data: targetUser, error: targetError } = await db
      .from('users')
      .select('user_id')
      .eq('user_id', targetUserId)
      .single();

    if (targetError || !targetUser) {
      return NextResponse.json({ error: 'Target user not found' }, { status: 404 });
    }

    // Check if user is trying to follow themselves
    if (user.user_id === targetUserId) {
      return NextResponse.json({ error: 'Cannot follow yourself' }, { status: 400 });
    }

    // Check if already following
    const { data: existingFollow, error: followError } = await db
      .from('users_followers')
      .select('*')
      .eq('follower_id', user.user_id)
      .eq('followed_id', targetUserId)
      .single();

    if (followError && followError.code !== 'PGRST116') {
      throw followError;
    }

    let isFollowing = false;

    if (existingFollow) {
      // Unfollow
      const { error: deleteError } = await db
        .from('users_followers')
        .delete()
        .eq('follower_id', user.user_id)
        .eq('followed_id', targetUserId);

      if (deleteError) {
        throw deleteError;
      }
    } else {
      // Follow
      const { error: insertError } = await db
        .from('users_followers')
        .insert({
          id: uuidv4(),
          follower_id: user.user_id,
          followed_id: targetUserId,
          created_at: new Date().toISOString()
        });

      if (insertError) {
        throw insertError;
      }
      isFollowing = true;
    }

    return NextResponse.json({
      success: true,
      isFollowing,
      message: isFollowing ? 'Successfully followed user' : 'Successfully unfollowed user'
    });

  } catch (error) {
    console.error('Follow/unfollow error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 