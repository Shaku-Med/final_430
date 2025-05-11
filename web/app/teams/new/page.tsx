import React from 'react'
import New from './Component/New'
import NoID from './Component/NoID';
import VerifyToken from '@/app/Auth/PageAuth/Action/VerifyToken';
import { redirect } from 'next/navigation';

const page = async ({searchParams}: {searchParams: {id: string}}) => {
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

    return (
        <>
        <New/>
        </>
    )
}

export default page
