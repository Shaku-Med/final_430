import React from 'react'
import Blog from './Component/Blog'
import Footer from '@/app/Home/Footer/Footer'
import Nav from '@/app/Home/Nav/Nav'
import db from '@/app/Database/Supabase/Base1'
import IsAuth from '@/app/Auth/IsAuth/IsAuth'
import { redirect } from 'next/navigation'

interface User {
  id: string
  firstname: string
  lastname: string
  name: string
  profile: string
  user_id: string
}

interface BlogPost {
  id: string
  title: string
  excerpt: string
  information?: string
  imageUrl: string
  date: string
  user_id: string
  likes: number
  comments: number
  shares: number
  views: number
}

interface SuggestedBlogPost {
  id: string
  title: string
  excerpt: string
  user_id: string
  date: string
  imageUrl: string
  likes: number
  comments: number
  shares: number
  views: number
  users: User | null
}

const page = async ({params}: {params: {id: string}}) => {
  try {
    const id = params.id
    const user = await IsAuth(true)
    
    // Fetch the blog post
    const { data: blog, error } = await db
      .from('blog')
      .select('*, views')
      .eq('id', id)
      .single()

    if (error || !blog) {
      return redirect('/blog')
    }

    // Fetch the blog author
    const { data: author } = await db
      .from('users')
      .select('id, firstname, lastname, name, profile, user_id')
      .eq('user_id', blog.user_id)
      .single()

    // Check if user is authenticated and get their like status
    let isOwner = false
    let isLiked = false
    
    if (user && typeof user !== 'boolean' && 'user_id' in user) {
      isOwner = blog.user_id === user.user_id
      
      // Check if user has liked this blog
      const { data: like } = await db
        .from('blog_likes')
        .select('*')
        .eq('blog_id', id)
        .eq('user_id', user.user_id)
        .single()
      
      isLiked = !!like
    }

    // Get suggested blog posts (excluding current blog)
    const { data: suggestedBlogs } = await db
      .from('blog')
      .select('id, title, excerpt, user_id, date, imageUrl, likes, comments, shares, views')
      .neq('id', id)
      .order('date', { ascending: false })
      .limit(3)

    // Fetch authors for suggested blogs
    let suggestedBlogsWithAuthors: SuggestedBlogPost[] = []
    if (suggestedBlogs && suggestedBlogs.length > 0) {
      const userIds = [...new Set(suggestedBlogs.map(blog => blog.user_id))]
      const { data: authors } = await db
        .from('users')
        .select('id, firstname, lastname, name, profile, user_id')
        .in('user_id', userIds)

      if (authors) {
        const authorMap: Record<string, User> = authors.reduce((acc, author) => {
          acc[author.user_id] = author
          return acc
        }, {} as Record<string, User>)

        suggestedBlogsWithAuthors = suggestedBlogs.map(blog => ({
          ...blog,
          users: authorMap[blog.user_id] || null
        }))
      }
    }

    return (
      <>
        <Nav/>
        <Blog 
          data={{
            ...blog,
            users: author || null,
            isOwner,
            isLiked,
            suggestedBlogs: suggestedBlogsWithAuthors,
            isAuth: user && typeof user !== 'boolean' && 'user_id' in user
          }}
        />
        <Footer/>
      </>
    )
  } catch (error) {
    console.error('Error fetching blog:', error)
    return redirect('/blog')
  }
}

export default page
