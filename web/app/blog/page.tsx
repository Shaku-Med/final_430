import React from 'react'
import BlogPage from './Component/Blog'
import db from '@/app/Database/Supabase/Base1'

interface User {
  id: string;
  firstname: string;
  lastname: string;
  name: string;
  profile: string;
}

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

interface BlogData {
  id: string;
  title: string;
  excerpt: string;
  user_id: string;
  date: string;
  imageUrl: any;
  likes: number;
  comments: number;
  shares: number;
  created_at: string;
  users?: User | null;
}

interface PageProps {
  searchParams: {
    page?: string;
    'per-page'?: string;
  }
}

const ITEMS_PER_PAGE = 10;

const page = async ({ searchParams }: PageProps) => {
  const currentPage = Number(searchParams.page) || 1;
  const perPage = Number(searchParams['per-page']) || ITEMS_PER_PAGE;
  const start = (currentPage - 1) * perPage;
  const end = start + perPage - 1;

  // Get total count of blogs
  const { count } = await db
    .from('blog')
    .select('*', { count: 'exact', head: true });

  const totalPages = count ? Math.ceil(count / perPage) : 0;

  const { data: blogs, error } = await db
    .from('blog')
    .select('id, title, excerpt, user_id, date, imageUrl, likes, comments, shares, created_at')
    .order('date', { ascending: false })
    .range(start, end);

  if (error) {
    console.error('Error fetching blogs:', error);
    return <BlogPage BLOG_POSTS={[]} pagination={{ currentPage: 1, totalPages: 0, totalItems: 0, itemsPerPage: ITEMS_PER_PAGE }} />;
  }

  if (blogs && blogs.length > 0) {
    const userIds = [...new Set(blogs.map(blog => blog.user_id))];
    
    const { data: users, error: userError } = await db
      .from('users')
      .select('id, firstname, lastname, name, profile, user_id')
      .in('user_id', userIds);

    if (userError) {
      console.error('Error fetching users:', userError);
    } else if (users) {
      const userMap: Record<string, User> = {};
      users.forEach(user => {
        userMap[user.user_id] = user;
      });
      
      const blogsWithUsers: BlogS[] = blogs.map(blog => ({
        ...blog,
        users: userMap[blog.user_id] || null
      }));

      return (
        <>
          <BlogPage 
            BLOG_POSTS={blogsWithUsers} 
            pagination={{
              currentPage,
              totalPages,
              totalItems: count || 0,
              itemsPerPage: perPage
            }}
          />      
        </>
      );
    }
  }

  return (
    <>
      <BlogPage 
        BLOG_POSTS={[]} 
        pagination={{
          currentPage: 1,
          totalPages: 0,
          totalItems: 0,
          itemsPerPage: perPage
        }}
      />      
    </>
  )
}

export default page