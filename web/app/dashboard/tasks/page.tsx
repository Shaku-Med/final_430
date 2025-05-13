import React from 'react'
import TasksPage from './Components/Home/Tasks'
import IsAuth from '@/app/Auth/IsAuth/IsAuth'
import db from '@/app/Database/Supabase/Base1'

interface User {
  id: string;
  email: string;
  user_id: string;
}

const page = async () => {
  // Authenticate user
  const user = await IsAuth(true) as User
  if (!user || typeof user === 'boolean') {
    throw new Error('Unauthorized')
  }

  // Get tasks from database for the authenticated user
  const { data: tasks, error } = await db
    .from('tasks')
    .select('*')
    .eq('user_id', user.user_id)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error('Failed to fetch tasks')
  }

  return (
    <>
      <TasksPage T={tasks}/>
    </>
  )
}

export default page
