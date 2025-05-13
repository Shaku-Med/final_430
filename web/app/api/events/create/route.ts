import { NextResponse } from 'next/server'
import db from '@/app/Database/Supabase/Base1'
import IsAuth from '@/app/Auth/IsAuth/IsAuth'
import { decrypt } from '@/app/Auth/Lock/Enc'
import { v4 as uuidv4 } from 'uuid'

interface AuthUser {
  user_id: string;
}

export async function POST(request: Request) {
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

    // Create event in database
    const { data, error } = await db
      .from('events')
      .insert({
        event_id: uuidv4(),
        user_id: userData.user_id,
        title,
        description,
        date,
        start_time: startTime,
        end_time: endTime,
        status,
        location,
        map_url: mapUrl,
        thumbnail,
        attachments,
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating event:', error)
      return NextResponse.json({
        error: 'Failed to create event',
        message: error.message
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Event created successfully',
      event: data
    })

  } catch (error: any) {
    console.error('Error in create event endpoint:', error)
    return NextResponse.json({
      error: 'Internal server error',
      message: error.message
    }, { status: 500 })
  }
} 