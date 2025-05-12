import { NextResponse } from 'next/server';
import db from '@/app/Database/Supabase/Base1';
import IsAuth from '@/app/Auth/IsAuth/IsAuth';

export async function PATCH(request: Request) {
  try {
    const user = await IsAuth(true);
    if (!user || typeof user === 'boolean' || !('user_id' in user)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { theme } = await request.json();
    
    if (!theme || !['light', 'dark', 'system'].includes(theme)) {
      return NextResponse.json({ 
        error: 'Invalid theme',
        message: 'Theme must be one of: light, dark, system'
      }, { status: 400 });
    }

    const { error } = await db
      .from('users')
      .update({ theme })
      .eq('user_id', user.user_id);

    if (error) {
      console.error('Error updating theme:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true,
      theme
    });
  } catch (error) {
    console.error('Error in theme update:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 