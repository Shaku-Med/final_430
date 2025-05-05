import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, AlertTriangle, Home } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Separator } from "@/components/ui/separator"
import Head from "../../dashboard/@auth/Components/Headers/Head"

interface ErrorMessageProps {
  message?: string;
}

const ErrorMessage = ({ message }: ErrorMessageProps) => {
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

export default ErrorMessage 