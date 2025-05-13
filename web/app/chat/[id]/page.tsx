import React from 'react'
import { redirect } from 'next/navigation'
import IsAuth from '@/app/Auth/IsAuth/IsAuth'
import db from '@/app/Database/Supabase/Base1'
import Chat from './Component/Chat';

interface AuthUser {
  user_id: string;
}

const page = async ({params}: {params: {id: string}}) => {
  const user = await IsAuth(true) as AuthUser
  if (!user || typeof user === 'boolean' || !('user_id' in user)) {
    redirect('/login')
  }

  // Check if target user exists
  const { data: targetUser, error: targetError } = await db
    .from('users')
    .select('user_id, name, profile')
    .eq('user_id', params.id)
    .single()

  if (targetError || !targetUser) {
    redirect('/dashboard/people')
  }

  return (
    <>
      <Chat/>
    </>
  )
}

export default page
