import { NextResponse } from 'next/server'
import db from '@/app/Database/Supabase/Base1'
import IsAuth from '@/app/Auth/IsAuth/IsAuth'
import { SubmitMail } from '@/app/Functions/Mailing/Mail'
import ProjectJoinNotification from '../../../../Functions/Mailing/Components/ProjectJoinNotification'
import ProjectJoinConfirmation from '../../../../Functions/Mailing/Components/ProjectJoinConfirmation'
import React from 'react'
import { v4 as uuidv4 } from 'uuid'

interface AuthUser {
  user_id: string;
  email: string;
  id: string;
  firstname: string;
  name: string;
  lastname: string;
  joinedAt: string;
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await IsAuth(true) as AuthUser | false
    if (!user) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const projectId = params.id
    const { action } = await request.json()

    // Check if the project exists
    const { data: project, error: projectError } = await db
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .single()

    if (projectError || !project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    // Check if user is the owner
    if (project.owner_id === user.user_id) {
      return NextResponse.json({ error: 'Project owner cannot join their own project' }, { status: 400 })
    }

    if (action === 'join') {
      // Check if user is already a participant
      const { data: existingParticipant } = await db
        .from('project_members')
        .select('*')
        .eq('project_id', projectId)
        .eq('user_id', user.user_id)
        .single()

      if (existingParticipant) {
        return NextResponse.json({ error: 'Already a participant' }, { status: 400 })
      }

      // Add user as participant
      const { error: joinError } = await db
        .from('project_members')
        .insert({
          id: uuidv4(),
          project_id: projectId,
          user_id: user.user_id,
          role: 'member',
          status: 'active',
          joined_at: new Date().toISOString(),
          last_active_at: new Date().toISOString(),
          contribution_score: 0
        })

      if (joinError) {
        throw joinError
      }

      // Get user profile for response
      const { data: userProfile } = await db
        .from('users')
        .select('user_id, firstname, lastname, name, profile, email')
        .eq('user_id', user.user_id)
        .single()

      // Get project owner's email
      const { data: projectOwner } = await db
        .from('users')
        .select('email')
        .eq('user_id', project.owner_id)
        .single()

      if (projectOwner?.email && userProfile) {
        // Send notification email to project owner
        await SubmitMail(
          projectOwner.email,
          'New Project Participant',
          'Someone has joined your project',
          React.createElement(ProjectJoinNotification, {
            projectTitle: project.title,
            projectDescription: project.description,
            joinerName: userProfile.name || `${userProfile.firstname} ${userProfile.lastname}`,
            joinerProfileLink: `http://localhost:3000/dashboard/${userProfile.user_id}`,
            companyName: 'CSI SPOTLIGHT',
            companyLogo: 'https://kpmedia.medzyamara.dev/icon-512.png'
          })
        )

        // Add notification for project owner
        await db
          .from('notifications')
          .insert({
            id: uuidv4(),
            user_id: project.owner_id,
            type: 'project_join',
            reference_id: projectId,
            message: `${userProfile.name || `${userProfile.firstname} ${userProfile.lastname}`} has joined your project "${project.title}"`,
            is_read: false,
            created_at: new Date().toISOString()
          })

        // Send confirmation email to the user who joined
        if (userProfile.email) {
          await SubmitMail(
            userProfile.email,
            'Welcome to the Project!',
            'Thank you for joining our project',
            React.createElement(ProjectJoinConfirmation, {
              projectTitle: project.title,
              projectDescription: project.description,
              userName: userProfile.name || `${userProfile.firstname} ${userProfile.lastname}`,
              companyName: 'CSI SPOTLIGHT',
              companyLogo: 'https://kpmedia.medzyamara.dev/icon-512.png'
            })
          )

          // Add notification for the joining user
          await db
            .from('notifications')
            .insert({
              id: uuidv4(),
              user_id: userProfile.user_id,
              type: 'project_join_confirmation',
              reference_id: projectId,
              message: `You have successfully joined the project "${project.title}"`,
              is_read: false,
              created_at: new Date().toISOString()
            })
        }
      }

      return NextResponse.json({
        success: true,
        message: 'Successfully joined project',
        user: {
          ...userProfile,
          role: 'member',
          status: 'active',
          last_active_at: new Date().toISOString(),
          contribution_score: 0
        }
      })
    } else if (action === 'unjoin') {
      // Remove user from participants
      const { error: unjoinError } = await db
        .from('project_members')
        .delete()
        .eq('project_id', projectId)
        .eq('user_id', user.user_id)

      if (unjoinError) {
        throw unjoinError
      }

      return NextResponse.json({
        success: true,
        message: 'Successfully left project',
        user_id: user.user_id
      })
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('Error in join endpoint:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 