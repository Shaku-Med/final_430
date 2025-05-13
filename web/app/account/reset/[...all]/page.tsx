'use client'
import { useParams, useRouter } from 'next/navigation'
import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { AlertCircle, CheckCircle } from "lucide-react"
import { toast } from "sonner"
import SetQuickToken from '../../Actions/SetQuickToken'
import Cookies from 'js-cookie';

const page = () => {
    const router = useRouter()
    const {all}: any = useParams()
    const token = all[1]
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState("")

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>, isConfirm = false) => {
        const value = e.target.value
        if (isConfirm) {
            setConfirmPassword(value)
        } else {
            setPassword(value)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError("")

        // Validate passwords
        if (password.length < 8) {
            setError("Password must be at least 8 characters long")
            setIsLoading(false)
            return
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match")
            setIsLoading(false)
            return
        }

        try {

            let setSession = await SetQuickToken()

            if(!setSession){
              toast.error(`Sorry! we had troubles logging you in. Try refreshing and try again.`)
              setIsLoading(false)
              return;
            }

            const response = await fetch('/api/auth/reset-password/verify', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    token,
                    password,
                    access_token: Cookies.get('_athk_')
                }),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Failed to reset password')
            }

            toast.success("Password has been reset successfully")
            router.push('/account')
        } catch (err: any) {
            setError(err.message)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="flex items-center justify-center min-h-screen z-[10000000] fixed top-0 left-0 w-full p-4">
            <div className="w-full max-w-md px-4">
                <Card className="bg-card/80 backdrop-blur-md shadow-xl">
                    <CardHeader className="space-y-1">
                        <CardTitle className="text-2xl font-bold text-center">Reset Password</CardTitle>
                        <CardDescription className="text-center">
                            Enter your new password below
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit}>
                            <div className="grid gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="password">New Password</Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        value={password}
                                        onChange={(e) => handlePasswordChange(e)}
                                        onPaste={(e) => e.preventDefault()}
                                        required
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                                    <Input
                                        id="confirmPassword"
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => handlePasswordChange(e, true)}
                                        onPaste={(e) => e.preventDefault()}
                                        required
                                    />
                                </div>
                                
                                {error && (
                                    <div className="py-4 border px-4 rounded-lg text-yellow-500 text-center w-full">
                                        <AlertCircle className="h-4 w-4 inline-block mr-2" />
                                        <span>{error}</span>
                                    </div>
                                )}

                                <Button 
                                    type="submit" 
                                    disabled={isLoading} 
                                    className="w-full"
                                >
                                    {isLoading ? "Resetting..." : "Reset Password"}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

export default page
