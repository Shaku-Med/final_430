import React from 'react'
import Login from './Components/Login'
import { Metadata } from "next"
import VerifyAdmin from '../VerifyF/VerifyAdmin'
import { redirect } from 'next/navigation'

export const metadata: Metadata = {
  title: {
    default: `Login as Admin`,
    template: '%s | Admin Access'
  },
  openGraph: {
    title: `Login as Admin`,
    description: 'Admin Access Portal'
  }
}


const page = async () => {
  let vA = await VerifyAdmin()
  if(vA) return redirect(`/admin/dashboard`);

  return (
    <>
      <Login/>
    </>
  )
}

export default page
