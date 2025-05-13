'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import Nav from '@/app/Home/Nav/Nav';
import Footer from '@/app/Home/Footer/Footer';
import Logo from '@/app/Home/Icons/Logo';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Calendar, User, ArrowRight, Eye, Clock } from 'lucide-react';

interface BlogS {
  id: string;
  title: string;
  excerpt: string;
  imageUrl: any;
  date: string;
  user_id: string;
  users: {
    firstname: string;
    lastname: string;
    name: string;
    profile: string;
  } | null;
}

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

const Pagination = ({ currentPage, totalPages, totalItems, itemsPerPage }: PaginationProps) => {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  
  return (
    <div className="flex flex-col items-center gap-4 mt-16">
      <div className="flex items-center gap-1">
        {pages.map((page) => (
          <Button
            key={page}
            variant={currentPage === page ? "default" : "outline"}
            className={`w-10 h-10 rounded-lg transition-all duration-200 ${
              currentPage === page 
                ? "bg-gradient-to-r from-primary to-primary text-white border-0 shadow-lg shadow-violet-500/25" 
                : ""
            }`}
            onClick={() => {
              window.location.href = `/blog?page=${page}`;
            }}
          >
            {page}
          </Button>
        ))}
      </div>
      <p className="text-sm text-neutral-500">
        Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} articles
      </p>
    </div>
  );
};

interface BlogPageProps {
  BLOG_POSTS: BlogS[];
  pagination: PaginationProps;
}

