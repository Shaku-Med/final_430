import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import IsAuth from "@/app/Auth/IsAuth/IsAuth";
import VerifyHeaders from "@/app/Auth/IsAuth/SetToken";
import { getClientIP } from "@/app/Auth/IsAuth/SetToken";
import db from "@/app/Database/Supabase/Base1";

export async function GET(request: Request) {
  try {
    // Verify user authentication
    const user = await IsAuth(true);
    if (!user || typeof user === 'boolean' || !('user_id' in user)) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Get headers and verify them
    const h = await headers();
    const au = h.get('user-agent')?.split(/\s+/).join('');
    const clientIP = await getClientIP(h);
    const header_v = await VerifyHeaders();

    // Set up verification keys
    const ky: string[] = [`${au}`, `${clientIP}`];
    let k: string[] = [`${process.env.PASS1}`, `${process.env.TOKEN2}`];

    // Verify headers
    if (!header_v) {
      return NextResponse.json({ 
        success: false,
        error: 'Unauthorized',
        message: 'Invalid request headers'
      }, { status: 401 });
    }

    // Get search query from URL
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    if (!query) {
      return NextResponse.json({
        success: false,
        error: 'Missing query parameter',
        message: 'Search query is required'
      }, { status: 400 });
    }

    // Search in blog posts
    const { data: posts, error: searchError, count } = await db
      .from('blog')
      .select('id, title, excerpt, user_id, date, imageUrl, likes, comments, shares, created_at', { count: 'exact' })
      .or(`title.ilike.%${query}%,excerpt.ilike.%${query}%,information.ilike.%${query}%`)
      .order('date', { ascending: false })
      .range(offset, offset + limit - 1);

    if (searchError) {
      console.error('Error searching blogs:', searchError);
      return NextResponse.json({
        success: false,
        error: 'Database error',
        message: 'Failed to search blog posts'
      }, { status: 500 });
    }

    if (posts && posts.length > 0) {
      // Get user information separately
      const userIds = [...new Set(posts.map(post => post.user_id))];
      const { data: users, error: userError } = await db
        .from('users')
        .select('id, firstname, lastname, name, profile, user_id')
        .in('user_id', userIds);

      if (userError) {
        console.error('Error fetching users:', userError);
        return NextResponse.json({
          success: false,
          error: 'Database error',
          message: 'Failed to fetch user information'
        }, { status: 500 });
      }

      // Map users to posts
      const userMap = users?.reduce((acc, user) => {
        acc[user.user_id] = user;
        return acc;
      }, {} as Record<string, any>) || {};

      const postsWithUsers = posts.map(post => ({
        ...post,
        users: userMap[post.user_id] || null
      }));

      return NextResponse.json({
        success: true,
        data: postsWithUsers,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil((count || 0) / limit),
          totalItems: count || 0,
          itemsPerPage: limit
        }
      }, { status: 200 });
    }

    return NextResponse.json({
      success: true,
      data: [],
      pagination: {
        currentPage: page,
        totalPages: 0,
        totalItems: 0,
        itemsPerPage: limit
      }
    }, { status: 200 });

  } catch (error) {
    console.error('Error in blog search:', error);
    return NextResponse.json({
      success: false,
      error: 'Server error',
      message: 'An unexpected error occurred'
    }, { status: 500 });
  }
} 