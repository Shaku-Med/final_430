import { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: `User Profile`,
    template: `Profile`
  }
}

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
    </>
  );
} 