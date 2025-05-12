import { Metadata } from "next";
import IsAuth from "../Auth/IsAuth/IsAuth";
import { redirect } from "next/navigation";
import Nav from "@/app/Home/Nav/Nav";
import Footer from "@/app/Home/Footer/Footer";
import SetToken, { getClientIP } from "../Auth/IsAuth/SetToken";
import { EncryptCombine } from "../Auth/Lock/Combine";
import { headers } from "next/headers";

export const metadata: Metadata = {
  title: {
    default: 'Admin',
    template: '%s | Admin'
  },
  openGraph: {
    title: 'Admin',
    description: 'Admin',
  },
}

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let h = await headers()
  let auth: any = await IsAuth(true)
  let sign_inToken: string | null = null;

  if(!auth) {
    return redirect(`/account`)
  }

  if (auth) {
    let k: string[] = [`${process.env.ADMIN_TOKEN_1}`, `${process.env.ADMIN_TOKEN_2}`];
    sign_inToken = EncryptCombine(JSON.stringify({
      user_id: auth.user_id,
      ip: await getClientIP(h),
      ua: h.get('user-agent')?.split('-').join('')
    }), k), {
      expiresIn: '20m',
      algorithm: 'HS512'
    };
  }

  
  return (
    <>
        <Nav/>
         <div className="py-20">
         {children}
         </div>
        <Footer/>
        {
          auth && (
            <script>
              {
                `
                  if(typeof window !== 'undefined') {
                      window._at = '${sign_inToken}';
                  }
                `
              }
            </script>
          )
        }
    </>
  );
}
