import { Metadata } from "next";
import IsAuth from "../Auth/IsAuth/IsAuth";
import { redirect } from "next/navigation";
import Nav from "@/app/Home/Nav/Nav";
import Footer from "@/app/Home/Footer/Footer";

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
  let auth = await IsAuth()
  if(!auth) {
    return redirect(`/account`)
  }
  return (
    <>
        {children}
    </>
  );
}
