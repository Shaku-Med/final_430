import { Metadata } from "next";
import IsAuth from "../Auth/IsAuth/IsAuth";
import { redirect } from "next/navigation";
import { AppSidebar } from "./components/app-sidebar";
import BodyStyle from "./components/BodyStyle";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"

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
      <ResizablePanelGroup direction={`horizontal`} className={`flex h-screen overflow-hidden fixed top-0 left-0 w-full`}>
         <AppSidebar/>
        <ResizablePanel className={` h-full w-full flex justify-between flex-col bg-muted/40`} defaultSize={100 - 20}>
          {children}
        </ResizablePanel>
      </ResizablePanelGroup>
      <BodyStyle/>
    </>
  );
}
