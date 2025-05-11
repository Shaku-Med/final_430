import { NextResponse } from 'next/server';
import { cookies, headers } from 'next/headers';
import IsAuth from "@/app/Auth/IsAuth/IsAuth";
import VerifyHeaders from "@/app/Auth/IsAuth/SetToken";
import { getClientIP } from "@/app/Auth/IsAuth/SetToken";
import VerifyToken from "@/app/Auth/PageAuth/Action/VerifyToken";
import db from "@/app/Database/Supabase/Base1";
import { v4 as uuidv4 } from 'uuid';
import { decrypt } from '@/app/Auth/Lock/Enc';
import { SubmitMail } from '@/app/Functions/Mailing/Mail';
import BlogNotificationEmail from '@/app/Functions/Mailing/Components/BlogNotification';
import React from 'react';

interface AuthUser {
  user_id: string;
}

export async function POST(request: Request) {
  try {
    // Verify user authentication
    const user = await IsAuth(true);
    if (!user || typeof user === 'boolean' || !('user_id' in user)) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Get headers and cookies
    const h = await headers();
    const c = await cookies();
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

    // Get request body
    const body = await request.json();
    const {
      title,
      excerpt,
      information,
      slugs,
      imageUrl,
      created_at,
      date
    } = body;

    // Validate required fields
    if (!title || !excerpt || !information) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields',
        message: 'Title, excerpt, and content are required'
      }, { status: 400 });
    }

    // Handle imageUrl (thumbnail) if provided
    let processedImageUrl = null;
    if (imageUrl) {
      try {
        let parsedImage = imageUrl;
        if (parsedImage) {
          parsedImage = decrypt(parsedImage[0], `${process.env.FILE_TOKEN}`);
          processedImageUrl = parsedImage;
        }
      } catch (error) {
        console.error('Error decrypting imageUrl:', error);
      }
    }

    // Create blog post
    const { data: blog, error } = await db
      .from('blog')
      .insert({
        id: uuidv4().split('-').join(''),
        user_id: user.user_id,
        title,
        excerpt,
        information,
        slugs: slugs || [],
        imageUrl: processedImageUrl,
        created_at,
        date
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating blog:', error);
      return NextResponse.json({
        success: false,
        error: 'Database error',
        message: 'Failed to create blog post'
      }, { status: 500 });
    }

    // Get all active subscribers
    const { data: subscribers, error: subscriberError } = await db
      .from('subscribers')
      .select('email')
      .eq('status', 'active');

    if (subscriberError) {
      console.error('Error fetching subscribers:', subscriberError);
    } else if (subscribers && subscribers.length > 0) {
      // Send email to each subscriber
      const blogUrl = `http://localhost:3000/blog/${blog.id}`;
      
      for (const subscriber of subscribers) {
        try {
          await SubmitMail(
            subscriber.email,
            `New Blog Post: ${title}`,
            `A new blog post has been published: ${title}`,
            React.createElement(BlogNotificationEmail, {
              blogTitle: title,
              blogExcerpt: excerpt,
              blogUrl: blogUrl,
              companyName: 'CSI SPOTLIGHT',
              companyLogo: 'https://kpmedia.medzyamara.dev/icon-512.png'
            })
          );
        } catch (emailError) {
          console.error(`Error sending email to ${subscriber.email}:`, emailError);
          // Continue with other subscribers even if one fails
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Blog post created successfully',
      data: blog
    }, { status: 201 });

  } catch (error) {
    console.error('Error in blog creation:', error);
    return NextResponse.json({
      success: false,
      error: 'Server error',
      message: 'An unexpected error occurred'
    }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    // Verify user authentication
    const user = await IsAuth(true);
    if (!user || typeof user === 'boolean' || !('user_id' in user)) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Get the blog ID from search params
    const url = new URL(request.url);
    const blogId = url.searchParams.get('id');

    if (!blogId) {
      return NextResponse.json({
        success: false,
        error: 'Invalid request',
        message: 'Blog ID is required as a search parameter'
      }, { status: 400 });
    }

    // First verify if the blog exists and belongs to the user
    const { data: blog, error: blogError } = await db
      .from('blog')
      .select('id, user_id')
      .eq('id', blogId)
      .single();

    if (blogError || !blog) {
      return NextResponse.json({
        success: false,
        error: 'Not found',
        message: 'Blog not found'
      }, { status: 404 });
    }

    // Verify if the user owns the blog
    if (blog.user_id !== user.user_id) {
      return NextResponse.json({
        success: false,
        error: 'Unauthorized',
        message: 'You do not have permission to delete this blog'
      }, { status: 403 });
    }

    // First get all comment IDs for this blog
    const { data: comments, error: fetchCommentsError } = await db
      .from('blog_comments')
      .select('id')
      .eq('blog_id', blogId);

    if (fetchCommentsError) {
      console.error('Error fetching comments:', fetchCommentsError);
    }

    if (comments && comments.length > 0) {
      // Create an array of comment IDs
      const commentIds = comments.map(comment => comment.id);

      // Delete all replies to these comments
      const { error: repliesError } = await db
        .from('blog_comments')
        .delete()
        .in('parent_id', commentIds);

      if (repliesError) {
        console.error('Error deleting comment replies:', repliesError);
      }

      // Delete the main comments
      const { error: commentsError } = await db
        .from('blog_comments')
        .delete()
        .eq('blog_id', blogId);

      if (commentsError) {
        console.error('Error deleting comments:', commentsError);
      }
    }

    // Delete associated likes
    const { error: likesError } = await db
      .from('blog_likes')
      .delete()
      .eq('blog_id', blogId);

    if (likesError) {
      console.error('Error deleting likes:', likesError);
    }

    // Finally delete the blog
    const { error: deleteError } = await db
      .from('blog')
      .delete()
      .eq('id', blogId);

    if (deleteError) {
      console.error('Error deleting blog:', deleteError);
      return NextResponse.json({
        success: false,
        error: 'Database error',
        message: 'Failed to delete blog'
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Blog and associated data deleted successfully'
    }, { status: 200 });

  } catch (error) {
    console.error('Error in blog deletion:', error);
    return NextResponse.json({
      success: false,
      error: 'Server error',
      message: 'An unexpected error occurred'
    }, { status: 500 });
  }
} 