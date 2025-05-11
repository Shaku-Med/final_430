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

    const { targetUserId, reason } = await request.json();

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

    // Check if user is trying to block themselves
    if (user.user_id === targetUserId) {
      return NextResponse.json({ error: 'Cannot block yourself' }, { status: 400 });
    }

    // Check if already blocked
    const { data: existingBlock, error: blockError } = await db
      .from('user_blocked')
      .select('*')
      .eq('blocker_id', user.user_id)
      .eq('blocked_id', targetUserId)
      .single();

    if (blockError && blockError.code !== 'PGRST116') {
      throw blockError;
    }

    let isBlocked = false;

    if (existingBlock) {
      // Unblock
      const { error: deleteError } = await db
        .from('user_blocked')
        .delete()
        .eq('blocker_id', user.user_id)
        .eq('blocked_id', targetUserId);

      if (deleteError) {
        throw deleteError;
      }
    } else {
      // Block
      const { error: insertError } = await db
        .from('user_blocked')
        .insert({
          id: uuidv4(),
          blocker_id: user.user_id,
          blocked_id: targetUserId,
          reason: reason || null,
          created_at: new Date().toISOString()
        });

      if (insertError) {
        throw insertError;
      }
      isBlocked = true;

      // If user was following the blocked user, unfollow them
      const { error: unfollowError } = await db
        .from('users_followers')
        .delete()
        .eq('follower_id', user.user_id)
        .eq('followed_id', targetUserId);

      if (unfollowError) {
        console.error('Error unfollowing blocked user:', unfollowError);
      }
    }

    return NextResponse.json({
      success: true,
      isBlocked,
      message: isBlocked ? 'Successfully blocked user' : 'Successfully unblocked user'
    });

  } catch (error) {
    console.error('Block/unblock error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 