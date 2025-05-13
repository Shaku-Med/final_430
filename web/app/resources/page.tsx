'use client';

import React, { useState } from 'react';
import { 
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Download, ExternalLink, FileText, Video, Code, BookOpen, ArrowRight } from 'lucide-react';
import Footer from '../Home/Footer/Footer';
import Nav from '../Home/Nav/Nav';
import Logo from '../Home/Icons/Logo';

const RESOURCE_CATEGORIES = [
  'All',
  'Tutorials',
  'Documentation',
  'Tools',
  'Code Samples',
  'Videos',
  'Articles'
];

const RESOURCES = [
  {
    id: 1,
    title: 'Getting Started with Supabase',
    description: 'Learn how to set up Supabase for your CSI Spotlight projects',
    category: 'Tutorials',
    type: 'Documentation',
    link: '/resources/supabase-tutorial',
    icon: <FileText className="h-5 w-5" />,
    downloadable: true
  },
  {
    id: 2,
    title: 'Event Management API Guide',
    description: 'Complete documentation on the event management API endpoints',
    category: 'Documentation',
    type: 'API Reference',
    link: '/resources/api-guide',
    icon: <Code className="h-5 w-5" />,
    downloadable: true
  },
  {
    id: 3,
    title: 'UI Component Library',
    description: 'Collection of reusable UI components for CSI Spotlight projects',
    category: 'Tools',
    type: 'Code Repository',
    link: 'https://github.com/csi-spotlight/component-library',
    icon: <Code className="h-5 w-5" />,
    external: true
  },
  {
    id: 4,
    title: 'Building Your First CS Project',
    description: 'Video tutorial on creating and submitting your first CS project',
    category: 'Videos',
    type: 'Tutorial',
    link: '/resources/first-project-video',
    icon: <Video className="h-5 w-5" />
  },
  {
    id: 5,
    title: 'Event Management Best Practices',
    description: 'Guidelines for organizing and managing CS department events',
    category: 'Articles',
    type: 'Guide',
    link: '/resources/event-best-practices',
    icon: <BookOpen className="h-5 w-5" />,
    downloadable: true
  },
  {
    id: 6,
    title: 'Project Submission Templates',
    description: 'Ready-to-use templates for different types of CS projects',
    category: 'Tools',
    type: 'Templates',
    link: '/resources/project-templates',
    icon: <FileText className="h-5 w-5" />,
    downloadable: true
  },
  {
    id: 7,
    title: 'NextJS Authentication Example',
    description: 'Example code for implementing authentication in NextJS apps',
    category: 'Code Samples',
    type: 'Code',
    link: '/resources/nextjs-auth-example',
    icon: <Code className="h-5 w-5" />
  },
  {
    id: 8,
    title: 'Supabase Database Schema',
    description: 'Reference documentation for the CSI Spotlight database schema',
    category: 'Documentation',
    type: 'Technical Spec',
    link: '/resources/database-schema',
    icon: <FileText className="h-5 w-5" />,
    downloadable: true
  },
  {
    id: 9,
    title: 'Effective Project Presentations',
    description: 'Tips for presenting your CS projects effectively',
    category: 'Articles',
    type: 'Guide',
    link: '/resources/presentation-tips',
    icon: <BookOpen className="h-5 w-5" />
  },
  {
    id: 10,
    title: 'Creating Interactive Project Demos',
    description: 'Video tutorial on building interactive demos for your projects',
    category: 'Videos',
    type: 'Tutorial',
    link: '/resources/interactive-demos-video',
    icon: <Video className="h-5 w-5" />
  }
];

const ResourcesPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const filteredResources = RESOURCES.filter(resource => {
    const matchesSearch = resource.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          resource.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === 'All' || resource.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <>
        <Nav/>
        <div className="max-w-7xl mt-10 mx-auto py-10 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 flex flex-col items-center">
        <Logo svgClassName="w-[200px] h-[200px]" pathClassName="fill-foreground"/>

        <h1 className="text-4xl font-bold mb-4">CSI Spotlight Resources</h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Access guides, tools, and documentation to help you make the most of CSI Spotlight
            </p>
        </div>

        <div className="mb-10 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="w-full md:w-64">
            <Input
                type="text"
                placeholder="Search resources..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
            </div>
            
            <Tabs defaultValue="All" className="w-full md:w-auto" onValueChange={setActiveCategory}>
            <TabsList className="flex flex-wrap h-auto">
                {RESOURCE_CATEGORIES.map((category) => (
                <TabsTrigger key={category} value={category} className="px-3 py-1">
                    {category}
                </TabsTrigger>
                ))}
            </TabsList>
            </Tabs>
        </div>

        <div className="mb-16">
            <h2 className="text-2xl font-bold mb-6">Featured Resource</h2>
            <Card className="">
            <CardHeader>
                <CardTitle className="text-2xl">CS Events - Complete Developer Guide</CardTitle>
                <CardDescription className="text-lg">
                Comprehensive guide to building applications for CS department events using our platform
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                <div className="space-y-2 mb-4 md:mb-0">
                    <Badge variant="outline" className="text-blue-700 bg-blue-100">
                    Documentation
                    </Badge>
                    <p className="text-muted-foreground mt-2">
                    Learn everything about the CSI Spotlight platform architecture, APIs, and implementation patterns.
                    This guide covers authentication, event management, project submissions, notifications, and more.
                    </p>
                </div>
                <Button className="flex items-center gap-2">
                    <Download className="h-4 w-4" />
                    Download Guide
                </Button>
                </div>
            </CardContent>
            <CardFooter className="flex justify-end">
                <Button variant="link" asChild>
                <Link href="/resources/developer-guide" className="flex items-center gap-1">
                    View Online <ArrowRight className="h-4 w-4" />
                </Link>
                </Button>
            </CardFooter>
            </Card>
        </div>

        {filteredResources.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredResources.map((resource) => (
                <Card key={resource.id} className="flex flex-col h-full">
                <CardHeader>
                    <div className="flex items-start justify-between">
                    <div className="p-2 rounded-lg bg-blue-100 text-blue-700">
                        {resource.icon}
                    </div>
                    <Badge variant="outline">{resource.type}</Badge>
                    </div>
                    <CardTitle className="mt-4">{resource.title}</CardTitle>
                    <CardDescription>{resource.description}</CardDescription>
                </CardHeader>
                <CardFooter className="flex justify-between mt-auto pt-4">
                    <Button variant="outline" asChild>
                    <Link href={resource.link} className="flex items-center gap-2">
                        {resource.external ? (
                        <>External Link <ExternalLink className="h-4 w-4" /></>
                        ) : resource.downloadable ? (
                        <>Download <Download className="h-4 w-4" /></>
                        ) : (
                        <>View Resource <ArrowRight className="h-4 w-4" /></>
                        )}
                    </Link>
                    </Button>
                </CardFooter>
                </Card>
            ))}
            </div>
        ) : (
            <div className="text-center py-10">
            <h3 className="text-xl font-medium text-muted-foreground">No resources found.</h3>
            <p className="mt-2">Try adjusting your search or filter criteria.</p>
            </div>
        )}

        <Card className="mt-16">
            <CardHeader>
            <CardTitle>Request a Resource</CardTitle>
            <CardDescription>
                Don't see what you're looking for? Let us know what resources would help you.
            </CardDescription>
            </CardHeader>
            <CardContent>
            <form className="space-y-4">
                <div>
                <label htmlFor="title" className="block text-sm font-medium mb-1">
                    Resource Title
                </label>
                <Input id="title" placeholder="What resource do you need?" />
                </div>
                <div>
                <label htmlFor="description" className="block text-sm font-medium mb-1">
                    Description
                </label>
                <textarea 
                    id="description" 
                    rows={3} 
                    className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Briefly describe what you're looking for"
                />
                </div>
                <div>
                <label htmlFor="email" className="block text-sm font-medium mb-1">
                    Your Email
                </label>
                <Input id="email" type="email" placeholder="Where should we respond?" />
                </div>
            </form>
            </CardContent>
            <CardFooter>
            <Button>Submit Request</Button>
            </CardFooter>
        </Card>
        </div>
        <Footer/>
    </>
  );
};

export default ResourcesPage;