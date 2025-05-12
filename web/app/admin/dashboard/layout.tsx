import { Metadata } from "next";
import VerifyAdmin from "../VerifyF/VerifyAdmin";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: {
    default: 'Admin Panel',
    template: '%s | Spotlight'
  },
  openGraph: {
    title: 'Admin Panel',
    description: 'This is the admin panel for the Spotlight application.',
  },
}

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let va = await VerifyAdmin()
  if(!va) return redirect(`/admin/access`)
    
  return (
    <>
        {children}
    </>
  );
}
