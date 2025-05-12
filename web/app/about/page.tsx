'use client';

import { motion } from 'framer-motion';
import { GraduationCap, Users, Calendar, BookOpen, Lightbulb, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Nav from "@/app/Home/Nav/Nav";
import Footer from "@/app/Home/Footer/Footer";
import Logo from "@/app/Home/Icons/Logo";
import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-background to-background/95">
      <Nav />
      <div className="container mx-auto py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section with glass morphism */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-20 relative"
          >
            <div className="absolute inset-0 bg-primary/5 rounded-3xl blur-3xl -z-10"></div>
            <div className="flex justify-center mb-8">
              <div className="flex items-center gap-2 group">
                <Logo svgClassName="w-16 h-16 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3" pathClassName="fill-foreground"/>
                <div className="flex items-center gap-1">
                  <span className="font-bold text-3xl bg-gradient-to-r from-primary via-primary/80 to-foreground bg-clip-text text-transparent">
                    SpotLight
                  </span>
                  <Lightbulb size={18} className="text-primary transition-all duration-500 group-hover:text-yellow-400 group-hover:animate-pulse"/>
                </div>
              </div>
            </div>
            <h1 className="scroll-m-20 text-5xl font-bold tracking-tight lg:text-6xl mb-6 bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/80">
              Learning that actually works
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Not just another education platform. A space where your learning journey feels natural, intuitive, and tailored just for you.
            </p>
          </motion.div>

          {/* Main Content */}
          <div className="space-y-16">
            {/* Our Story */}
            <motion.section
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="overflow-hidden border-none shadow-lg bg-gradient-to-br from-background via-background/95 to-background rounded-2xl">
                <CardHeader className="pb-4">
                  <CardTitle className="text-2xl font-semibold">Our Story</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="leading-7 [&:not(:first-child)]:mt-6 text-muted-foreground">
                    We started SpotLight with a simple frustration: why is online learning so... boring? 
                    Traditional education wasn't cutting it in the digital world. So we asked ourselves: "What if 
                    learning felt less like a chore and more like discovery?" That question sparked something.
                  </p>
                  <p className="leading-7 mt-4 text-muted-foreground">
                    Fast forward to today—we've built a space where education breaks free from rigid structures. 
                    Where your learning journey adapts to you, not the other way around. No more one-size-fits-all. 
                    Just education that actually gets you.
                  </p>
                </CardContent>
              </Card>
            </motion.section>

            {/* Features Grid - Redesigned with overlapping elements */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="relative"
              >
                <div className="absolute -inset-1 bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl blur -z-10"></div>
                <Card className="bg-background/80 backdrop-blur border-none shadow-md h-full">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-primary/10">
                        <GraduationCap className="h-6 w-6 text-primary" />
                      </div>
                      <CardTitle className="text-xl">Smart Learning</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base text-muted-foreground">
                      Learning that adapts to you—not the other way around. Our system learns how you learn, 
                      making sure you're never bored or overwhelmed.
                    </CardDescription>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="relative"
              >
                <div className="absolute -inset-1 bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl blur -z-10"></div>
                <Card className="bg-background/80 backdrop-blur border-none shadow-md h-full">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-primary/10">
                        <Users className="h-6 w-6 text-primary" />
                      </div>
                      <CardTitle className="text-xl">Real Connections</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base text-muted-foreground">
                      Chat, collaborate, and grow together. Because the best ideas happen when minds connect. 
                      And yes, that includes 2am study sessions.
                    </CardDescription>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="relative"
              >
                <div className="absolute -inset-1 bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl blur -z-10"></div>
                <Card className="bg-background/80 backdrop-blur border-none shadow-md h-full">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-primary/10">
                        <Calendar className="h-6 w-6 text-primary" />
                      </div>
                      <CardTitle className="text-xl">Life-Friendly Schedule</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base text-muted-foreground">
                      We get it—life happens. Our calendar keeps everything in one place, so you can focus on 
                      learning instead of wondering "wait, when was that due again?"
                    </CardDescription>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
                className="relative"
              >
                <div className="absolute -inset-1 bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl blur -z-10"></div>
                <Card className="bg-background/80 backdrop-blur border-none shadow-md h-full">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-primary/10">
                        <BookOpen className="h-6 w-6 text-primary" />
                      </div>
                      <CardTitle className="text-xl">Resources That Matter</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base text-muted-foreground">
                      Quality over quantity. Access materials that actually help you learn, not just pile 
                      up in your downloads folder. Less searching, more finding.
                    </CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Mission Statement - Modern callout */}
            <motion.section
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              <Card className="border-none bg-gradient-to-r from-primary/10 via-background to-primary/10 shadow-xl rounded-2xl overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-2xl -z-10 transform translate-x-16 -translate-y-8"></div>
                <CardHeader>
                  <CardTitle className="text-2xl">What We're About</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="leading-7 [&:not(:first-child)]:mt-6 text-muted-foreground">
                    We're done with education that treats everyone the same. Learning shouldn't be a 
                    one-size-fits-all experience. We're building something different—a place where technology 
                    empowers rather than restricts, where barriers fade away, and where learning feels 
                    natural again.
                  </p>
                  <p className="leading-7 mt-4 text-muted-foreground">
                    Our north star is simple: make learning work for real humans. Not algorithms, not 
                    institutions—you.
                  </p>
                </CardContent>
              </Card>
            </motion.section>

            {/* Call to Action - Modern floating card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="text-center relative"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-background/0 to-primary/20 rounded-3xl blur-xl -z-10"></div>
              <Card className="border-none bg-background/80 backdrop-blur-sm shadow-2xl rounded-2xl overflow-hidden">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-foreground">Join Us</CardTitle>
                  <CardDescription className="text-lg">
                    Ready to experience learning that actually works for you?
                  </CardDescription>
                </CardHeader>
                <CardContent className="pb-8">
                    <Link href={`../dashboard`}>
                        <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-300 transform hover:scale-105 px-8 py-6 rounded-xl font-medium text-base group">
                            <span>Get Started</span>
                            <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                        </Button>
                    </Link>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}