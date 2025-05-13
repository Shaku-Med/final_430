import React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface TeamMember {
  id: string;
  name: string;
  role: string;
  socialLinks: {
    linkedin?: string;
    twitter?: string;
    instagram?: string;
  };
}

const Team: React.FC = () => {
  const teamMembers: TeamMember[] = [
    { 
      id: "mohamed-amara", 
      name: "Mohamed Amara", 
      role: "Full Stack Developer",
      socialLinks: {
        linkedin: "https://linkedin.com/in/mohamed-amara",
        twitter: "https://twitter.com/mohamed_amara",
        instagram: "https://instagram.com/mohamed_amara"
      }
    },
    { 
      id: "joe-he", 
      name: "Joe He", 
      role: "UI Design & QA",
      socialLinks: {
        linkedin: "https://linkedin.com/in/joe-he",
        twitter: "https://twitter.com/joe_he",
        instagram: "https://instagram.com/joe_he"
      }
    },
    { 
      id: "salim-noma", 
      name: "Salim Noma", 
      role: "Feature Integration & Documentation",
      socialLinks: {
        linkedin: "https://linkedin.com/in/salim-noma",
        twitter: "https://twitter.com/salim_noma",
        instagram: "https://instagram.com/salim_noma"
      }
    },
    { 
      id: "idris-hassan", 
      name: "Idris Hassan", 
      role: "Backend Developer",
      socialLinks: {
        linkedin: "https://linkedin.com/in/idris-hassan",
        twitter: "https://twitter.com/idris_hassan",
        instagram: "https://instagram.com/idris_hassan"
      }
    },
  ];

  return (
    <section className="w-full py-16 md:py-24 lg:py-32 bg-card/50" id="team">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-6 text-center">
          <div className="space-y-3">
            <h2 className="text-3xl font-bold tracking-tight md:text-5xl">Our Team</h2>
            <p className="max-w-2xl text-muted-foreground md:text-lg mx-auto">
              Meet the talented individuals behind CS Events Spotlight
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mt-12">
          {teamMembers.map((member) => (
            <Link href={`/team/${member.id}`} key={member.id} passHref legacyBehavior>
              <a className="block group cursor-pointer">
                <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg h-full">
                  <CardHeader className="flex flex-col items-center pb-2">
                    <Avatar className="h-24 w-24 border-4 border-primary/10">
                      <AvatarFallback className="bg-primary/10 text-primary text-xl font-medium">
                        {member.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                  </CardHeader>
                  <CardContent className="text-center">
                    <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">{member.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{member.role}</p>
                  </CardContent>
                  <CardFooter className="flex justify-center pt-0" onClick={(e) => e.stopPropagation()}>
                    <div className="flex gap-4">
                      {member.socialLinks.linkedin && (
                        <a href={member.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="rounded-full p-2 hover:bg-primary/10 transition-colors">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                            <rect x="2" y="9" width="4" height="12"></rect>
                            <circle cx="4" cy="4" r="2"></circle>
                          </svg>
                        </a>
                      )}
                      {member.socialLinks.twitter && (
                        <a href={member.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="rounded-full p-2 hover:bg-primary/10 transition-colors">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
                          </svg>
                        </a>
                      )}
                      {member.socialLinks.instagram && (
                        <a href={member.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="rounded-full p-2 hover:bg-primary/10 transition-colors">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                            <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                          </svg>
                        </a>
                      )}
                    </div>
                  </CardFooter>
                </Card>
              </a>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Team;