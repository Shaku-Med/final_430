'use client'

import React from 'react'
import Link from 'next/link'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Github, Linkedin, Twitter, Link2, Edit } from "lucide-react"
import { motion } from "framer-motion"
import dynamic from 'next/dynamic'
import Attachments from '@/app/components/Attachments/Attachments'

const Markdown = dynamic(() => import('@uiw/react-md-editor').then(mod => mod.default.Markdown), { ssr: false })

interface Data {
  id: string;
  name: string;
  role: string;
  description: string;
  expertise: string[];
  information: string;
  user_id: string;
  attachments: any[];
  socialLinks: { platform: string; url: string }[];
  users: {
    firstname: string;
    lastname: string;
    profile: string;
  };
  created_at: string;
  updated_at: string;
  isAuth: boolean;
}

const DynamicTeam = ({ data }: { data: Data }) => {
  const getSocialIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'github':
        return <Github className="w-5 h-5" />;
      case 'linkedin':
        return <Linkedin className="w-5 h-5" />;
      case 'twitter':
        return <Twitter className="w-5 h-5" />;
      default:
        return <Link2 className="w-5 h-5" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-5xl mx-auto py-12"
    >
      <div className=" flex lg:flex-row flex-col gap-12">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="lg:col-span-4 flex flex-col items-center lg:items-start"
        >
          <div className="relative mb-6 group">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary/60 to-primary/20 rounded-full blur opacity-70 group-hover:opacity-100 transition duration-500"></div>
            <Avatar className="relative w-48 h-48 border-2 border-background shadow-xl">
              <AvatarImage
                src={data.users?.profile ? JSON.parse(data.users.profile)[0] : ''}
                alt={data.name}
                className="object-cover"
              />
              <AvatarFallback className="text-5xl bg-primary/10 text-primary">
                {data.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
          </div>

          <h1 className="text-4xl font-bold mt-4 mb-2 text-center md:text-left">
            {data.name || `${data.users?.firstname} ${data.users?.lastname}`}
          </h1>
          
          <h2 className="text-xl text-primary mb-6 font-medium text-center md:text-left">
            {data.role}
          </h2>

          <div className="flex items-center gap-3">
            {data.socialLinks && data.socialLinks.length > 0 && (
              <div className="flex gap-3">
                {data.socialLinks.map((link) => (
                  <Button
                    key={link.url}
                    variant="ghost"
                    size="icon"
                    className="rounded-full bg-background hover:bg-primary/10 hover:text-primary transition-all duration-300"
                    onClick={() => window.open(link.url, '_blank', 'noopener,noreferrer')}
                  >
                    {getSocialIcon(link.platform)}
                  </Button>
                ))}
              </div>
            )}
            
            {data.isAuth && (
              <Link href={`/teams/edit`} className="inline-flex">
                <Button 
                  variant="outline"
                  size="sm"
                  className="gap-1 rounded-full border-primary/30 text-primary hover:bg-primary/10 hover:text-primary hover:border-primary transition-all"
                >
                  <Edit className="w-4 h-4" />
                  <span>Edit</span>
                </Button>
              </Link>
            )}
          </div>
          
          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-3">Expertise</h3>
            <div className="flex flex-wrap gap-2">
              {data.expertise.map((skill) => (
                <Badge
                  key={skill}
                  variant="secondary"
                  className="bg-primary/10 hover:bg-primary/20 text-primary transition-all duration-300"
                >
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
          {/* {data.attachments && data.attachments.length > 0 && (
            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-3">Attachments</h3>
              <Attachments attachments={data.attachments} />
            </div>
          )} */}
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="md:col-span-8 space-y-8"
        >
          <div>
            <h3 className="text-2xl font-semibold mb-4 inline-block relative">
              About
              <span className="absolute -bottom-1 left-0 w-1/3 h-0.5 bg-primary"></span>
            </h3>
            <div className="prose dark:prose-invert max-w-none">
              <Markdown source={data.description} />
            </div>
          </div>

          {data.information && (
            <div className=' max-w-[100%] overflow-auto'>
              <h3 className="text-2xl font-semibold mb-4 inline-block relative">
                Additional Information
                <span className="absolute -bottom-1 left-0 w-1/3 h-0.5 bg-primary"></span>
              </h3>
              <div className="prose dark:prose-invert max-w-none">
                <Markdown className='w-full' source={data.information} />
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  )
}

export default DynamicTeam