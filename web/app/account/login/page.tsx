import { Metadata } from "next"
import Head from "../../dashboard/@auth/Components/Headers/Head"
import Login from "./Login"

export const metadata: Metadata = {
    title: {
        absolute: `Login`
    },
    description: `Login to your account`,
}

let Page = () => {
    return (
        <> 
          <Head/>
         <Login/>
        </>
    )
}

export default Page