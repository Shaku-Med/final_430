import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import IsAuth from '@/app/Auth/IsAuth/IsAuth'
import db from '@/app/Database/Supabase/Base1'
import { SubmitMail } from '@/app/Functions/Mailing/Mail'
import EventJoinNotificationEmail from '@/app/Functions/Mailing/Components/EventJoinNotification'
import EventJoinConfirmationEmail from '@/app/Functions/Mailing/Components/EventJoinConfirmation'
import React from 'react'
import { v4 as uuidv4 } from 'uuid'

interface AuthUser {
  user_id: string;
  email: string;
  id: string;
  firstname: string;
  name: string;
  lastname: string;
  joinedAt: string;
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { action } = await request.json()

    // Get the current user using your custom auth
    const user = await IsAuth(true) as AuthUser | false
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user is the event owner
    const { data: event } = await db
      .from('events')
      .select('user_id, title, date, location')
      .eq('event_id', params.id)
      .single()

    if (!event) {
      return NextResponse.json(
        { success: false, message: 'Event not found' },
        { status: 404 }
      )
    }

    if (event.user_id === user.user_id) {
      return NextResponse.json(
        { success: false, message: 'Event owners cannot join their own events' },
        { status: 400 }
      )
    }

    if (action === 'join') {
      // Check if user has already joined
      const { data: existingJoin } = await db
        .from('event_participants')
        .select('*')
        .eq('event_id', params.id)
        .eq('user_id', user.user_id)
        .single()

      if (existingJoin) {
        return NextResponse.json(
          { success: false, message: 'Already joined this event' },
          { status: 400 }
        )
      }

      // Add user to event participants
      const { error: joinError } = await db
        .from('event_participants')
        .insert({
          event_id: params.id,
          user_id: user.user_id,
          joined_at: new Date().toISOString()
        })

      if (joinError) {
        throw joinError
      }

      // Get user profile information
      const { data: userProfile } = await db
        .from('users')
        .select('user_id, firstname, lastname, name, profile, email')
        .eq('user_id', user.user_id)
        .single()

      // Get event owner's email
      const { data: eventOwner } = await db
        .from('users')
        .select('email')
        .eq('user_id', event.user_id)
        .single()

      if (eventOwner?.email && userProfile) {
        // Send notification email to event owner
        await SubmitMail(
          eventOwner.email,
          'New Event Participant',
          'Someone has joined your event',
          React.createElement(EventJoinNotificationEmail, {
            eventTitle: event.title,
            eventDate: event.date,
            eventLocation: event.location,
            joinerName: userProfile.name || `${userProfile.firstname} ${userProfile.lastname}`,
            joinerProfileLink: `http://localhost:3000/dashboard/${userProfile.user_id}`,
            companyName: 'CSI SPOTLIGHT',
            companyLogo: 'https://kpmedia.medzyamara.dev/icon-512.png'
          })
        )

        // Add notification for event owner
        await db
          .from('notifications')
          .insert({
            id: uuidv4(),
            user_id: event.user_id,
            type: 'event_join',
            reference_id: params.id,
            message: `${userProfile.name || `${userProfile.firstname} ${userProfile.lastname}`} has joined your event "${event.title}"`,
            is_read: false,
            created_at: new Date().toISOString()
          })

        // Send confirmation email to the user who joined
        if (userProfile.email) {
          await SubmitMail(
            userProfile.email,
            'Welcome to the Event!',
            'Thank you for joining our event',
            React.createElement(EventJoinConfirmationEmail, {
              eventTitle: event.title,
              eventDate: event.date,
              eventLocation: event.location,
              userName: userProfile.name || `${userProfile.firstname} ${userProfile.lastname}`,
              companyName: 'CSI SPOTLIGHT',
              companyLogo: 'https://kpmedia.medzyamara.dev/icon-512.png'
            })
          )

          // Add notification for the joining user
          await db
            .from('notifications')
            .insert({
              id: uuidv4(),
              user_id: userProfile.user_id,
              type: 'event_join_confirmation',
              reference_id: params.id,
              message: `You have successfully joined the event "${event.title}"`,
              is_read: false,
              created_at: new Date().toISOString()
            })
        }
      }

      return NextResponse.json({
        success: true,
        message: 'Successfully joined the event',
        user: userProfile
      })
    } else if (action === 'unjoin') {
      // Remove user from event participants
      const { error: unjoinError } = await db
        .from('event_participants')
        .delete()
        .eq('event_id', params.id)
        .eq('user_id', user.user_id)

      if (unjoinError) {
        throw unjoinError
      }

      return NextResponse.json({
        success: true,
        message: 'Successfully unjoined the event',
        user_id: user.user_id
      })
    }

    return NextResponse.json(
      { success: false, message: 'Invalid action' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Error in event join/unjoin:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
} 