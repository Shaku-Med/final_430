'use client'
import React, { useState } from 'react'
import { useGoogleLogin } from '@react-oauth/google'
import axios from 'axios'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import { FcGoogle } from "react-icons/fc"
import * as device from 'react-device-detect'
import OneMoreThing from '../Tasks/Main'
import ExternalLogin from '../../../../../account/Actions/ExternalLogin'
import SetQuickToken from '../../../../../account/Actions/SetQuickToken'

interface GoogleProps {
  pk: string
}

interface UserInfo {
  verified_email: boolean
  [key: string]: any
}

const Google: React.FC<GoogleProps> = ({ pk }) => {
  const [sub, setSub] = useState<boolean>(false)
  const [progress, setProgress] = useState<number>(1)
  const [showPasswordModal, setShowPasswordModal] = useState<boolean>(false)
  const [isSubmittingPassword, setIsSubmittingPassword] = useState<boolean>(false)
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null)
  const [modalType, setmodalType] = useState<any>(null)

  const Prog = (data: number): void => {
    setProgress(data)
  }

  const callback = async (cbk: any, isError: any): Promise<void> => {
    setTimeout(() => { setProgress(0) }, 2000)
    setSub(false)

    if (isError && cbk === null) {
      if (isError.response) {
        if (isError.response.hasOwnProperty('data')) {
          toast.error(isError.response.data.message)
        } else {
          toast.error('Access denied. Request incomplete.')
        }
      } else {
        toast.error('Access denied. Request incomplete')
      }
    }
  }

  const log = useGoogleLogin({
    onSuccess: async (response) => {
      try {
        const res = await axios.get<UserInfo>(`https://www.googleapis.com/oauth2/v1/userinfo?access_token=${response.access_token}`, {
          headers: {
            Authorization: `Bearer ${response.access_token}`,
            Accept: 'application/json'
          }
        });
        
        const userData = res.data;
        
        if (userData.verified_email) {
          const sessionToken = await SetQuickToken('externalsession');
          
          if (!sessionToken) {
            toast.error('Unable to create your account. Please refresh and try again.');
            setSub(false);
            return;
          }

          const nameParts = userData.name?.split(/\s+/) || [''];
          const firstName = nameParts[0];
          const lastName = nameParts.slice(1).join(' ');

          const loginResult: any = await ExternalLogin({
            firstname: firstName,
            lastname: lastName,
            name: userData.name || '',
            device: JSON.stringify(device),
            email: userData.email || '',
            data: userData,
            account_type: 'google'
          });

          setSub(false);

          if (loginResult.success) {
            toast.success(loginResult.message);
            if (loginResult?.action) {
              if (loginResult?.action?.startsWith('window')) {
                setTimeout(() => eval(loginResult?.action), 2000);
              } else {
                setShowPasswordModal(true);
                setmodalType(loginResult?.action);
              }
            } else {
              setTimeout(() => window.location.reload(), 2000);
            }
          } else {
            toast.error(loginResult.message);
            if (loginResult.action) {
              if (loginResult?.action?.startsWith('window')) {
                setTimeout(() => eval(loginResult?.action), 2000);
              } else {
                setShowPasswordModal(true);
                setmodalType(loginResult?.action);
              }
            }
          }
        } else {
          toast.error('Sorry, this account is not verified.');
          setSub(false);
        }
      } catch (err) {
        setSub(false);
        toast.error('Ouch! Felt that one, unable to complete login mission.');
      }
    },
    onError: (error) => {
      setSub(false);
      toast.error('Ouch! Felt that one, unable to complete login mission.');
    },
    onNonOAuthError: (error) => {
      setSub(false);
    }
  });

  return (
    <>
      <Button 
        variant="outline" 
        onClick={!sub ? e => {
          log()
          setSub(true)
        } : e => { }} 
        className={`${sub && 'dis'}`}
      >
        {
          sub ?
            <>
              <Loader2 className="animate-spin mr-2" />
            </> :
            <>
              <FcGoogle className="mr-2" />
              <span className='line-clamp-1'>Login with Google</span>
            </>
        }
      </Button>

      <OneMoreThing
        open={showPasswordModal}
        onOpenChange={setShowPasswordModal}
        modalType={modalType}
      />
    </>
  )
}

export default Google