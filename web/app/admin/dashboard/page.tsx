import React from 'react'
import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { 
  CalendarDays, 
  Briefcase, 
  Users, 
  FileText, 
  MessageSquare, 
  Contact, 
  Smartphone, 
  UserPlus, 
  Logs,
  Mail,
  MailCheck,
  UserPlus2
} from "lucide-react"

const AdminDashboard = () => {
  const menuItems = [
    { 
      title: 'Events', 
      path: '/admin/dashboard/events',
      icon: CalendarDays,
      description: `Manage events and schedules - You can perform a delete`
    },
    { 
      title: 'Projects', 
      path: '/admin/dashboard/projects',
      icon: Briefcase,
      description: `View users projects - You can perform a delete`
    },
    { 
      title: 'Users', 
      path: '/admin/dashboard/users',
      icon: Users,
      description: `Manage user accounts and have the ability to suspend a user's account`
    },
    { 
      title: 'Blogs', 
      path: '/admin/dashboard/blogs',
      icon: FileText,
      description: `Delete a blog post from any users`
    },
    { 
      title: 'Feedbacks', 
      path: '/admin/dashboard/feedbacks',
      icon: MessageSquare,
      description: `View user feedback - You can perform a delete`
    },
    { 
      title: 'Contacts', 
      path: '/admin/dashboard/contacts',
      icon: Contact,
      description: `View user contacts - You can perform a delete`
    },
    { 
      title: 'Devices', 
      path: '/admin/dashboard/devices',
      icon: Smartphone,
      description: `Track and manage devices - You can perform a delete`
    },
    { 
      title: 'Create Team', 
      path: '/admin/dashboard/team',
      icon: UserPlus,
      description: `Create and manage teams - You can perform a delete`
    },
    { 
      title: 'Admin Logs', 
      path: '/admin/dashboard/logs',
      icon: Logs,
      description: `View all actions taken by an admin and who did it.`
    },
    { 
      title: 'Email Users', 
      path: '/admin/dashboard/users/email',
      icon: Mail,
      description: `Send emails to all users and a specific user`
    },
    { 
      title: 'Email Subscribers', 
      path: '/admin/dashboard/subscribers/email',
      icon: MailCheck,
      description: `Send emails to all subscribers and a specific subscriber`
    },
    { 
      title: 'Subscribers', 
      path: '/admin/dashboard/subscribers',
      icon: UserPlus2,
      description: `View all subscribers`
    },
  ]

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold tracking-tight mb-8">Admin Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {menuItems.map((item, index) => (
            <Link 
              key={index}
              href={item.path}
              className="block transition-all hover:scale-105"
            >
              <Card className="h-full">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <item.icon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">{item.title}</CardTitle>
                      <CardDescription>{item.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
