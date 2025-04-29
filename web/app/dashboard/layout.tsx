import { Metadata } from "next";
import IsAuth from "../Auth/IsAuth/IsAuth";
import { redirect } from "next/navigation";
import { AppSidebar } from "./components/app-sidebar";
import BodyStyle from "./components/BodyStyle";

export const metadata: Metadata = {
  title: 'Welcome to dashboard',
  openGraph: {
    title: 'Acme',
    description: 'Acme is a...',
  },
}

export default async function Layout({
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
      <div className={`flex h-screen overflow-hidden fixed top-0 left-0 w-full`}>
        <AppSidebar/>
        {children}
      </div>
      <BodyStyle/>
    </>
  );
}
