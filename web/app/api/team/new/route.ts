import { NextResponse } from 'next/server';
import db from '@/app/Database/Supabase/Base1';
import IsAuth from '@/app/Auth/IsAuth/IsAuth';
import { decrypt } from '@/app/Auth/Lock/Enc';
import VerifyToken from '@/app/Auth/PageAuth/Action/VerifyToken';

export async function POST(request: Request) {
  try {
    const user = await IsAuth(true);
    if (!user || typeof user === 'boolean' || !('user_id' in user)) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    
    const body = await request.json();
    
    // Validate required fields
    const requiredFields = ['name', 'role', 'description', 'expertise', 'user_id'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { message: `${field} is required` },
          { status: 400 }
        );
      }
    }
    
    let key = [`${process.env.TEAM_KEY}`, `${process.env.TEAM_KEY_2}`]
    let vT = await VerifyToken(`${body.user_id}`, key, true, true)
    console.log(vT)
    if(!vT){
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    body.user_id = vT.user_id
    // Validate expertise is an array and not empty
    if (!Array.isArray(body.expertise) || body.expertise.length === 0) {
      return NextResponse.json(
        { message: 'At least one expertise is required' },
        { status: 400 }
      );
    }

    // Handle attachments decryption
    let attachments = [];
    if (body.attachments && Array.isArray(body.attachments)) {
      try {
        attachments = body.attachments.map((attachment: any) => {
          if (attachment.url) {
            return {
              ...attachment,
              url: decrypt(attachment.url[0], `${process.env.FILE_TOKEN}`)
            };
          }
          return attachment;
        });
      } catch (error) {
        console.error('Error decrypting attachments:', error);
      }
    }

    // Create team member in database
    const { data: teamMember, error } = await db
      .from('team_members')
      .insert({
        id: body.id,
        name: body.name,
        role: body.role,
        description: body.description,
        expertise: body.expertise,
        information: body.information || '',
        user_id: body.user_id,
        attachments: attachments,
        created_at: new Date().toISOString(),
        socialLinks: body.socialLinks
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating team member:', error);
      return NextResponse.json(
        { message: 'Failed to create team member' },
        { status: 500 }
      );
    }

    return NextResponse.json(teamMember, { status: 201 });
  } catch (error) {
    console.error('Error creating team member:', error);
    return NextResponse.json(
      { message: 'Failed to create team member' },
      { status: 500 }
    );
  }
} 