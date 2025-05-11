import IsAuth from '@/app/Auth/IsAuth/IsAuth'
import { redirect } from 'next/navigation'
import React from 'react'
import db from '@/app/Database/Supabase/Base1'
import EditEventPage from './Components/Edit'

export const metadata = {
  title: 'Edit Event',
  description: 'Edit your event details and settings',
}

const page = async ({params}: {params: {id: string}}) => {
    try {
        const id = await params?.id
        const user = await IsAuth(true)
        if(!user || typeof user === 'boolean' || !('user_id' in user)) {
            return redirect(`/dashboard`)
        }
    
        // Fetch the event and verify ownership
        const { data: event, error } = await db
            .from('events')
            .select('*')
            .eq('event_id', id)
            .single()
    
        if (error || !event) {
            return redirect(`/dashboard/events/${id}`)
        }
    
        // Check if the current user is the owner
        if (event.user_id !== user.user_id) {
            return redirect(`/dashboard/events/${id}`)
        }
      
        return (
            <>
               <EditEventPage data={event}/>
            </>
        )
    }
    catch {
        return redirect(`/dashboard`)
    }
}

export default page
