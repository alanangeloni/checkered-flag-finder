
import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { BlogPost } from '@/types/customTypes';

// Default placeholder image if blog post has no image
const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1617196701537-7329482cc9fe";

const Blog = () => {
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBlogPosts = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('blog_articles')
        .select('*')
        .eq('published', true)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching blog posts:', error);
        setIsLoading(false);
        return;
      }
      
      // Map the data to match the BlogPost type
      const formattedPosts: BlogPost[] = data.map(post => ({
        id: post.id,
        title: post.title,
        slug: post.slug || post.id,
        excerpt: post.excerpt,
        content: post.content,
        image_url: post.featured_image || DEFAULT_IMAGE,
        featured_image: post.featured_image,
        published: post.published,
        created_at: post.created_at,
        updated_at: post.updated_at,
        author_id: post.author_id,
        category_id: post.category_id,
        published_at: post.published_at
      }));
      
      setBlogPosts(formattedPosts);
      setIsLoading(false);
    };

    fetchBlogPosts();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-lg">Loading blog posts...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // If no posts are available, show a message
  if (blogPosts.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow">
          <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-2">Race Car Blog</h1>
            <p className="text-gray-500 mb-8">The latest news, tips, and stories from the racing world</p>
            <div className="text-center py-10">
              <p className="text-xl">No blog posts available yet.</p>
              <p className="text-gray-500 mt-2">Check back soon for new content!</p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-2">Race Car Blog</h1>
          <p className="text-gray-500 mb-8">The latest news, tips, and stories from the racing world</p>
          
          {/* Featured Post */}
          {blogPosts.length > 0 && (
            <div className="mb-12">
              <Link to={`/blog/${blogPosts[0].slug}`}>
                <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="grid grid-cols-1 md:grid-cols-2">
                    <div className="h-64 md:h-auto">
                      <img 
                        src={blogPosts[0].image_url || DEFAULT_IMAGE} 
                        alt={blogPosts[0].title} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-6 flex flex-col justify-center">
                      <span className="text-sm font-medium text-racecar-red mb-2">Racing</span>
                      <h2 className="text-2xl font-bold mb-3">{blogPosts[0].title}</h2>
                      <p className="text-gray-600 mb-4">{blogPosts[0].excerpt}</p>
                      <div className="flex items-center justify-between mt-auto">
                        <span className="text-sm text-gray-500">Checkered Flag Finder • {format(new Date(blogPosts[0].created_at), 'MMMM d, yyyy')}</span>
                        <span className="text-racecar-red font-medium">Read More →</span>
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>
            </div>
          )}
          
          {/* Blog Post Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogPosts.slice(1).map(post => (
              <Link to={`/blog/${post.slug}`} key={post.id}>
                <Card className="overflow-hidden hover:shadow-lg transition-shadow h-full">
                  <div className="h-48 overflow-hidden">
                    <img 
                      src={post.image_url || DEFAULT_IMAGE} 
                      alt={post.title} 
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <CardHeader>
                    <span className="text-sm font-medium text-racecar-red mb-1">Racing</span>
                    <h3 className="text-xl font-bold">{post.title}</h3>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4">{post.excerpt}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Checkered Flag Finder • {format(new Date(post.created_at), 'MMMM d, yyyy')}</span>
                      <span className="text-racecar-red font-medium">Read More →</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Blog;