const BlogPage = ({ BLOG_POSTS, pagination }: BlogPageProps) => {
  const posts = Array.isArray(BLOG_POSTS) ? BLOG_POSTS : [];
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<BlogS[]>([]);
  const [searchPagination, setSearchPagination] = useState<PaginationProps>(pagination);

  // Debounce function
  const debounce = (func: Function, wait: number) => {
    let timeout: NodeJS.Timeout;
    return (...args: any[]) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  };

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce(async (term: string) => {
      // First try local search
      const localResults = posts.filter(post => {
        const matchesSearch = post.title.toLowerCase().includes(term.toLowerCase()) || 
                           post.excerpt.toLowerCase().includes(term.toLowerCase());
        return matchesSearch;
      });

      if (localResults.length > 0) {
        setSearchResults(localResults);
        setSearchPagination(pagination);
        return;
      }

      // If no local results, try API search
      if (term.trim()) {
        setIsSearching(true);
        try {
          const response = await fetch(`/api/blogs/search?q=${encodeURIComponent(term)}`);
          if (!response.ok) throw new Error('Search failed');
          
          const data = await response.json();
          if (data.success) {
            setSearchResults(data.data);
            setSearchPagination(data.pagination);
          }
        } catch (error) {
          console.error('Error searching blogs:', error);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
        setSearchPagination(pagination);
      }
    }, 500), // 500ms delay
    [posts, pagination]
  );

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    debouncedSearch(term);
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const getAuthorName = (post: BlogS) => {
    if (!post.users) return 'Anonymous';
    return post.users.name || `${post.users.firstname || ''} ${post.users.lastname || ''}`.trim() || 'Unknown Author';
  };

  const getImageUrl = (post: BlogS) => {
    if (!post.imageUrl) return null;
    try {
      const parsed = JSON.parse(post.imageUrl);
      return parsed[0] || null;
    } catch {
      return post.imageUrl;
    }
  };

  const fadeInUp = {
    initial: { y: 20, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: -20, opacity: 0 },
    transition: { duration: 0.3 }
  };

  return (
    <>
      <Nav />
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-7xl mx-auto py-20 px-4 sm:px-6 lg:px-8"
      >
        <motion.div 
          layoutId="navID" 
          className="text-center mb-16 flex flex-col items-center"
          initial={{ y: -20 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Logo svgClassName="w-[120px] h-[120px] mb-2" pathClassName="fill-foreground" />
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-primary bg-clip-text text-transparent">
            Tech Spotlight
          </h1>
          <p className="text-lg text-neutral-600 max-w-2xl mx-auto leading-relaxed">
            Discover the latest in computer science, tech trends, and innovative solutions from our expert team
          </p>
        </motion.div>
        
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="mb-12 flex flex-col md:flex-row justify-between items-center gap-4"
        >
          <div className="w-full md:w-96 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-neutral-400" size={20} />
            <Input
              type="text"
              placeholder="Search articles..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-12 h-12 backdrop-blur-sm border-neutral-200 rounded-full focus:ring-2 focus:ring-violet-200 focus:border-violet-300 shadow-sm"
            />
          </div>

          <Link className="w-full md:w-auto cursor-pointer" href="/blog/new">
            <Button className="w-full md:w-auto cursor-pointer bg-gradient-to-r from-primary to-primary hover:from-violet-700 hover:to-indigo-700 transition-all duration-200 border-0 shadow-lg shadow-violet-500/25 rounded-full px-6 h-12">
              Create Article
            </Button>
          </Link>
        </motion.div>
        
        <AnimatePresence>
          {(searchResults.length > 0 || posts.length > 0) && (
            <motion.div 
              className="mb-16"
              variants={fadeInUp}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <Link href={`/blog/${(searchResults[0] || posts[0]).id}`}>
                <Card className="overflow-hidden rounded-2xl p-0 border-0 shadow-xl shadow-neutral-900/10 cursor-pointer group transition-all duration-300 hover:shadow-2xl hover:shadow-violet-500/20">
                  <div className="relative h-[500px] w-full">
                    {getImageUrl(searchResults[0] || posts[0]) && (
                      <>
                        <img 
                          src={getImageUrl(searchResults[0] || posts[0])} 
                          alt={(searchResults[0] || posts[0]).title}
                          className="object-cover object-center h-full w-full transition-transform duration-700 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent" />
                      </>
                    )}
                    <div className="absolute inset-0 p-8 flex flex-col justify-end">
                      <Badge className="mb-3 bg-gradient-to-r from-primary to-primary text-white border-0 rounded-full px-3 py-1 text-xs font-medium self-start">Featured</Badge>
                      <h2 className="text-2xl md:text-4xl font-bold mb-3 leading-tight text-white">{searchResults[0]?.title || posts[0]?.title}</h2>
                      <p className="mb-6 text-neutral-200 text-base md:text-lg line-clamp-2">{searchResults[0]?.excerpt || posts[0]?.excerpt}</p>
                      <div className="flex items-center gap-6 text-sm text-neutral-300">
                        <div className="flex items-center gap-2">
                          <User size={16} />
                          <span>{getAuthorName(searchResults[0] || posts[0])}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar size={16} />
                          <span>{formatDate(searchResults[0]?.date || posts[0]?.date)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock size={16} />
                          <span>5 min read</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
        
        {(searchResults.length > 1 || posts.length > 1) ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(searchResults.length > 0 ? searchResults : posts).slice(1).map((post, index) => (
              <motion.div 
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 * index }}
              >
                <Link href={`/blog/${post.id}`}>
                  <Card className="h-full overflow-hidden p-0 rounded-2xl border-0 transition-all duration-300 hover:shadow-xl shadow-md shadow-neutral-900/10 group cursor-pointer">
                    <div className="relative aspect-[4/3] overflow-hidden">
                      {getImageUrl(post) && (
                        <>
                          <img 
                            src={getImageUrl(post)} 
                            alt={post.title}
                            className="object-cover object-center h-full w-full transition-all duration-500 group-hover:scale-110"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </>
                      )}
                    </div>
                    <CardHeader className="pb-3 pt-6 px-6">
                      <h3 className="text-xl font-bold leading-tight group-hover:text-primary transition-colors">
                        {post.title}
                      </h3>
                    </CardHeader>
                    <CardContent className="pt-0 px-6">
                      <p className="text-neutral-600 line-clamp-3 mb-4">{post.excerpt}</p>
                      <div className="flex items-center gap-4 text-sm text-neutral-500">
                        <div className="flex items-center gap-1">
                          <User size={14} />
                          <span>{getAuthorName(post)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Eye size={14} />
                          <span>2 min read</span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="pt-2 pb-6 px-6">
                      <Button variant="ghost" className="p-0 text-primary hover:text-violet-700 hover:bg-transparent group h-auto">
                        <span className="flex items-center gap-1 font-medium">
                          Read Article
                          <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                        </span>
                      </Button>
                    </CardFooter>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        ) : (searchResults.length === 0 && posts.length === 0) ? (
          <motion.div 
            className="text-center py-32"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="bg-gradient-to-br from-violet-100 to-indigo-100 rounded-3xl p-12 max-w-md mx-auto">
              <Search size={48} className="mx-auto mb-4 text-neutral-400" />
              <h3 className="text-2xl font-semibold text-neutral-800 mb-2">
                {isSearching ? 'Searching...' : 'No articles found'}
              </h3>
              <p className="text-neutral-600 mb-6">
                {isSearching 
                  ? 'Please wait while we search for articles...'
                  : 'We couldn\'t find any articles matching your search.'}
              </p>
              {!isSearching && (
                <Button 
                  onClick={() => {
                    setSearchTerm('');
                    setSearchResults([]);
                    setSearchPagination(pagination);
                  }}
                  className="bg-gradient-to-r from-primary to-primary hover:from-violet-700 hover:to-indigo-700 text-white border-0 rounded-full px-6 h-10"
                >
                  Clear Search
                </Button>
              )}
            </div>
          </motion.div>
        ) : null}
        
        {(searchResults.length > 0 || posts.length > 0) && (searchPagination.totalPages > 1 || pagination.totalPages > 1) && (
          <Pagination
            currentPage={searchResults.length > 0 ? searchPagination.currentPage : pagination.currentPage}
            totalPages={searchResults.length > 0 ? searchPagination.totalPages : pagination.totalPages}
            totalItems={searchResults.length > 0 ? searchPagination.totalItems : pagination.totalItems}
            itemsPerPage={searchResults.length > 0 ? searchPagination.itemsPerPage : pagination.itemsPerPage}
          />
        )}
      </motion.div>
      <Footer />
    </>
  );
};

export default BlogPage;