import { NextResponse } from 'next/server'
import db from '@/app/Database/Supabase/Base1'
import IsAuth from '@/app/Auth/IsAuth/IsAuth'
import { decrypt } from '@/app/Auth/Lock/Enc'
import { SubmitMail } from '@/app/Functions/Mailing/Mail'
import EventUpdateNotificationEmail from '@/app/Functions/Mailing/Components/EventUpdateNotification'
import React from 'react'
import { v4 as uuidv4 } from 'uuid'

interface AuthUser {
  user_id: string;
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Verify user authentication
    const user = await IsAuth(true)
    if (!user || typeof user === 'boolean' || !('user_id' in user)) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const userData = user as AuthUser
    const formData = await request.formData()

    // Extract form data
    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const date = formData.get('date') as string
    const startTime = formData.get('startTime') as string
    const endTime = formData.get('endTime') as string
    const status = formData.get('status') as string
    const location = formData.get('location') as string
    const mapUrl = formData.get('mapUrl') as string

    // Validate required fields
    if (!title || !date || !startTime || !endTime || !location) {
      return NextResponse.json({
        error: 'Missing required fields',
        message: 'Title, date, time, and location are required'
      }, { status: 400 })
    }

    // Handle thumbnail
    let thumbnail = null
    const thumbnailData = formData.get('thumbnail')
    if (thumbnailData) {
      try {
        const parsedThumbnail = JSON.parse(thumbnailData as string)
        if (parsedThumbnail.url) {
          parsedThumbnail.url = decrypt(parsedThumbnail.url[0], `${process.env.FILE_TOKEN}`)
          thumbnail = parsedThumbnail
        }
      } catch (error) {
        console.error('Error decrypting thumbnail:', error)
      }
    }

    // Handle attachments
    let attachments = []
    const attachmentsData = formData.get('attachments')
    if (attachmentsData) {
      try {
        const parsedAttachments = JSON.parse(attachmentsData as string)
        attachments = parsedAttachments.map((attachment: any) => {
          if (attachment.url) {
            return {
              ...attachment,
              url: decrypt(attachment.url[0], `${process.env.FILE_TOKEN}`)
            }
          }
          return attachment
        })
      } catch (error) {
        console.error('Error decrypting attachments:', error)
      }
    }

    // First check if the event exists and user has permission
    const { data: existingEvent, error: fetchError } = await db
      .from('events')
      .select('*')
      .eq('event_id', params.id)
      .single()

    if (fetchError) {
      console.error('Error fetching event:', fetchError)
      return NextResponse.json({
        error: 'Failed to fetch event',
        message: fetchError.message
      }, { status: 500 })
    }

    if (!existingEvent) {
      return NextResponse.json({
        error: 'Not found',
        message: 'Event not found'
      }, { status: 404 })
    }

    if (existingEvent.user_id !== userData.user_id) {
      return NextResponse.json({
        error: 'Unauthorized',
        message: 'You do not have permission to update this event'
      }, { status: 403 })
    }

    // Update event in database
    const updateData: any = {
      title,
      description,
      date,
      start_time: startTime,
      end_time: endTime,
      status,
      location,
      map_url: mapUrl,
      updated_at: new Date().toISOString()
    }

    // Only include thumbnail if it was provided
    if (thumbnail !== null) {
      updateData.thumbnail = thumbnail
    }

    // Only include attachments if they were provided
    if (attachments.length > 0) {
      updateData.attachments = attachments
    }

    const { data, error } = await db
      .from('events')
      .update(updateData)
      .eq('event_id', params.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating event:', error)
      return NextResponse.json({
        error: 'Failed to update event',
        message: error.message
      }, { status: 500 })
    }

    // Get all participants for the event
    const { data: participants } = await db
      .from('event_participants')
      .select('user_id')
      .eq('event_id', params.id)

    // Send update notifications to all participants
    if (participants && participants.length > 0) {
      const updateDetails = {
        title: title !== existingEvent.title ? title : undefined,
        date: date !== existingEvent.date ? date : undefined,
        location: location !== existingEvent.location ? location : undefined,
        description: description !== existingEvent.description ? description : undefined
      }

      // Only send notifications if there are actual changes
      if (Object.values(updateDetails).some(value => value !== undefined)) {
        // Get user information for all participants
        const participantIds = participants.map(p => p.user_id)
        const { data: participantProfiles } = await db
          .from('users')
          .select('user_id, email, firstname, lastname, name')
          .in('user_id', participantIds)

        if (participantProfiles) {
          for (const user of participantProfiles) {
            // Skip sending notification to the event owner
            if (user.user_id === userData.user_id) continue;

            if (user.email) {
              await SubmitMail(
                user.email,
                'Event Update Notification',
                'An event you joined has been updated',
                React.createElement(EventUpdateNotificationEmail, {
                  eventTitle: title,
                  eventDate: date,
                  eventLocation: location,
                  userName: user.name || `${user.firstname} ${user.lastname}`,
                  updateType: 'event_update',
                  updateDetails,
                  companyName: 'CSI SPOTLIGHT',
                  companyLogo: 'https://kpmedia.medzyamara.dev/icon-512.png'
                })
              )

              // Add notification for the participant
              await db
                .from('notifications')
                .insert({
                  id: uuidv4(),
                  user_id: user.user_id,
                  type: 'event_update',
                  reference_id: params.id,
                  message: `The event "${title}" has been updated${Object.entries(updateDetails)
                    .filter(([_, value]) => value !== undefined)
                    .map(([key]) => ` (${key})`)
                    .join(',')}`,
                  is_read: false,
                  created_at: new Date().toISOString()
                })
            }
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Event updated successfully',
      event: data
    })

  } catch (error: any) {
    console.error('Error in update event endpoint:', error)
    return NextResponse.json({
      error: 'Internal server error',
      message: error.message
    }, { status: 500 })
  }
}