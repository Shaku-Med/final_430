import { NextRequest } from "next/server"
import axios from "axios"
import { cookies } from "next/headers"
import VerifyToken from "@/app/Auth/PageAuth/Action/VerifyToken"

const ErrReturn = (message: object | any, status: number) => {
  try {
    return Response.json({
      message: message,
      status: status
    }, { status: status })
  }
  catch {
    return Response.json({
      message: "You don't have the required privilege to make request to this endpoint.",
      status: 401
    }, { status: 401 })
  }
}

export async function POST(req: NextRequest) {
  try {
    // let c = await cookies()
    // let _athK_ = c?.get(`_athk_`)?.value
    // // 
    // let vrToken = await VerifyToken(`${_athK_}`)
    // if(!vrToken) return ErrReturn(`Access Denied`, 401)

    const body = await req.json()
    const { code } = body

    if (!code) {
      return ErrReturn("Authorization code is required", 400)
    }

    const clientId = process.env.GITHUB_CLIENT_ID
    const clientSecret = process.env.GITHUB_CLIENT_SECRET

    if (!clientId || !clientSecret) {
      return ErrReturn("Server configuration error", 500)
    }

    const tokenResponse = await axios.post(
      "https://github.com/login/oauth/access_token",
      {
        client_id: clientId,
        client_secret: clientSecret,
        code
      },
      {
        headers: {
          Accept: "application/json"
        }
      }
    )

    if (tokenResponse.data.error) {
      return ErrReturn(tokenResponse.data.error_description || "Authentication failed", 400)
    }

    const accessToken = tokenResponse.data.access_token

    const userResponse = await axios.get("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    })
    
    const emailResponse = await axios.get("https://api.github.com/user/emails", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })
    
    
    const primaryEmail = emailResponse.data.find((email: any) => email.primary)?.email || null

    return Response.json({
      ...userResponse.data,
      email: primaryEmail
    }, { status: 200 })
  } catch (error: any) {
    console.log(error.message)
    return ErrReturn(error.message || "Internal server error", 500)
  }
}