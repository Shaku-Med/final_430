import React from 'react'
import db from '@/app/Database/Supabase/Base1'
import IsAuth from '@/app/Auth/IsAuth/IsAuth'
import { Metadata, ResolvingMetadata } from 'next/types'
import Teams from './Component/Teams'
import { redirect } from 'next/navigation'

interface PageParams {
  params: {
    id: string
  }
}

interface TeamMember {
  id: string;
  name: string;
  role: string;
  description: string;
  expertise: string[];
  information: string;
  user_id: string;
  socialLinks: { platform: string; url: string }[];
  attachments: any[];
  created_at: string;
  updated_at: string;
  users: {
    firstname: string;
    lastname: string;
    profile: string;
  };
  isAuth: boolean;
}


const page = async () => {
  let auth: any = await IsAuth(true)

  const { data: teamMember, error } = await db
    .from('team_members')
    .select(`
      id,
      name,
      role,
      description,
      expertise,
      information,
      user_id,
      socialLinks,
      attachments,
      created_at,
      updated_at,
      users:user_id (
        firstname,
        lastname,
        profile
      )
    `)
    .eq('user_id', auth?.user_id)
    .single<TeamMember>();

  if (error || !teamMember) {
    return <div>Team member not found</div>
  }

  if(auth.user_id !== teamMember.user_id) {
    return redirect(`/teams/${teamMember.user_id}`)
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <Teams data={teamMember} />
    </div>
  )
}

export default page