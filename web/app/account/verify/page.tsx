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


interface ErrorMessageProps {
  message?: string;
}

export const ErrorMessage = ({ message }: ErrorMessageProps) => {
  return (
    <>

      <head>
        <title>{message}</title>
        <Head/>
      </head>
      <div className="flex text-center z-[100000] fixed top-0 left-0 w-full items-center justify-center h-full min-h-[60vh] p-4">
        <Card className="max-w-md w-full bg-card/80 backdrop-blur-md shadow-xl">
          <CardHeader className="flex flex-col items-center">
            <AlertCircle className="h-12 w-12 text-destructive mb-2" />
            <CardTitle>{message || "Error"}</CardTitle>
          </CardHeader>
          <CardContent>
            <Alert className="text-center" variant="destructive">
              <AlertTriangle className="h-6 w-6" />
              <AlertDescription className="text-center">
                Please try again later.
              </AlertDescription>
            </Alert>
          </CardContent>
          <Separator/>
          <CardFooter className="flex justify-center ">
            <Button asChild variant="outline">
              <Link href="/account">
                <Home className="mr-2 h-4 w-4" />
                Go Home
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </>
  )
}

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