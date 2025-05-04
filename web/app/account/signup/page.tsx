"use client"

import { useState } from "react"
import Link from "next/link"
import { Eye, EyeOff, Github, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import ExternalAuth from "@/app/dashboard/@auth/Components/ExternalAuth/ExternalAuth"
import Verification from "@/app/dashboard/@auth/Components/Verification"
import * as device from 'react-device-detect'
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import Head from "@/app/dashboard/@auth/Components/Headers/Head"
import SetQuickToken from "../Actions/SetQuickToken"
import LoginSignup from "../Actions/LoginSignup"
// 
export default function SignupPage() {
  const nav = useRouter()
  // 
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: ""
  })
  const [errors, setErrors] = useState<any>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: ""
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

  const validateField = (field: any, value: any) => {
    switch (field) {
      case "firstName":
        return value.trim() ? "" : "First name is required"
      case "lastName":
        return value.trim() ? "" : "Last name is required"
      case "email":
        return Verification({
          email: {
            required: true,
            text: value
          },
          returnBoolean: false
        }) || ""
      case "password":
        return Verification({
          password: {
            required: true,
            text: value,
            minLength: 8,
            requireUppercase: true,
            requireLowercase: true,
            requireNumbers: true,
            requireSpecialChars: true,
          },
          returnBoolean: false
        }) || ""
      case "confirmPassword":
        return Verification({
          confirmPassword: {
            required: true,
            text: value,
            matchWith: formData.password
          },
          returnBoolean: false
        }) || ""
      default:
        return ""
    }
  }

  const validateForm = () => {
    const newErrors = {
      firstName: validateField("firstName", formData.firstName),
      lastName: validateField("lastName", formData.lastName),
      email: validateField("email", formData.email),
      password: validateField("password", formData.password),
      confirmPassword: validateField("confirmPassword", formData.confirmPassword)
    }

    setErrors(newErrors)
    return !Object.values(newErrors).some(error => error !== "")
  }

  const handleSubmit = async (e: any) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    if (validateForm()) {
      let newWindow: any = window
      // 
      let setSession = await SetQuickToken()
      // 
      if(!setSession){
        toast.error(`Sorry! we had toubles creating your account. Try refreshing and try again.`)
        setIsSubmitting(false)
        return;
      }
      // 
      let ls = await LoginSignup({
        firstname: formData.firstName,
        lastname: formData.lastName,
        email: formData.email,
        password: formData.password,
        device: JSON.stringify(device),
        token: newWindow?.session_ID,
        // account_type: 'normal'
      }, true)
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
          // else {
          //   nav.push(`/dashboard/${ls?.action}`)
          // }
        }
      }
    }
    
    setIsSubmitting(false)
    return;
  }

  return (
    <>
      <Head/>
    
      <div className="flex min-h-screen items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md relative z-10 bg-card/70 backdrop-blur-md shadow-xl">
          <CardHeader className="space-y-4">
            <div className="flex justify-center">
            <img className={`w-20`} src={`../../../../icons/web/icon-512.png`} alt="logo"/>
            </div>
            <CardTitle className="text-2xl text-center font-bold ">Create an account</CardTitle>
            <CardDescription className="text-center ">
              Enter your information to create an account
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
                  <span className=" px-2  bg-card shadow-sm rounded-md">Or continue with</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-foreground/70">
                    First name
                  </Label>
                  <Input
                    id="firstName"
                    placeholder="John"
                    required
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className={`placeholder:text-gray-500 ${errors.firstName ? "border-red-500" : ""}`}
                  />
                  {errors.firstName && <p className="text-xs text-red-500">{errors.firstName}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-foreground/70">
                    Last name
                  </Label>
                  <Input
                    id="lastName"
                    placeholder="Doe"
                    required
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className={`placeholder:text-gray-500 ${errors.lastName ? "border-red-500" : ""}`}
                  />
                  {errors.lastName && <p className="text-xs text-red-500">{errors.lastName}</p>}
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
                  className={`placeholder:text-gray-500 ${errors.email ? "border-red-500" : ""}`}
                />
                {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-foreground/70">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`${errors.password ? "border-red-500" : ""}`}
                    placeholder="●●●●●●●●"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 py-2 bg-transparent"
                    onClick={togglePasswordVisibility}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    <span className="sr-only">{showPassword ? "Hide password" : "Show password"}</span>
                  </Button>
                </div>
                {errors.password ? (
                  <p className="text-xs text-red-500">{errors.password}</p>
                ) : (
                  <p className="text-xs mt-1">Password must be at least 8 characters long with uppercase, lowercase, and numbers</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-foreground/70">
                  Confirm Password
                </Label>
                <Input 
                  id="confirmPassword" 
                  type="password" 
                  required 
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className={`${errors.confirmPassword ? "border-red-500" : ""}`}
                  placeholder="●●●●●●●●" 
                />
                {errors.confirmPassword && <p className="text-xs text-red-500">{errors.confirmPassword}</p>}
              </div>
            </CardContent>
            <CardFooter className="flex flex-col mt-4">
              <Button
                className={`${isSubmitting && `dis`} w-full`}
                size="lg"
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Creating account..." : "Create account"}
              </Button>
              <p className="mt-4 text-center text-sm ">
                Already have an account?{" "}
                <Link href="../account" className="font-medium text-blue-400 hover:text-blue-300">
                Log in
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </>
  )
}