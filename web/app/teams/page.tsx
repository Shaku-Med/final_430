'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import Nav from "../Home/Nav/Nav";
import Logo from "../Home/Icons/Logo";
import { Button } from "@/components/ui/button";
import { Loader2, Github, Linkedin, Twitter, Link2 } from "lucide-react";
import Footer from '../Home/Footer/Footer';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface TeamMember {
  id: string;
  name: string;
  role: string;
  image: string;
  description: string;
  expertise: string[];
  created_at: string;
  socialLinks: { url: string; platform: string }[];
  users?: {
    id: string;
    firstname: string;
    lastname: string;
    profile: string;
  };
  user_id: string;
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function TeamPage() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<Pagination>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0
  });

  const fetchTeamMembers = async (page: number = 1) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/team/fetch?page=${page}&limit=10`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch team members');
      }

      setTeamMembers(data.teamMembers);
      setPagination(data.pagination);
      setError(null);
    } catch (err) {
      setError(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeamMembers();
  }, []);

  const handlePageChange = (newPage: number) => {
    fetchTeamMembers(newPage);
  };

  const getSocialIcon = (link: { url: string; platform: string }) => {
    if (link.url.includes('github')) return <Github className="w-5 h-5" />;
    if (link.url.includes('linkedin')) return <Linkedin className="w-5 h-5" />;
    if (link.url.includes('twitter')) return <Twitter className="w-5 h-5" />;
    return <Link2 className="w-5 h-5" />;
  };

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

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/90">
      <Nav/>
      <div className="container mx-auto px-4 py-16">

        {loading ? (
          <div className="flex justify-center items-center h-[60vh]">
            <div className="text-center">
              <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
              <p className="text-muted-foreground">Loading talented team members...</p>
            </div>
          </div>
        ) : error ? (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            className="text-center text-red-500 py-16"
          >
            <p className="text-xl">{error}</p>
            <Button onClick={() => fetchTeamMembers()} className="mt-4 px-6" variant="default">
              Try Again
            </Button>
          </motion.div>
        ) : (
          <>
            {teamMembers.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                className="text-center py-16"
              >
                <h2 className="text-3xl font-semibold mb-2">No Team Members Found</h2>
                <p className="text-muted-foreground">There are currently no team members to display.</p>
              </motion.div>
            ) : (
              <>
                <motion.div 
                  initial="hidden"
                  animate="visible"
                  variants={headerVariants}
                  className="text-center mb-16 flex items-center flex-col gap-4"
                >
                  <motion.h1 
                    className="text-5xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70"
                  >
                    Our Team
                  </motion.h1>
                  <motion.div 
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.8 }}
                  >
                    <Logo svgClassName="w-[120px] h-[120px]" pathClassName="fill-primary"/>
                  </motion.div>
                  <motion.p className="text-xl text-muted-foreground max-w-2xl mx-auto mt-4">
                    Meet the passionate individuals behind our mission to transform education through technology.
                  </motion.p>
                </motion.div>

                <motion.div 
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-2 2xl:grid-cols-2 gap-8"
                >
                  {teamMembers.map((member, index) => (
                    <motion.div key={member.id} variants={itemVariants}>
                      <Link href={`/teams/${member.user_id || member.id}`} className="block">
                        <Card className="group overflow-hidden border border-border/50 backdrop-blur-sm bg-background/80 hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 cursor-pointer h-full">
                          <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                          <CardHeader>
                            <motion.div 
                              className="flex justify-center mb-6"
                              whileHover={{ y: -5 }}
                              transition={{ type: "spring", stiffness: 300 }}
                            >
                              <Avatar className="w-28 h-28 border-4 border-primary/20 group-hover:border-primary/40 transition-all duration-300 shadow-lg">
                                <AvatarImage 
                                  src={(member.users?.profile ? JSON.parse(member.users?.profile)[0] : '') || ''}
                                  alt={member.name} 
                                  className="object-cover"
                                />
                                <AvatarFallback className="text-3xl bg-primary/10 text-primary">
                                  {member.name.split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
                              </Avatar>
                            </motion.div>
                            <CardTitle className="text-center text-xl font-bold">
                              {member.name || `${member.users?.firstname} ${member.users?.lastname}`}
                            </CardTitle>
                            <CardDescription className="text-center text-primary/70 font-medium">
                              {member.role}
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm text-muted-foreground mb-6 text-center line-clamp-3 group-hover:line-clamp-none transition-all duration-300">
                              {member.description}
                            </p>
                            <div className="flex flex-wrap gap-2 justify-center">
                              {member.expertise.map((skill) => (
                                <Badge 
                                  key={skill} 
                                  variant="secondary"
                                  className="bg-primary/10 hover:bg-primary/20 text-primary/80 transition-all duration-300"
                                >
                                  {skill}
                                </Badge>
                              ))}
                            </div>
                          </CardContent>
                          <CardFooter className="flex justify-center gap-2">
                            {member.socialLinks.map((link) => (
                              <Button 
                                key={link.url}
                                variant="ghost" 
                                size="icon"
                                className="rounded-full hover:bg-primary/10 hover:text-primary transition-all duration-300"
                                onClick={(e) => {
                                  e.preventDefault();
                                  window.open(link.url, '_blank', 'noopener,noreferrer');
                                }}
                              >
                                {getSocialIcon(link)}
                              </Button>
                            ))}
                          </CardFooter>
                        </Card>
                      </Link>
                    </motion.div>
                  ))}
                </motion.div>
              </>
            )}

            {pagination.totalPages > 1 && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="flex justify-center gap-2 mt-16"
              >
                <Button
                  variant="outline"
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="group"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform duration-300"><polyline points="15 18 9 12 15 6"></polyline></svg>
                  Previous
                </Button>
                <span className="flex items-center px-4 bg-primary/5 rounded-md text-sm">
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                <Button
                  variant="outline"
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.totalPages}
                  className="group"
                >
                  Next
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300"><polyline points="9 18 15 12 9 6"></polyline></svg>
                </Button>
              </motion.div>
            )}
          </>
        )}
      </div>
      <Footer/>
    </div>
  );
}