import { Metadata } from "next";
import IsAuth from "../../Auth/IsAuth/IsAuth";
import { redirect } from "next/navigation";
import Nav from "@/app/Home/Nav/Nav";
import Footer from "@/app/Home/Footer/Footer";

export const metadata: Metadata = {
  title: {
    default: 'New Blog',
    template: '%s | New Blog'
  },
  openGraph: {
    title: 'New Blog',
    description: 'New Blog',
  },
}

export default async function BlogLayout({
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
