import { Metadata } from "next"
import Login from "./login/page"

export const metadata: Metadata = {
    title: {
      absolute: 'Login'
    }
  }
  
let Page = () => {
    return (
        <>
         <Login/>
        </>
    )
}

export default Page