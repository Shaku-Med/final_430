import { Metadata } from 'next'
import React from 'react'

export const metadata: Metadata = {
  title: {
    absolute: "Welcome home"
  }
}
const page = () => {
  return (
    <div>
      Hello
    </div>
  )
}

export default page
