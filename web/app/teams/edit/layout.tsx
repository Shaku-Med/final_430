import { Metadata } from "next";
import Nav from "@/app/Home/Nav/Nav";
import Footer from "@/app/Home/Footer/Footer";

export const metadata: Metadata = {
  title: {
    default: 'Private Edit',
    template: '%s | spotlight'
  },
  openGraph: {
    title: 'Private Edit',
    description: 'spotlight',
  },
}

export default async function TeamLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
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
