import React from 'react'
import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Admin Panel',
  description: 'Access the administrative dashboard to manage your application settings and content',
  keywords: ['admin', 'dashboard', 'management', 'settings'],
  robots: 'noindex, nofollow', // Since this is an admin page, we don't want it indexed
}

const AdminPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>Admin Panel</CardTitle>
          <CardDescription>Access the administrative dashboard</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Manage your application settings and content from here.
          </p>
        </CardContent>
        <CardFooter>
          <Button asChild className="w-full">
            <Link href="/admin/dashboard">
              Go to Admin Panel
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

export default AdminPage
