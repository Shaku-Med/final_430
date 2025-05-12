'use client'
import React, { useState, useEffect } from 'react';
import { BookmarkCheck, CalendarIcon, TrendingDown, ChevronRight, Code, Users } from "lucide-react";
import { motion } from 'motion/react';

interface Feature {
  id: number;
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
}

const KFeatures: React.FC = () => {
  const [activeFeature, setActiveFeature] = useState<number>(1);
  const [isVisible, setIsVisible] = useState<boolean>(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.2 }
    );

    const element = document.getElementById('features');
    if (element) observer.observe(element);

    return () => {
      if (element) observer.unobserve(element);
    };
  }, []);

  const features: Feature[] = [
    {
      id: 1,
      icon: <CalendarIcon className="h-6 w-6" />,
      title: "Event Management",
      description: "Create, update, and manage CS department events with ease. Set reminders and share with your peers.",
      color: "bg-blue-500"
    },
    {
      id: 2,
      icon: <TrendingDown className="h-6 w-6" />,
      title: "Project Showcase",
      description: "Highlight your projects and get inspired by others' work. Get feedback from peers and instructors.",
      color: "bg-purple-500"
    },
    {
      id: 3,
      icon: <BookmarkCheck className="h-6 w-6" />,
      title: "Notifications",
      description: "Subscribe to events and receive real-time updates on changes. Never miss important department news.",
      color: "bg-green-500"
    },
    {
      id: 4,
      icon: <Code className="h-6 w-6" />,
      title: "Code Collaboration",
      description: "Share code snippets, collaborate on projects and get help from the CS community.",
      color: "bg-red-500"
    },
    {
      id: 5,
      icon: <Users className="h-6 w-6" />,
      title: "Community Forums",
      description: "Connect with peers, alumni, and professors in topic-focused discussion groups.",
      color: "bg-amber-500"
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1
    }
  };

  return (
    <section className="w-full py-16 md:py-24 lg:py-32" id="features">
      <div className="container mx-auto px-4 md:px-6">
        <motion.div 
          className="flex flex-col items-center justify-center space-y-4 text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5 }}
        >
          <div className="space-y-2">
            <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
              Features
            </span>
            <h2 className="text-4xl font-bold tracking-tighter md:text-5xl">Key Features</h2>
            <p className="max-w-[700px] text-muted-foreground md:text-xl/relaxed">
              Everything you need to stay connected with CS department activities
            </p>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <motion.div 
            className="lg:col-span-5 space-y-4"
            initial="hidden"
            animate={isVisible ? "visible" : "hidden"}
            variants={containerVariants}
          >
            {features.map((feature) => (
              <motion.div
                key={feature.id}
                variants={itemVariants}
                className={`flex items-center p-4 border rounded-xl cursor-pointer transition-all duration-300 ${
                  activeFeature === feature.id 
                  ? "bg-muted/60 shadow-lg border-l-4 border-blue-500 dark:border-blue-400" 
                  : "hover:bg-muted/60 hover hover:shadow-md"
                }`}
                onClick={() => setActiveFeature(feature.id)}
              >
                <div className={`${feature.color} p-3 rounded-lg text-white text-foreground mr-4`}>
                  {feature.icon}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{feature.title}</h3>
                  <p className={`text-sm text-muted-foreground ${activeFeature === feature.id ? "block" : "hidden lg:block" }`}>
                    {feature.description.split('.')[0]}.
                  </p>
                </div>
                <ChevronRight className={`h-5 w-5 text-muted-foreground transition-transform ${activeFeature === feature.id ? "rotate-90" : ""}`} />
              </motion.div>
            ))}
          </motion.div>

          <motion.div 
            className="lg:col-span-7 relative border h-full min-h-[400px] bg-secondary/50 rounded-2xl overflow-hidden shadow-xl"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={isVisible ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            {features.map((feature) => (
              <div 
                key={feature.id}
                className={`absolute inset-0 w-full h-full transition-opacity duration-300 flex flex-col items-center justify-center p-8 ${
                  activeFeature === feature.id ? "opacity-100" : "opacity-0 pointer-events-none"
                }`}
              >
                <div className={`${feature.color} p-6 rounded-full text-white mb-6`}>
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-bold mb-4">{feature.title}</h3>
                <p className="text-center text-muted-foreground max-w-md">
                  {feature.description}
                </p>
                <button className="mt-6 px-6  text-white py-2 bg-blue-500 hover:bg-blue-600 text-foreground rounded-lg flex items-center transition-all">
                  Learn more <ChevronRight className="ml-2 h-4 w-4" />
                </button>
              </div>
            ))}
          </motion.div>
        </div>

        <div className="mt-16 grid grid-cols-3 gap-4 max-w-3xl mx-auto">
          <div className="col-span-3 border sm:col-span-1 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg text-center">
            <div className="font-bold text-3xl text-blue-600 dark:text-blue-400">15+</div>
            <div className="text-sm text-muted-foreground dark:text-muted-foreground">Monthly Events</div>
          </div>
          <div className="col-span-3 border sm:col-span-1 bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg text-center">
            <div className="font-bold text-3xl text-purple-600 dark:text-purple-400">200+</div>
            <div className="text-sm text-muted-foreground dark:text-muted-foreground">Active Users</div>
          </div>
          <div className="col-span-3 border sm:col-span-1 bg-green-50 dark:bg-green-900/20 p-4 rounded-lg text-center">
            <div className="font-bold text-3xl text-green-600 dark:text-green-400">85%</div>
            <div className="text-sm text-muted-foreground dark:text-muted-foreground">User Engagement</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default KFeatures;