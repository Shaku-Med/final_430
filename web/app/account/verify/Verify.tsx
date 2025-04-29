"use client"
import { useState, useRef, JSX } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import ExternalAuth from "../../dashboard/@auth/Components/ExternalAuth/ExternalAuth"
import { Separator } from "@/components/ui/separator"
import Pin from "./Pin"
import { toast } from "sonner"
import SetQuickToken from "../Actions/SetQuickToken"
import ResendVEmail from "./Action/ResendVEmail"
import * as device from 'react-device-detect'
import VerifyAccount from "./Action/VerifyAccount"
import { useRouter } from "next/navigation"


interface VERIFYPROPS {
  email?: string;
  isv?: boolean;
  callback?: (status: boolean) => void;
}
export default function Verify({email, isv, callback}: VERIFYPROPS): JSX.Element {
  let nav = useRouter()
  // 
  const [isResendDisabled, setIsResendDisabled] = useState<boolean>(false)
  const [secondsRemaining, setSecondsRemaining] = useState<number>(0)
  const waitTimeRef = useRef<number>(30)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [pin, setPin] = useState<string>("")

  const formatTimeRemaining = (totalSeconds: number): string => {
    const days = Math.floor(totalSeconds / (60 * 60 * 24))
    const hours = Math.floor((totalSeconds % (60 * 60 * 24)) / (60 * 60))
    const minutes = Math.floor((totalSeconds % (60 * 60)) / 60)
    const seconds = totalSeconds % 60

    const parts: string[] = []

    if (days > 0) {
      parts.push(`${days} ${days === 1 ? 'day' : 'days'}`)
    }
    if (hours > 0) {
      parts.push(`${hours} ${hours === 1 ? 'hr' : 'hrs'}`)
    }
    if (minutes > 0) {
      parts.push(`${minutes} ${minutes === 1 ? 'min' : 'mins'}`)
    }
    if (seconds > 0 || parts.length === 0) {
      parts.push(`${seconds} ${seconds === 1 ? 'sec' : 'secs'}`)
    }

    return parts.join(', ')
  }

  const handleResendCode = async () => {
    setIsResendDisabled(true)
    setSecondsRemaining(waitTimeRef.current)
    setIsSubmitting(true)
    
    timerRef.current = setInterval(() => {
      setSecondsRemaining(prev => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current)
          setIsResendDisabled(false)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    
    waitTimeRef.current *= 2
    
    let setSession = await SetQuickToken(`resend`)
      // 
    if(!setSession){
      toast.error(`Unable to resend the verification code. Please try again.`)
      setIsSubmitting(false)
      return;
    }
    // 
    let l = await ResendVEmail({
      device: JSON.stringify(device),
    })
    if(!l){
      toast.error(`Unable to resend the verification code. Please try again.`)
      setIsSubmitting(false)
      return;
    }

    if(l.success){
      toast.success(`${l?.message}`)
    }
    else {
      toast.error(`${l?.message}`)
    }
    // toast.success(`${l?.message}`)
    setIsSubmitting(false)
  }

  let handleSubmit = async () => {
    try {
      if(isSubmitting) toast.info(`Please wait...`);
      if(!pin?.trim()?.length) return toast.error(`Please enter the verification code`);
      setIsSubmitting(true)
      let setSession = await SetQuickToken(`verify`)
      if(!setSession){
        toast.error(`Unable to verify your account. Please try again.`)
        setIsSubmitting(false)
        return;
      }
      //
      let l: any = await VerifyAccount({
        pin: `${pin}`,
        device: JSON.stringify(device),
      })
      if(!l){
        toast.error(`Unable to verify your account. Please try again.`)
        setIsSubmitting(false)
        return;
      }
      if(l.success){
        toast.success(`${l?.message}`)
        setIsSubmitting(false)
        if(l?.action){
          nav.push(`/${l?.action}`)
        }
        else {
          if(callback){
            callback(l?.verified)
          }
        }
      }
      else {
        toast.error(`${l?.message}`)
        setIsSubmitting(false)
        return;
      }
    }
    catch (e) 
    {
      toast.error(`Unable to verify your account. Please try again.`)

    }
  }

  return (
    <div className="flex min-h-full items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md relative z-10 bg-card/80 backdrop-blur-md shadow-xl">
        <CardHeader className="space-y-4">
          <div className="flex justify-center">
           <img className="w-20" src="../../../../icons/web/icon-512.png" alt="App logo" />
          </div>
          <CardTitle className="text-2xl text-center font-bold">Verification</CardTitle>
          <CardDescription className="text-center">
            Enter the verification code sent to your email address
          </CardDescription>
        </CardHeader>
        <Separator/>
        <form onSubmit={(e: React.FormEvent) => {
          e.preventDefault()
          if(isSubmitting) toast.info(`Please wait...`);
          if(!pin?.trim()?.length) return toast.error(`Please enter the verification code`);
          // 
          handleSubmit()
        }}>
          <CardContent className="space-y-4">
            <Pin onComplete={e => {
              setPin(e)
            }}/>
          </CardContent>
          <CardFooter className="flex flex-col mt-4">
            <Button
              className={`w-full ${isSubmitting || `sub`}`}
              size="lg"
              type="submit"
              disabled={isSubmitting}
            >
              Verify
            </Button>
            <p className="mt-4 text-center text-sm text-gray-400">
              Didn't receive the code?{" "}
              {isResendDisabled ? (
                <span className="text-primary">Resend in {formatTimeRemaining(secondsRemaining)}</span>
              ) : (
                <Button 
                  variant="link" 
                  className="p-0 h-auto text-primary" 
                  onClick={handleResendCode}
                >
                  Resend
                </Button>
              )}
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}