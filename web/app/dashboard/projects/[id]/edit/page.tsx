import IsAuth from '@/app/Auth/IsAuth/IsAuth'
import { redirect } from 'next/navigation'
import React from 'react'
import db from '@/app/Database/Supabase/Base1'
import EditProjectPage from './components/Edit'

export const metadata = {
  title: 'Edit Project',
  description: 'Edit your project details and settings',
}

const page = async ({params}: {params: {id: string}}) => {
    try {
        const id = await params?.id
        const user = await IsAuth(true)
        if(!user || typeof user === 'boolean' || !('user_id' in user)) {
            return redirect(`/dashboard`)
        }
    
        // Fetch the project and verify ownership
        const { data: project, error } = await db
            .from('projects')
            .select('*')
            .eq('id', id)
            .single()
    
        if (error || !project) {
            return redirect(`/dashboard/projects/${id}`)
        }
    
        // Check if the current user is the owner
        if (project.user_id !== user.user_id) {
            return redirect(`/dashboard/projects/${id}`)
        }
      
        return (
            <>
               <EditProjectPage data={project} />
            </>
        )
    }
    catch {
        return redirect(`/dashboard`)
    }
}

export default page
