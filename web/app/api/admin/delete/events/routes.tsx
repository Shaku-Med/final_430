import { NextResponse } from 'next/server'
import db from '@/app/Database/Supabase/Base1'
import IsAuth from '@/app/Auth/IsAuth/IsAuth'
import { cookies } from 'next/headers'
import { DecryptCombine } from '@/app/Auth/Lock/Combine'
import VerifyAdmin from '@/app/admin/VerifyF/VerifyAdmin'
import { SubmitMail } from '@/app/Functions/Mailing/Mail'
import EventDeleteNotificationEmail from '@/app/Functions/Mailing/Components/EventDeleteNotification'
import React from 'react'
import { v4 as uuidv4 } from 'uuid'

export async function DELETE(request: Request) {
  try {
    // First verify regular user authentication
    const user = await IsAuth(true)
    if (!user || typeof user === 'boolean' || !('user_id' in user)) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    // Then verify admin authentication
    let vA = await VerifyAdmin(true)
    if(!vA){
        return NextResponse.json({
            success: false,
            message: 'You are not authorized to delete this event'
        }, { status: 401 })
    }

    // Get the event ID from the request body
    const { eventId, reason } = await request.json()
    if (!eventId) {
      return NextResponse.json({
        success: false,
        message: 'Event ID is required'
      }, { status: 400 })
    }

    if (!reason || reason.trim().length === 0) {
      return NextResponse.json({
        success: false,
        message: 'A reason for deletion is required'
      }, { status: 400 })
    }

    // Verify the event exists and get event details
    const { data: event, error: fetchError } = await db
      .from('events')
      .select('*, users!inner(*)')
      .eq('event_id', eventId)
      .single()

    if (fetchError) {
      console.error('Error fetching event:', fetchError)
      return NextResponse.json({
        success: false,
        message: 'Error fetching event details'
      }, { status: 500 })
    }

    if (!event) {
      return NextResponse.json({
        success: false,
        message: 'Event not found'
      }, { status: 404 })
    }

    // Get event owner's details
    const { data: eventOwner, error: ownerError } = await db
      .from('users')
      .select('email, firstname, lastname, name')
      .eq('user_id', event.user_id)
      .single()

    if (ownerError) {
      console.error('Error fetching event owner:', ownerError)
      return NextResponse.json({
        success: false,
        message: 'Error fetching event owner details'
      }, { status: 500 })
    }

    try {
      // First delete all related data
      const deletePromises = [
        db.from('event_likes').delete().eq('event_id', eventId),
        db.from('event_comments').delete().eq('event_id', eventId),
        db.from('event_participants').delete().eq('event_id', eventId),
        db.from('event_attachments').delete().eq('event_id', eventId),
        db.from('event_notifications').delete().eq('event_id', eventId)
      ]

      // Wait for all related data to be deleted
      const deleteResults = await Promise.all(deletePromises)
      
      // Check if any of the deletions failed
      const hasErrors = deleteResults.some(result => result.error)
      if (hasErrors) {
        console.error('Error deleting related data:', deleteResults)
        return NextResponse.json({
          success: false,
          message: 'Failed to delete related event data'
        }, { status: 500 })
      }

      // Then delete the main event
      const { error: deleteError } = await db
      .from('events')
      .delete()
      .eq('event_id', eventId)
      
      if (deleteError) {
        console.error('Error deleting event:', deleteError)
        return NextResponse.json({
          success: false,
          message: 'Failed to delete event'
        }, { status: 500 })
      }

      // Send email notification to event owner
      if (eventOwner?.email) {
        try {
          await SubmitMail(
            eventOwner.email,
            'Event Deletion Notice',
            'Your event has been deleted by an administrator',
            React.createElement(EventDeleteNotificationEmail, {
              eventTitle: event.title,
              eventDate: event.date,
              eventLocation: event.location,
              userName: eventOwner.name || `${eventOwner.firstname} ${eventOwner.lastname}`,
              reason,
              companyName: 'CSI SPOTLIGHT',
              companyLogo: 'https://kpmedia.medzyamara.dev/icon-512.png'
            })
          )
        } catch (emailError) {
          console.error('Error sending deletion notification email:', emailError)
          // Don't fail the deletion if email fails
        }
      }

      // Log the deletion in admin_logs
      try {
        await db
          .from('admin_logs')
          .insert({
            created_at: new Date().toISOString(),
            action: 'event_deletion',
            reason: reason || 'No reason provided',
            user_id: user.user_id,
            deleted_info: event
          })
      } catch (logError) {
        console.error('Error logging deletion:', logError)
        // Don't fail the deletion if logging fails
      }

      return NextResponse.json({
        success: true,
        message: 'Event deleted successfully'
      })
    } catch (error) {
      console.error('Error in deletion process:', error)
      return NextResponse.json({
        success: false,
        message: 'Failed to complete event deletion process'
      }, { status: 500 })
    }

  } catch (error) {
    console.error('Error in admin event delete:', error)
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 })
  }
}
