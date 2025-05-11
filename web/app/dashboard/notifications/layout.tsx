import { Metadata } from 'next'

export const metadata: Metadata = {
  title: {
    absolute: "Notifications"
  }
}

export default function NotificationsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
} 