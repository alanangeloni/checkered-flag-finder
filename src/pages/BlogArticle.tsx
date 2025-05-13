import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { BlogPost } from '@/types/customTypes';

// Default placeholder image if blog post has no image
const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1617196701537-7329482cc9fe";
const DEFAULT_AUTHOR_IMAGE = "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e";

// Function to convert markdown to HTML
const convertMarkdownToHtml = (markdown: string): string => {
  if (!markdown) return '';
  
  // First, split the content by lines to properly handle headings
  const lines = markdown.split('\n');
  let processedLines = [];
  
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    
    // Process headings with proper spacing
    if (line.startsWith('## ')) {
      const headingText = line.substring(3).trim();
      processedLines.push(`<h2 class="blog-heading-h2">${headingText}</h2>`);
    } 
    else if (line.startsWith('### ')) {
      const headingText = line.substring(4).trim();
      processedLines.push(`<h3 class="blog-heading-h3">${headingText}</h3>`);
    }
    else {
      // Process other formatting
      line = line
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>');
      
      // Add the processed line
      processedLines.push(line);
    }
  }
  
  // Join lines back together with proper spacing
  let html = processedLines.join('<br>');
  
  // Handle image placeholders if any remain
  html = html.replace(/!\[(.*?)\]\((.*?)\)/g, '<img src="$2" alt="$1" class="my-4 rounded-md">');
  
  return html;
};

const BlogArticle = () => {
  const { slug } = useParams<{ slug: string }>();
  const [article, setArticle] = useState<BlogPost | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);

  useEffect(() => {
    const fetchArticle = async () => {
      setIsLoading(true);

      if (!slug) {
        setIsLoading(false);
        return;
      }

      // Fetch the article with the matching slug
      const { data, error } = await supabase
        .from('blog_articles')
        .select('*')
        .eq('slug', slug)
        .eq('published', true)
        .single();

      if (error || !data) {
        console.error('Error fetching article:', error);
        setIsLoading(false);
        return;
      }

      // Map the data to match the BlogPost type
      const formattedPost: BlogPost = {
        id: data.id,
        title: data.title,
        slug: data.slug || data.id,
        excerpt: data.excerpt,
        content: data.content,
        image_url: data.featured_image || DEFAULT_IMAGE,
        featured_image: data.featured_image,
        published: data.published,
        created_at: data.created_at,
        updated_at: data.updated_at,
        author_id: data.author_id,
        category_id: data.category_id,
        published_at: data.published_at
      };

      setArticle(formattedPost);

      // Fetch related posts (excluding the current one)
      const { data: relatedData, error: relatedError } = await supabase
        .from('blog_articles')
        .select('*')
        .eq('published', true)
        .neq('id', data.id)
        .order('created_at', { ascending: false })
        .limit(3);

      if (!relatedError && relatedData) {
        const formattedRelated: BlogPost[] = relatedData.map(post => ({
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

        setRelatedPosts(formattedRelated);
      }

      setIsLoading(false);
    };

    fetchArticle();
  }, [slug]);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-lg">Loading article...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // If article not found, show error message
  if (!article) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4">Article Not Found</h1>
            <p className="mb-6">The article you're looking for doesn't exist or may have been moved.</p>
            <Button asChild>
              <Link to="/blog">Return to Blog</Link>
            </Button>
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
        {/* Hero image */}
        <div className="w-full h-[40vh] relative">
          <img 
            src={article.image_url || DEFAULT_IMAGE} 
            alt={article.title} 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-70"></div>
          <div className="absolute bottom-0 container mx-auto px-4 py-6 text-white">
            <span className="bg-racecar-red px-3 py-1 rounded-md text-sm font-medium mb-2 inline-block">
              Racing
            </span>
            <h1 className="text-4xl md:text-5xl font-bold mb-2">{article.title}</h1>
            <div className="flex items-center gap-4 text-sm md:text-base">
              <span>{format(new Date(article.created_at), 'MMMM d, yyyy')}</span>
              <span>•</span>
              <span>{Math.ceil(article.content.length / 1000)} min read</span>
            </div>
          </div>
        </div>
        
        <div className="container mx-auto px-4 py-8">
          <Link to="/blog">
            <Button variant="outline" className="mb-6">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Blog
            </Button>
          </Link>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main content */}
            <div className="lg:col-span-2">
              <div 
                className="prose prose-lg max-w-none blog-content"
                dangerouslySetInnerHTML={{ __html: convertMarkdownToHtml(article.content) }}
              />
            </div>
            
            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-8">
              {/* Author box */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <div className="flex items-center mb-4">
                  <img 
                    src={DEFAULT_AUTHOR_IMAGE}
                    alt="Author"
                    className="w-16 h-16 rounded-full object-cover mr-4"
                  />
                  <div>
                    <h3 className="font-bold text-lg">Checkered Flag Finder</h3>
                    <p className="text-gray-600">Racing Enthusiast</p>
                  </div>
                </div>
                <p className="text-gray-700">
                  Expert in motorsports with a passion for racing and automotive excellence.
                </p>
              </div>
              
              {/* Related articles */}
              <div>
                <h3 className="text-xl font-bold mb-4">Related Articles</h3>
                <div className="space-y-4">
                  {relatedPosts.length > 0 ? (
                    relatedPosts.map(related => (
                      <Link to={`/blog/${related.slug}`} key={related.id} className="block">
                        <div className="flex gap-3">
                          <img 
                            src={related.image_url || DEFAULT_IMAGE} 
                            alt={related.title}
                            className="w-24 h-24 object-cover rounded-md"
                          />
                          <div>
                            <h4 className="font-bold hover:text-racecar-red transition-colors">{related.title}</h4>
                            <p className="text-sm text-gray-600">{format(new Date(related.created_at), 'MMMM d, yyyy')}</p>
                          </div>
                        </div>
                      </Link>
                    ))
                  ) : (
                    <p className="text-gray-500">No related articles found.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default BlogArticle;
