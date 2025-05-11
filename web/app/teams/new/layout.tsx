import { Metadata } from "next";
import IsAuth from "../../Auth/IsAuth/IsAuth";
import { redirect } from "next/navigation";
import Nav from "@/app/Home/Nav/Nav";
import Footer from "@/app/Home/Footer/Footer";

export const metadata: Metadata = {
  title: {
    default: 'New Team Members',
    template: '%s | New Team Members'
  },
  openGraph: {
    title: 'New Team Members',
    description: 'New Team Members',
  },
}

export default async function TeamLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let auth = await IsAuth()
  if(!auth) {
    return redirect(`/account`)
  }
  return (
    <>
      <Nav/>
      <div className=" pt-21 w-full">
        {children}
      </div>
      <Footer/>
    </>
  );
}
