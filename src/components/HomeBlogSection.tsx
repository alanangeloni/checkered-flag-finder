
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import { useIsMobile } from '@/hooks/use-mobile';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { BlogPost } from '@/types/customTypes';

// Default placeholder image if blog post has no image
const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1617196701537-7329482cc9fe";

const HomeBlogSection = () => {
  const isMobile = useIsMobile();
  const [featuredPosts, setFeaturedPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchBlogPosts = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('blog_articles')
        .select('*')
        .eq('published', true)
        .order('created_at', { ascending: false })
        .limit(4);
      
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
      
      setFeaturedPosts(formattedPosts);
      setIsLoading(false);
    };

    fetchBlogPosts();
  }, []);
  
  // If no posts are available or still loading, don't render the section
  if (isLoading || featuredPosts.length === 0) {
    return null;
  }
  
  // Get the main featured post and the remaining posts for the sidebar
  const mainPost = featuredPosts[0];
  const sidebarPosts = featuredPosts.slice(1, 4); // Get posts 2-4 for the sidebar
  
  return (
    <div className="container mx-auto px-4 py-8 sm:py-12 bg-white">
      <h1 className="text-2xl sm:text-4xl font-bold mb-4 sm:mb-8 text-black">Latest Articles</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
        {/* Featured article - with height adjusted to match sidebar */}
        <div className="lg:col-span-7">
          <Link to={`/blog/${mainPost.slug}`} className="block h-full">
            <div className="rounded-lg overflow-hidden shadow-md h-[16rem] sm:h-[21.5rem] relative">
              <img 
                src={mainPost.image_url || DEFAULT_IMAGE} 
                alt={mainPost.title} 
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 sm:p-6">
                <h2 className="font-bold text-xl sm:text-2xl text-white">{mainPost.title}</h2>
              </div>
            </div>
          </Link>
        </div>
        
        {/* Sidebar articles - showing all sidebar articles */}
        <div className="lg:col-span-5 space-y-4 sm:space-y-6 flex flex-col">
          {sidebarPosts.map((post) => (
            <Link key={post.id} to={`/blog/${post.slug}`} className="block">
              <div className="flex items-start space-x-3 sm:space-x-4">
                <div className="w-24 sm:w-32 h-20 sm:h-24 flex-shrink-0">
                  <img 
                    src={post.image_url || DEFAULT_IMAGE} 
                    alt={post.title} 
                    className="w-full h-full object-cover rounded-lg"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-base sm:text-lg text-black line-clamp-2">{post.title}</h3>
                  <p className="text-gray-500 text-xs sm:text-sm mt-1">{format(new Date(post.created_at), 'MM/dd/yy')}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomeBlogSection;
