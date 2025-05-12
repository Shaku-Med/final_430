'use server'
import { cookies } from 'next/headers'
import React from 'react'

const SignOff = async () => {
  let c = await cookies();
  
  c.delete(`token`)
  c.delete(`sign_inToken`)
  c.delete(`session`)
  c.delete(`c_usr`)
  c.delete(`xs`)
  c.delete(`admin`)
//   
return true;
}

export default SignOff
