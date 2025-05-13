import { NextResponse } from 'next/server'
import IsAuth from '@/app/Auth/IsAuth/IsAuth'
import db from '@/app/Database/Supabase/Base1'

interface NotificationPayload {
  new: {
    id: string;
    user_id: string;
    type: string;
    message: string;
    created_at: string;
    is_read: boolean;
  }
}

export async function GET(request: Request) {
  try {
    const user = await IsAuth(true)
    if (!user || typeof user === 'boolean') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userData = user as any

    // Set up SSE headers
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        // Send initial connection message
        controller.enqueue(encoder.encode('data: {"type":"connected"}\n\n'))

        // Set up real-time subscription
        const channel = db
          .channel('notifications')
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'notifications',
              filter: `user_id=eq.${userData.user_id}`
            },
            (payload: NotificationPayload) => {
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify(payload.new)}\n\n`)
              )
            }
          )
          .subscribe()

        // Keep the connection alive
        const keepAlive = setInterval(() => {
          controller.enqueue(encoder.encode('data: {"type":"ping"}\n\n'))
        }, 30000)

        // Clean up on close
        request.signal.addEventListener('abort', () => {
          clearInterval(keepAlive)
          channel.unsubscribe()
          controller.close()
        })
      }
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
      }
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
} 