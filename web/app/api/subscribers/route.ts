import { NextResponse } from 'next/server'
import { z } from 'zod'
import db from '@/app/Database/Supabase/Base1'
import { v4 as uuidv4 } from 'uuid'
import { SubmitMail } from '@/app/Functions/Mailing/Mail'
import ThankYouEmail from '@/app/Functions/Mailing/Components/ThankYouEmail'
import React from 'react'

// Email validation schema
const subscriberSchema = z.object({
  email: z.string().email('Invalid email address'),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    // Validate the email
    const { email } = subscriberSchema.parse(body)
    
    // Check if email already exists
    const { data: existingSubscriber } = await db
      .from('subscribers')
      .select('email')
      .eq('email', email)
      .single()

    if (existingSubscriber) {
      return NextResponse.json(
        { error: 'Email already subscribed' },
        { status: 400 }
      )
    }

    // Store in database
    const { error: dbError } = await db
      .from('subscribers')
      .insert({
        id: uuidv4(),
        email,
        created_at: new Date().toISOString(),
        status: 'active'
      })

    if (dbError) {
      console.error('Error storing subscriber:', dbError)
      return NextResponse.json(
        { error: 'Failed to store subscriber' },
        { status: 500 }
      )
    }

    // Send thank you email using existing mailing system
    try {
      await SubmitMail(
        email,
        'Thank you for subscribing!',
        'Thank you for subscribing to our newsletter.',
        React.createElement(ThankYouEmail),
        {
          category: 'newsletter',
          logoUrl: 'https://kpmedia.medzyamara.dev/icon-512.png'
        }
      )
    } catch (emailError) {
      console.error('Error sending thank you email:', emailError)
      // Don't fail the subscription if the email fails
    }
    
    return NextResponse.json(
      { message: 'Successfully subscribed!' },
      { status: 200 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    )
  }
} 