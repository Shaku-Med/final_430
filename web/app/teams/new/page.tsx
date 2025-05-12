import React from 'react'
import New from './Component/New'
import NoID from './Component/NoID';
import VerifyToken from '@/app/Auth/PageAuth/Action/VerifyToken';
import { redirect } from 'next/navigation';
import db from '@/app/Database/Supabase/Base1';
import Link from 'next/link';
import IsAuth from '@/app/Auth/IsAuth/IsAuth';

const page = async ({searchParams}: {searchParams: {id: string}}) => {
    let auth: any = await IsAuth(true)
    // 
    if(!auth){
        return redirect(`/admin/access`)
    }

    const id = searchParams.id;
    if(!id){
        return (
            <div className=' px-4 py-10 flex items-center justify-center '>
                <NoID/>
            </div>
        )
    }

    let key = [`${process.env.TEAM_KEY}`, `${process.env.TEAM_KEY_2}`]
    let vT = await VerifyToken(`${id}`, key, true, true)
    if(!vT){
       return redirect(`/teams`)
    }

    if(auth.user_id !== vT.user_id){
        return (
            <>
                <div className=' px-4 py-10 flex items-center justify-center flex-col gap-4 '>
                    <h1 className='text-2xl font-bold'>You are not authorized to access this page</h1>
                    <p>You need to be logged in as the same user to access this page</p>
                    <Link href={`/teams`} className='text-blue-500 border px-4 py-2 rounded-md hover:bg-muted'>Go to teams</Link>
                </div>
            </>
        )
    }

    const { data: user, error } = await db.from('team_members').select('user_id').eq('user_id', vT.user_id).maybeSingle()
    if(error){
        return redirect(`/teams`)
    }

    if(user){
        return (
            <>
              <div className=' px-4 py-10 flex items-center justify-center flex-col gap-4 '>
                <h1 className='text-2xl font-bold'>You are already a team member</h1>
                <Link href={`/teams`} className='text-blue-500 border px-4 py-2 rounded-md hover:bg-muted'>Go to teams</Link>
              </div>
            </>
        )
    }

    return (
        <>
        <New id={id}/>
        </>
    )
}

export default page
