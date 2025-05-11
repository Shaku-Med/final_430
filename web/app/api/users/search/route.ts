import { NextResponse } from 'next/server';
import db from '@/app/Database/Supabase/Base1';
import IsAuth from '@/app/Auth/IsAuth/IsAuth';

interface AuthUser {
  user_id: string;
  email: string;
  name: string;
}

interface UserBlock {
  blocked_id: string;
}

interface UserFollower {
  follower_id: string;
}

interface DatabaseUser {
  user_id: string;
  name: string;
  firstname: string;
  lastname: string;
  email: string;
  profile: string;
  user_info: {
    bio: string;
  } | null;
  users_followers: UserFollower[] | null;
  user_blocked: UserBlock[] | null;
}

interface TransformedUser {
  user_id: string;
  name: string;
  firstname: string;
  lastname: string;
  email: string;
  profile: string;
  bio: string;
  isFollowing: boolean;
  isBlocked: boolean;
}

export async function GET(request: Request) {
  try {
    const user = await IsAuth(true) as AuthUser;
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get search parameters from URL
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    // Search users by name or email with following and blocking information
    const { data: users, error, count } = await db
      .from('users')
      .select(`
        *,
        user_info (
          bio
        ),
        users_followers!followed_id (
          follower_id
        ),
        user_blocked!blocker_id (
          blocked_id
        )
      `, { count: 'exact' })
      .or(`name.ilike.%${query}%,email.ilike.%${query}%`)
      .neq('user_id', user.user_id) // Exclude current user from results
      .range(offset, offset + limit - 1)
      .order('name');

    if (error) {
      throw error;
    }

    // Transform the data to include following status and exclude blocked users
    const transformedUsers = (users as DatabaseUser[])
      .filter(user => !user.user_blocked?.some((block: UserBlock) => block.blocked_id === user.user_id))
      .map(user => ({
        user_id: user.user_id,
        name: user.name,
        firstname: user.firstname,
        lastname: user.lastname,
        email: user.email,
        profile: user.profile,
        bio: user.user_info?.bio || '',
        isFollowing: user.users_followers?.some((follower: UserFollower) => follower.follower_id === user.user_id) || false,
        isBlocked: user.user_blocked?.some((block: UserBlock) => block.blocked_id === user.user_id) || false
      }));

    return NextResponse.json({
      users: transformedUsers,
      total: count,
      page,
      limit,
      hasMore: count ? offset + limit < count : false
    });

  } catch (error) {
    console.error('User search error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 