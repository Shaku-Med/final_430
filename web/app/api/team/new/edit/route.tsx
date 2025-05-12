import { NextResponse } from 'next/server';
import db from '@/app/Database/Supabase/Base1';
import IsAuth from '@/app/Auth/IsAuth/IsAuth';
import { decrypt } from '@/app/Auth/Lock/Enc';
import VerifyToken from '@/app/Auth/PageAuth/Action/VerifyToken';

export async function PUT(request: Request) {
    try {
      const user = await IsAuth(true);
      if (!user || typeof user === 'boolean' || !('user_id' in user)) {
        return new NextResponse('Unauthorized', { status: 401 });
      }
  
      const body = await request.json();
      
      // Validate required fields
      const requiredFields = ['id', 'name', 'role', 'description', 'expertise', 'user_id'];
      for (const field of requiredFields) {
        if (!body[field]) {
          return NextResponse.json(
            { message: `${field} is required` },
            { status: 400 }
          );
        }
      }
  
      // Validate expertise is an array and not empty
      if (!Array.isArray(body.expertise) || body.expertise.length === 0) {
        return NextResponse.json(
          { message: 'At least one expertise is required' },
          { status: 400 }
        );
      }
  
      // Handle attachments decryption if provided
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

      
      let updateData: any = {
        name: body.name,
        role: body.role,
        description: body.description,
        expertise: body.expertise,
        information: body.information || '',
        user_id: user.user_id,
        socialLinks: body.socialLinks
      }

      if(attachments.length > 0) {
        updateData.attachments = attachments
      }
      // Update team member in database
      const { data: teamMember, error } = await db
        .from('team_members')
        .update(updateData)
        .eq('user_id', user.user_id)
        .select()
        .single();
  
      if (error) {
        console.error('Error updating team member:', error);
        return NextResponse.json(
          { message: 'Failed to update team member' },
          { status: 500 }
        );
      }
  
      return NextResponse.json(teamMember, { status: 200 });
    } catch (error) {
      console.error('Error updating team member:', error);
      return NextResponse.json(
        { message: 'Failed to update team member' },
        { status: 500 }
      );
    }
  } 