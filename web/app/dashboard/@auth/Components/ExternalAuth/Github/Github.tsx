'use client'
import React, { useState, useLayoutEffect } from 'react'
import axios from 'axios'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import { FaGithub } from "react-icons/fa"
import * as device from 'react-device-detect'
import OneMoreThing from '../Tasks/Main'
import ExternalLogin from '../../../../../account/Actions/ExternalLogin'
import SetQuickToken from '../../../../../account/Actions/SetQuickToken'

interface GitHubProps {
  pk: string
  clientId: string
  redirectUri: string
}

interface GitHubUserInfo {
  login: string
  id: number
  name: string
  email: string
  [key: string]: any
}

const GitHub: React.FC<GitHubProps> = ({ pk, clientId, redirectUri }) => {
  const [isAuthenticating, setIsAuthenticating] = useState<boolean>(false)
  const [progress, setProgress] = useState<number>(1)
  const [showPasswordModal, setShowPasswordModal] = useState<boolean>(false)
  const [isSubmittingPassword, setIsSubmittingPassword] = useState<boolean>(false)
  const [userInfo, setUserInfo] = useState<GitHubUserInfo | null>(null)
  // 
  const [modalType, setmodalType] = useState<any>(null)

  const updateProgress = (value: number): void => {
    setProgress(value)
  }

  const cleanupUrlParams = () => {
    const url = new URL(window.location.href)
    url.search = ''
    window.history.replaceState({}, document.title, url.toString())
  }

  useLayoutEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const code = urlParams.get('code')
    
    if (code) {
      setIsAuthenticating(true)
      
      // Immediately clean up URL parameters
      cleanupUrlParams()
      
      axios.post('/api/github/auth', { code })
        .then(async (res) => {
          
          const sessionToken = await SetQuickToken('externalsession')
          
          if (!sessionToken) {
            toast.error('Unable to create your account. Please refresh and try again.')
            return
          }

          const nameParts = res?.data?.name?.split(/\s+/) || ['']
          const firstName = nameParts[0]
          const lastName = nameParts.slice(1).join(' ')

          const loginResult: any = await ExternalLogin({
            firstname: firstName,
            lastname: lastName,
            name: res?.data?.name || '',
            device: JSON.stringify(device),
            email: res?.data?.email || '',
            data: res?.data,
            account_type: 'github'
          })

          setIsAuthenticating(false)

          if (loginResult.success) {
            toast.success(loginResult.message)
            if(loginResult?.action){
              if(loginResult?.action?.startsWith('window')) {
                setTimeout(() => eval(loginResult?.action), 2000)
              }
              else {
                setShowPasswordModal(true)
                setmodalType(loginResult?.action)
              }
            }
            else {
              setTimeout(() => window.location.reload(), 2000)
            }
          } else {
            toast.error(loginResult.message)
            if (loginResult.action) {
              if(loginResult?.action?.startsWith('window')) {
                setTimeout(() => eval(loginResult?.action), 2000)
              }
              else {
                setShowPasswordModal(true)
                setmodalType(loginResult?.action)
              }
            }
          }
        })
        .catch(err => {
          // console.error('GitHub authentication error:', err)
          setIsAuthenticating(false)
          // toast.error('Authentication failed. Please try again.')
        })
    }
  }, [])

  const initiateGitHubLogin = (): void => {
    setIsAuthenticating(true)
    
    const state = crypto.randomUUID()
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: window.location.href,
      scope: 'user:email read:user',
      state
    })
    
    window.location.href = `https://github.com/login/oauth/authorize?${params}`
  }

  return (
    <>
      <Button 
        variant="outline" 
        onClick={isAuthenticating ? undefined : initiateGitHubLogin} 
        disabled={isAuthenticating}
        className={`${isAuthenticating ? 'opacity-70 cursor-not-allowed' : ''}`}
      >
        {isAuthenticating ? (
          <Loader2 className="animate-spin mr-2" />
        ) : (
          <>
            <FaGithub className="mr-2" />
            <span className={`line-clamp-1`}>Login with GitHub</span>
          </>
        )}
      </Button>

      <OneMoreThing
        open={showPasswordModal}
        onOpenChange={setShowPasswordModal}
        modalType={modalType}
      />
    </>
  )
}

export default GitHub