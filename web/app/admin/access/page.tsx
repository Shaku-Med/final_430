import React from 'react'
import Login from './Components/Login'
import { Metadata } from "next"

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


const page = () => {
  return (
    <>
      <Login/>
    </>
  )
}

export default page
