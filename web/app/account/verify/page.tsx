import { cookies, headers } from "next/headers"
import Verify from "./Verify"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, AlertTriangle, Home } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Separator } from "@/components/ui/separator"
import { getClientIP } from "@/app/Auth/IsAuth/SetToken"
import VerifyToken from "@/app/Auth/PageAuth/Action/VerifyToken"
import db from '@/app/Database/Supabase/Base1'
import Head from "../../dashboard/@auth/Components/Headers/Head"
import ErrorMessage from "./ErrorMessage"

const Page = async () => {
  try {
    let h = await headers()
    const cookieStore = await cookies()
    const verificationToken = cookieStore?.get(`acT`)?.value
    
    if (!verificationToken) {
      return <ErrorMessage message={`This page is not working.`} />
    }
    
    let ky = [`${process.env.TOKEN3}`, `${await getClientIP(h)}`]
    let vVtoken = await VerifyToken(`${verificationToken}`, ky, true)
    if(!vVtoken) return <ErrorMessage message={`Authorization was not found!`} />;
    // 
    let {data, error} = await db.from(`users`).select(`isVerified`).eq(`email`, vVtoken?.email).maybeSingle()
    if(error) return <ErrorMessage message={`This account doesn't seem to be found. Make sure your account is available.`} />;
    // 
    if(!vVtoken?.shouldLogin){
      if(data?.isVerified) return <ErrorMessage message={`This account has already been verified. Please try loging in.`} />;
    }
    //
    return (
      <>
       {
        vVtoken?.account && (
          <Head/>
        )
       }
      <Verify/>
      </>
    )
  } catch (error) {
    return <ErrorMessage message={`An error occurred while processing your request.`} />
  }
}

export default Page