import React from 'react'
import DynamicTeam from './Component/DynamicTeam'
import db from '@/app/Database/Supabase/Base1'
import IsAuth from '@/app/Auth/IsAuth/IsAuth'
import { Metadata, ResolvingMetadata } from 'next/types'

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

// Add generateMetadata function
export async function generateMetadata(
  { params }: PageParams,
  parent: ResolvingMetadata
): Promise<Metadata> {
  // Get the user ID from params
  const { id } = params;
  
  // Fetch team member data
  const { data: teamMember, error } = await db
    .from('team_members')
    .select(`
      name,
      role,
      description
    `)
    .eq('user_id', id)
    .single<Partial<TeamMember>>();
    
  // Fallback metadata if team member not found
  if (error || !teamMember) {
    return {
      title: 'Team Member Not Found',
      description: 'The requested team member profile could not be found.'
    };
  }
  
  // Construct metadata from team member data
  return {
    title: `${teamMember.name} - ${teamMember.role}`,
    description: teamMember.description || 'Team member profile',
    openGraph: {
      title: `${teamMember.name} - ${teamMember.role}`,
      description: teamMember.description || 'Team member profile',
      type: 'profile',
    },
  };
}

const page = async ({ params }: PageParams) => {
  let auth: any = await IsAuth(true)
  const { id } = params;

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
    .eq('user_id', id)
    .single<TeamMember>();

  if (error || !teamMember) {
    return <div>Team member not found</div>
  }

  if(auth.user_id === teamMember.user_id) {
    teamMember.isAuth = true
  }
  else {
    teamMember.isAuth = false
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <DynamicTeam data={teamMember} />
    </div>
  )
}

export default page