'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Nav from '../Home/Nav/Nav';
import Footer from '../Home/Footer/Footer';
import Logo from '../Home/Icons/Logo';
import { motion } from 'framer-motion';
const BLOG_POSTS = [
  {
    id: 1,
    title: 'Introducing CSI Spotlight',
    excerpt: 'Learn about our new platform for showcasing CS Department events and projects.',
    author: 'Mohamed Amara',
    date: 'April 25, 2025',
    category: 'Announcements',
    imageUrl: 'https://wallpaperaccess.com/thumb/6247228.jpg',
    slug: 'introducing-csi-spotlight'
  },
  {
    id: 2,
    title: 'How to Submit Your CS Project',
    excerpt: 'A step-by-step guide to submitting your project to the CSI Spotlight platform.',
    author: 'Salim Noma',
    date: 'April 20, 2025',
    category: 'Tutorials',
    imageUrl: 'https://wallpaperaccess.com/thumb/6247228.jpg',
    slug: 'how-to-submit-your-cs-project'
  },
  {
    id: 3,
    title: 'Upcoming CS Department Events',
    excerpt: 'Stay updated with all the exciting events happening in the CS Department this semester.',
    author: 'Idris Hassan',
    date: 'April 15, 2025',
    category: 'Events',
    imageUrl: 'https://wallpaperaccess.com/thumb/6247228.jpg',
    slug: 'upcoming-cs-department-events'
  },
  {
    id: 4,
    title: 'Featured Student Projects of the Month',
    excerpt: 'Check out these outstanding student projects that caught our attention this month.',
    author: 'Joe He',
    date: 'April 10, 2025',
    category: 'Projects',
    imageUrl: 'https://wallpaperaccess.com/thumb/6247228.jpg',
    slug: 'featured-student-projects-of-the-month'
  },
  {
    id: 5,
    title: 'Getting Started with CSI Spotlight: User Guide',
    excerpt: 'Everything you need to know to make the most of the CSI Spotlight platform.',
    author: 'Mohamed Amara',
    date: 'April 5, 2025',
    category: 'Tutorials',
    imageUrl: 'https://wallpaperaccess.com/thumb/6247228.jpg',
    slug: 'getting-started-with-csi-spotlight'
  },
  {
    id: 6,
    title: 'Interview with CS Department Chair',
    excerpt: 'An exclusive interview discussing the future of computer science education.',
    author: 'Salim Noma',
    date: 'April 1, 2025',
    category: 'Interviews',
    imageUrl: 'https://wallpaperaccess.com/thumb/6247228.jpg',
    slug: 'interview-with-cs-department-chair'
  }
];

const CATEGORIES = [
  'All', 'Announcements', 'Tutorials', 'Events', 'Projects', 'Interviews'
];

const BlogPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  const filteredPosts = BLOG_POSTS.filter(post => {
    const matchesCategory = selectedCategory === 'All' || post.category === selectedCategory;
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         post.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });
  
  return (
    <>
    <Nav/>
    <div className="max-w-7xl mt-10 mx-auto py-10 px-4 sm:px-6 lg:px-8">
    <motion.div layoutId='navID' className="text-center mb-12 flex flex-col items-center">
        <Logo svgClassName="w-[200px] h-[200px]" pathClassName="fill-foreground"/>
        <h1 className="text-4xl font-bold mb-4">CSI Spotlight Blog</h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
        News, tutorials, and insights from the Computer Science Department
        </p>
    </motion.div>
    
    <div className="mb-10 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="w-full md:w-64">
        <Input
            type="text"
            placeholder="Search articles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
        />
        </div>
        
        <Tabs defaultValue="All" className="w-full md:w-auto" onValueChange={setSelectedCategory}>
        <TabsList className="flex flex-wrap h-auto">
            {CATEGORIES.map((category) => (
            <TabsTrigger key={category} value={category} className="px-3 py-1">
                {category}
            </TabsTrigger>
            ))}
        </TabsList>
        </Tabs>
    </div>
    
    {filteredPosts.length > 0 && (
        <div className="mb-16">
        <Card className="overflow-hidden">
            <div className="relative h-96 w-full">
            <img 
                src={filteredPosts[0].imageUrl} 
                alt={filteredPosts[0].title}
                className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
            <div className="absolute bottom-0 left-0 p-6 text-white">
                <Badge variant="secondary" className="mb-2">
                {filteredPosts[0].category}
                </Badge>
                <h2 className="text-2xl md:text-3xl font-bold mb-2">{filteredPosts[0].title}</h2>
                <p className="mb-4">{filteredPosts[0].excerpt}</p>
                <div className="flex items-center text-sm">
                <span>{filteredPosts[0].author}</span>
                <span className="mx-2">•</span>
                <span>{filteredPosts[0].date}</span>
                </div>
                <Button asChild className="mt-4">
                <Link href={`/blog/${filteredPosts[0].slug}`}>Read More</Link>
                </Button>
            </div>
            </div>
        </Card>
        </div>
    )}
    
    {filteredPosts.length > 1 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredPosts.slice(1).map((post) => (
            <Card key={post.id} className="overflow-hidden">
            <div className="relative h-48">
                <img 
                src={post.imageUrl} 
                alt={post.title}
                className="object-cover"
                />
            </div>
            <CardHeader className="pt-4 pb-0">
                <Badge variant="outline" className="w-fit mb-2">
                {post.category}
                </Badge>
                <h3 className="text-xl font-bold">{post.title}</h3>
            </CardHeader>
            <CardContent className="py-2">
                <p className="text-muted-foreground">{post.excerpt}</p>
                <div className="flex items-center text-sm text-gray-500 mt-4">
                <span>{post.author}</span>
                <span className="mx-2">•</span>
                <span>{post.date}</span>
                </div>
            </CardContent>
            <CardFooter>
                <Button variant="link" asChild className="px-0">
                <Link href={`/blog/${post.slug}`}>Read More →</Link>
                </Button>
            </CardFooter>
            </Card>
        ))}
        </div>
    ) : filteredPosts.length === 0 ? (
        <div className="text-center py-10">
        <h3 className="text-xl font-medium text-muted-foreground">No blog posts found.</h3>
        <p className="mt-2">Try adjusting your search or filter criteria.</p>
        </div>
    ) : null}
    </div>
    <Footer/>
    </>
  );
};

export default BlogPage;