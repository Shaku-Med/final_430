import { Metadata } from "next";
import IsAuth from "../Auth/IsAuth/IsAuth";
import { redirect } from "next/navigation";
import ChatLayout from "./components/ChatLayout";

export const metadata: Metadata = {
  title: {
    default: "Chat",
    template: "%s - Chat"
  },
  description: "Real-time chat application with advanced features"
};

export default async function ChatLay({
  children,
}: {
  children: React.ReactNode;
}) {
  const isAuthenticated = await IsAuth();
  
  if (!isAuthenticated) {
    redirect("/account/login");
  }

  return <ChatLayout>{children}</ChatLayout>;
}
