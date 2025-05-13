import { NextResponse } from 'next/server'
import IsAuth from '@/app/Auth/IsAuth/IsAuth'
import db from '@/app/Database/Supabase/Base1'
import { v4 as uuidv4 } from 'uuid'
import { SubmitMail } from '@/app/Functions/Mailing/Mail'
import EventUpdateNotificationEmail from '@/app/Functions/Mailing/Components/EventUpdateNotification'
import React from 'react'

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const user = await IsAuth(true)
    if (!user || typeof user === 'boolean' || !('user_id' in user)) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    // Verify event exists
    const { data: event } = await db
      .from('events')
      .select('event_id')
      .eq('event_id', params.id)
      .single()

    if (!event) {
      return NextResponse.json({
        success: false,
        error: 'Not found',
        message: 'Event not found'
      }, { status: 404 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = (page - 1) * limit

    // Get comments with user information
    const { data: comments, error, count } = await db
      .from('event_comments')
      .select(`
        *,
        users!inner (
          id,
          firstname,
          lastname,
          name,
          profile
        )
      `, { count: 'exact' })
      .eq('event_id', params.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('Error fetching comments:', error)
      return NextResponse.json({
        success: false,
        error: 'Database error',
        message: 'Failed to fetch comments'
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      comments: comments.map(comment => ({
        ...comment,
        isOwner: comment.user_id === user.user_id,
        isLiked: false
      })),
      hasMore: count ? offset + limit < count : false
    })
  } catch (error) {
    console.error('Error in comment fetching:', error)
    return NextResponse.json({
      success: false,
      error: 'Server error',
      message: 'An unexpected error occurred'
    }, { status: 500 })
  }
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const user = await IsAuth(true)
    if (!user || typeof user === 'boolean' || !('user_id' in user)) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    // Verify event exists
    const { data: event } = await db
      .from('events')
      .select('event_id')
      .eq('event_id', params.id)
      .single()

    if (!event) {
      return NextResponse.json({
        success: false,
        error: 'Not found',
        message: 'Event not found'
      }, { status: 404 })
    }

    const body = await request.json()
    const { content, parent_id } = body

    if (!content) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields',
        message: 'Comment content is required'
      }, { status: 400 })
    }

    // If parent_id is provided, verify parent comment exists
    if (parent_id) {
      const { data: parentComment } = await db
        .from('event_comments')
        .select('id')
        .eq('id', parent_id)
        .single()

      if (!parentComment) {
        return NextResponse.json({
          success: false,
          error: 'Not found',
          message: 'Parent comment not found'
        }, { status: 404 })
      }
    }

    // Create comment
    const { data: comment, error } = await db
      .from('event_comments')
      .insert({
        id: uuidv4(),
        event_id: params.id,
        user_id: user.user_id,
        content,
        parent_id: parent_id || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select(`
        *,
        users!inner (
          id,
          firstname,
          lastname,
          name,
          profile
        )
      `)
      .single()

    if (error) {
      console.error('Error creating comment:', error)
      return NextResponse.json({
        success: false,
        error: 'Database error',
        message: 'Failed to create comment'
      }, { status: 500 })
    }

    // Get current comments count
    const { data: eventData } = await db
      .from('events')
      .select('comments, title, date, location')
      .eq('event_id', params.id)
      .single()

    // Update event comments count
    const { error: updateError } = await db
      .from('events')
      .update({ comments: (eventData?.comments || 0) + 1 })
      .eq('event_id', params.id)

    if (updateError) {
      console.error('Error updating event comments count:', updateError)
    }

    // Get all participants for the event
    const { data: participants } = await db
      .from('event_participants')
      .select(`
        user_id,
        users!inner (
          email,
          firstname,
          lastname,
          name
        )
      `)
      .eq('event_id', params.id)

    // Send notification to all participants except the comment author
    if (participants && participants.length > 0 && eventData) {
      for (const participant of participants) {
        const user = (participant as any).users
        // Don't send notification to the comment author
        if (user?.email && participant.user_id !== user.user_id) {
          await SubmitMail(
            user.email,
            'New Comment on Event',
            'Someone commented on an event you joined',
            React.createElement(EventUpdateNotificationEmail, {
              eventTitle: eventData.title,
              eventDate: eventData.date,
              eventLocation: eventData.location,
              userName: user.name || `${user.firstname} ${user.lastname}`,
              updateType: 'new_comment',
              updateDetails: {
                commentAuthor: comment.users.name || `${comment.users.firstname} ${comment.users.lastname}`,
                commentContent: content
              },
              companyName: 'CSI SPOTLIGHT',
              companyLogo: 'https://kpmedia.medzyamara.dev/icon-512.png'
            })
          )
        }
      }
    }

    return NextResponse.json({
      success: true,
      comment: {
        ...comment,
        isOwner: true,
        isLiked: false,
        replies_list: []
      }
    })
  } catch (error) {
    console.error('Error in comment creation:', error)
    return NextResponse.json({
      success: false,
      error: 'Server error',
      message: 'An unexpected error occurred'
    }, { status: 500 })
  }
} 