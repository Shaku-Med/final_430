"use client"

import { useState } from "react"
import Link from "next/link"
import { Eye, EyeOff, Github, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AnimatedBackground } from "../../dashboard/@auth/Components/animated-background"
import ExternalAuth from "../../dashboard/@auth/Components/ExternalAuth/ExternalAuth"
import Verification from "../../dashboard/@auth/Components/Verification"
import LoginSignup from "../Actions/LoginSignup"
import * as device from 'react-device-detect'
import SetQuickToken from "../Actions/SetQuickToken"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const nav = useRouter()
  
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    remember: false
  })
  const [errors, setErrors] = useState<any>({
    email: "",
    password: ""
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  const handleInputChange = (e: any) => {
    const { id, value } = e.target
    setFormData({
      ...formData,
      [id]: value
    })
    
    // Clear error when user starts typing
    if (errors[id]) {
      setErrors({
        ...errors,
        [id]: ""
      })
    }
  }

  const handleCheckboxChange = (checked: any) => {
    setFormData({
      ...formData,
      remember: checked
    })
  }

  const validateField = (field: any, value: any) => {
    switch (field) {
      case "email":
        return Verification({
          email: {
            required: true,
            text: value
          },
          returnBoolean: false
        }) || ""
      case "password":
        return value.trim() ? "" : "Password is required"
      default:
        return ""
    }
  }

  const validateForm = () => {
    const newErrors = {
      email: validateField("email", formData.email),
      password: validateField("password", formData.password)
    }

    setErrors(newErrors)
    return !Object.values(newErrors).some(error => error !== "")
  }

  const handleSubmit = async (e: any) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    if (validateForm()) {
      let newWindow: any = window
      
      // Set session token
      let setSession = await SetQuickToken()
      
      if(!setSession){
        toast.error(`Sorry! we had troubles logging you in. Try refreshing and try again.`)
        setIsSubmitting(false)
        return;
      }
      
      // Login using the LoginSignup action with login=false parameter
      let ls = await LoginSignup({
        email: formData.email,
        password: formData.password,
        device: JSON.stringify(device),
        token: newWindow?.session_ID,
      }, false)
      
      if(ls.success){
        toast.success(`${ls?.message}`)
        if (ls.action) {
          if(ls?.action?.startsWith('window')) {
            setTimeout(() => eval(ls?.action), 2000)
          }
          else {
            nav.push(`/account/${ls?.action}`)
          }
        }
      }
      else {
        toast.error(`${ls?.message}`)
        if (ls.action) {
          if(ls?.action?.startsWith('window')) {
            setTimeout(() => eval(ls?.action), 2000)
          }
        }
      }
    }
    
    setIsSubmitting(false)
    return;
  }

  return (
    <div className="flex min-h-full items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md relative z-10 bg-card/80 backdrop-blur-md shadow-xl">
        <CardHeader className="space-y-4">
          <div className="flex justify-center">
           <img className={`w-20`} src={`../../../../icons/web/icon-512.png`}/>
          </div>
          <CardTitle className="text-2xl text-center font-bold ">Log in to your account</CardTitle>
          <CardDescription className="text-center ">
            Enter your email and password to log in
          </CardDescription>
        </CardHeader>
        <div className={`px-6`}>
         <ExternalAuth/>
        </div>
        <form onSubmit={isSubmitting ? e => {
          e.preventDefault()
          toast.info(`Please wait...`)
        } : handleSubmit}>
          <CardContent className="space-y-4">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t " />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card shadow-sm rounded-lg px-2 text-gray-400">Or continue with</span>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground/70">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
                value={formData.email}
                onChange={handleInputChange}
                className={`bg-card/30 placeholder:text-gray-500 ${errors.email ? "border-red-500" : ""}`}
              />
              {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-foreground/70">
                  Password
                </Label>
                <Link href="/account/reset" className="text-sm font-medium text-blue-400 hover:text-blue-300">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`bg-card/30 ${errors.password ? "border-red-500" : ""}`}
                  placeholder={`●●●●●●●●`}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-gray-400"
                  onClick={togglePasswordVisibility}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  <span className="sr-only">{showPassword ? "Hide password" : "Show password"}</span>
                </Button>
              </div>
              {errors.password && <p className="text-xs text-red-500">{errors.password}</p>}
            </div>
            {/* <div className="flex items-center space-x-2">
              <Checkbox 
                id="remember" 
                className="data-[state=checked]:bg-blue-600"
                checked={formData.remember}
                onCheckedChange={handleCheckboxChange}
              />
              <Label htmlFor="remember" className="text-sm font-medium leading-none ">
                Remember me
              </Label>
            </div> */}
          </CardContent>
          <CardFooter className="flex flex-col mt-4">
            <Button
              className={`${isSubmitting && `dis`} w-full`}
              size="lg"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Logging in..." : "Log in"}
            </Button>
            <p className="mt-4 text-center text-sm text-gray-400">
              Don't have an account?{" "}
              <Link href="../account/signup" className="font-medium text-blue-400 hover:text-blue-300">
                Sign up
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}