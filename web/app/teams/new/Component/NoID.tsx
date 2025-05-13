import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle } from "lucide-react"

const NoID = () => {
  return (
    <Card className="w-full max-w-md mx-auto min-w-fit">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-destructive text-center justify-center">
          <AlertCircle className="h-5 w-5" />
          No ID Found
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground text-center">
          The requested ID could not be found. Please check the URL or try again later.
        </p>
      </CardContent>
    </Card>
  )
}

export default NoID
