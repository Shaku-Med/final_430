import { Metadata } from "next"
import IsAuth from "@/app/Auth/IsAuth/IsAuth"
import { redirect } from "next/navigation"
import Nav from "@/app/Home/Nav/Nav"
import Footer from "@/app/Home/Footer/Footer"
import Edit from "./Component/Edit"
import db from "@/app/Database/Supabase/Base1"

export const metadata: Metadata = {
  title: {
    default: 'Edit Blog',
    template: '%s | Edit Blog'
  },
  openGraph: {
    title: 'Edit Blog',
    description: 'Edit Blog',
  },
}

const page = async ({ params }: { params: { id: string } }) => {
  try {
    const user = await IsAuth(true)
    if (!user || typeof user === 'boolean' || !('user_id' in user)) {
      return redirect('/account')
    }

    // Fetch the blog post
    const { data: blog, error } = await db
      .from('blog')
      .select('*')
      .eq('id', params.id)
      .single()

    if (error || !blog) {
      return redirect('/blog')
    }

    // Check if user is the owner of the blog
    if (blog.user_id !== user.user_id) {
      return redirect('/blog')
    }

    return (
      <>
        <Nav />
        <Edit data={blog} />
        <Footer />
      </>
    )
  } catch (error) {
    console.error('Error in edit page:', error)
    return redirect('/blog')
  }
}

export default page
