import React, { useState, useLayoutEffect } from 'react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import Link from 'next/link';

const CTA: React.FC = () => {
  const [userProfile, setUserProfile] = useState<any>(null);

  useLayoutEffect(() => {
    const profile = (window as any)._profile;
    if (profile) {
      try {
        const parsedProfile = typeof profile === 'string' ? JSON.parse(profile) : profile;
        setUserProfile(parsedProfile);
      } catch (error) {
        console.error('Error parsing profile data:', error);
      }
    }
  }, []);

  const displayName = userProfile ? (userProfile.name || `${userProfile.firstname} ${userProfile.lastname}`) : '';

  return (
    <section className="w-full py-16 md:py-24 lg:py-32 bg-muted/70 ">
      <div className="container mx-auto px-4 md:px-6 relative overflow-hidden">
        <div className="absolute top-0 -left-24 w-full h-full bg-card/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-full h-full bg-card/10 rounded-full blur-3xl" />
        
        <motion.div 
          className="flex flex-col items-center justify-center space-y-8 text-center relative z-10"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
        >
          <div className="space-y-4 max-w-3xl">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              viewport={{ once: true }}
            >
              <span className="px-3 py-1 text-xs font-medium text-foreground rounded-full border border-zinc-700/50 inline-block mb-4">
                {userProfile ? `Welcome back, ${displayName}` : 'Join Our Community'}
              </span>
            </motion.div>
            
            <motion.h2 
              className="text-3xl md:text-5xl font-bold tracking-tight"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              viewport={{ once: true }}
            >
              {userProfile ? 'Ready to Continue Your Journey?' : 'Ready to Explore CS Events?'}
            </motion.h2>
            
            <motion.p 
              className="max-w-[700px] text-muted-foreground md:text-xl/relaxed mx-auto"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              viewport={{ once: true }}
            >
              {userProfile 
                ? 'Access your personalized dashboard to manage events, projects, and stay connected with the community.'
                : 'Stay connected with department activities, networking opportunities, and exclusive tech events throughout the academic year.'}
            </motion.p>
          </div>
          
          <motion.div 
            className="flex flex-col sm:flex-row gap-4 w-full max-w-md mx-auto items-center justify-center"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            viewport={{ once: true }}
          >
            {userProfile ? (
              <Link href="/dashboard" className="w-fit">
                <Button 
                  size="lg" 
                  className="font-medium rounded-full relative overflow-hidden group w-fit"
                >
                  <span className="absolute inset-0 w-full h-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                  <span className="relative z-10 flex items-center justify-center">
                    Go to Dashboard
                    <svg className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </span>
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/account/signup" className="w-fit">
                  <Button 
                    size="lg" 
                    className="font-medium rounded-full relative overflow-hidden group w-fit"
                  >
                    <span className="absolute inset-0 w-full h-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                    <span className="relative z-10 flex items-center justify-center">
                      Sign Up Now
                      <svg className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </span>
                  </Button>
                </Link>
                
                <Link href="/about" className="w-fit">
                  <Button 
                    size="lg" 
                    variant="secondary" 
                    className="font-medium rounded-full w-fit"
                  >
                    Learn More
                  </Button>
                </Link>
              </>
            )}
          </motion.div>
          
          {!userProfile && (
            <motion.div 
              className="pt-8 w-full max-w-md mx-auto"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              viewport={{ once: true }}
            >
              <p className="text-sm text-muted-foreground">
                Already a member? <Link href="/account/login" className="text-foreground/80 hover:text-foreground underline underline-offset-4">Log in here</Link>
              </p>
            </motion.div>
          )}
        </motion.div>
      </div>
    </section>
  );
};

export default CTA;