'use client'
import React, { useLayoutEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Linkedin, Twitter, Instagram, Github, Link2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface TeamMember {
  id: string;
  name: string;
  role: string;
  description: string;
  expertise: string[];
  information: string;
  user_id: string;
  attachments: any[];
  socialLinks: { platform: string; url: string }[];
}

const Team: React.FC = () => {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);

  useLayoutEffect(() => {
    const team_members = (window as any)._team_members;
    if (team_members) {
      try {
        const parsedTeamMembers = typeof team_members === 'string' ? JSON.parse(team_members) : team_members;
        setTeamMembers(parsedTeamMembers);
      } catch (error) {
        console.error('Error parsing team members data:', error);
      }
    }
  }, []);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 12
      }
    }
  };

  const headerVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  // Function to get the appropriate social icon
  const getSocialIcon = (platform: string) => {
    switch (platform) {
      case 'linkedin':
        return <Linkedin className="w-5 h-5" />;
      case 'twitter':
        return <Twitter className="w-5 h-5" />;
      case 'instagram':
        return <Instagram className="w-5 h-5" />;
      case 'github':
        return <Github className="w-5 h-5" />;
      default:
        return <Link2 className="w-5 h-5" />;
    }
  };

  return (
    <>
    {
      teamMembers.length > 0 && (
        <section className="w-full py-16 md:py-24 lg:py-32 bg-gradient-to-b from-background to-background/90" id="team">
          <div className="container mx-auto px-4 md:px-6">
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              variants={headerVariants}
              className="flex flex-col items-center justify-center space-y-8 text-center"
            >
              <div className="space-y-3">
                <h2 className="text-3xl font-bold tracking-tight md:text-5xl bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
                  Our Team
                </h2>
                <p className="max-w-2xl text-muted-foreground md:text-lg mx-auto">
                  Meet the talented individuals behind CS Events Spotlight
                </p>
              </div>
            </motion.div>
            
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.1 }}
              className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 mt-16"
            >
              {teamMembers.map((member) => (
                <motion.div key={member.id} variants={itemVariants}>
                  <Link href={`/teams/${member.user_id}`} className="block group">
                    <Card className="overflow-hidden border border-border/50 backdrop-blur-sm bg-background/80 hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 cursor-pointer h-full">
                      <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <CardHeader className="flex flex-col items-center pb-2">
                        <motion.div 
                          whileHover={{ y: -5 }}
                          transition={{ type: "spring", stiffness: 300 }}
                        >
                          <Avatar className="h-28 w-28 border-4 border-primary/20 group-hover:border-primary/40 transition-all duration-300 shadow-lg">
                            <AvatarFallback className="bg-primary/10 text-primary text-2xl font-medium">
                              {member.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                        </motion.div>
                      </CardHeader>
                      <CardContent className="text-center">
                        <h3 className="font-bold text-xl group-hover:text-primary transition-colors">
                          {member.name}
                        </h3>
                        <p className="text-sm text-primary/70 font-medium mt-1">
                          {member.role}
                        </p>
                      </CardContent>
                      <CardFooter className="flex justify-center pt-4" onClick={(e) => e.stopPropagation()}>
                        <div className="flex gap-2">
                          {member.socialLinks.map((link) => 
                            link.url && (
                              <motion.a 
                                key={link.platform}
                                href={link.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="rounded-full p-2 hover:bg-primary/10 hover:text-primary transition-all duration-300"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                              >
                                {getSocialIcon(link.platform)}
                              </motion.a>
                            )
                          )}
                        </div>
                      </CardFooter>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>
      )
    }
    </>
  );
};

export default Team;