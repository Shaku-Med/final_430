import React from 'react'
import Github from './Github/Github'
import { GoogleOAuthProvider } from '@react-oauth/google'
import Google from './Google/Google'

const ExternalAuth = () => {
  let cgid: string = `Ov23liPGs1VbZGV6rmEq`;
  let cgoogleid = `385626032340-k3eh9sh8lkove4p7tdainppbphftjc6d.apps.googleusercontent.com`;
  // These Id's are not something secretive....

  return (
    <>
        <div className="grid grid-cols-2 gap-4 overflow-auto">
            <Github pk='' redirectUri={`http://localhost:3000`} clientId={`${cgid}`}/>
            <GoogleOAuthProvider clientId={`${cgoogleid}`}>
                <Google pk={`hello`}/>
            </GoogleOAuthProvider>
        </div>
    </>
  )
}

export default ExternalAuth
