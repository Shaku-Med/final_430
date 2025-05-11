import IsAuth from "@/app/Auth/IsAuth/IsAuth";
import { Metadata } from "next";
import { redirect } from "next/navigation";
export const metadata: Metadata = {
  title:{
    default: `Events`,
    template: `%s | Events`,
  },
  openGraph: {
    title: 'Acme',
    description: 'Acme is a...',
  },
}

export default async function EventsLayout({
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
