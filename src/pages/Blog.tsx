
import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Link } from 'react-router-dom';

// Mock blog posts
const blogPosts = [
  {
    id: 1,
    title: "The Evolution of Formula 1 Aerodynamics",
    excerpt: "A deep dive into how aerodynamic innovations have shaped Formula 1 racing over the decades.",
    author: "Michael Reynolds",
    date: "May 3, 2025",
    category: "Technology",
    image: "https://images.unsplash.com/photo-1617196701537-7329482cc9fe",
    slug: "evolution-of-formula-1-aerodynamics"
  },
  {
    id: 2,
    title: "Mastering the Track: Tips from Professional Race Drivers",
    excerpt: "Professional drivers share their secrets for optimizing performance on any racing circuit.",
    author: "Sophia Chen",
    date: "April 28, 2025",
    category: "Driving Tips",
    image: "https://images.unsplash.com/photo-1516546453174-5e1098a4b4af",
    slug: "mastering-the-track-tips-from-professionals"
  },
  {
    id: 3,
    title: "The Rise of Electric Racing: Is This the Future?",
    excerpt: "Exploring how electric vehicles are transforming motorsports and what this means for traditional racing.",
    author: "James Wilson",
    date: "April 22, 2025",
    category: "Industry Trends",
    image: "https://images.unsplash.com/photo-1574275555839-061fbe6723e6",
    slug: "rise-of-electric-racing"
  },
  {
    id: 4,
    title: "Iconic Racing Circuits Around the World",
    excerpt: "A tour of the most legendary race tracks that have defined motorsport history.",
    author: "Emma Clarke",
    date: "April 15, 2025",
    category: "Circuits",
    image: "https://images.unsplash.com/photo-1520455740633-1aee0c8e4893",
    slug: "iconic-racing-circuits"
  },
  {
    id: 5,
    title: "Restoring Classic Race Cars: A Labor of Love",
    excerpt: "The challenges and rewards of bringing historic racing machines back to their former glory.",
    author: "David Martinez",
    date: "April 8, 2025",
    category: "Classic Cars",
    image: "https://images.unsplash.com/photo-1514899048671-f3682df1c4c9",
    slug: "restoring-classic-race-cars"
  },
  {
    id: 6,
    title: "Race Day Preparation: Behind the Scenes",
    excerpt: "What goes into preparing a race car and team for competition day? We take you backstage.",
    author: "Olivia Johnson",
    date: "April 1, 2025",
    category: "Racing Teams",
    image: "https://images.unsplash.com/photo-1509628061459-1328d06c2ced",
    slug: "race-day-preparation"
  }
];

const Blog = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-2">Race Car Blog</h1>
          <p className="text-gray-500 mb-8">The latest news, tips, and stories from the racing world</p>
          
          {/* Featured Post */}
          <div className="mb-12">
            <Link to={`/blog/${blogPosts[0].slug}`}>
              <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="grid grid-cols-1 md:grid-cols-2">
                  <div className="h-64 md:h-auto">
                    <img 
                      src={blogPosts[0].image} 
                      alt={blogPosts[0].title} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-6 flex flex-col justify-center">
                    <span className="text-sm font-medium text-racecar-red mb-2">{blogPosts[0].category}</span>
                    <h2 className="text-2xl font-bold mb-3">{blogPosts[0].title}</h2>
                    <p className="text-gray-600 mb-4">{blogPosts[0].excerpt}</p>
                    <div className="flex items-center justify-between mt-auto">
                      <span className="text-sm text-gray-500">{blogPosts[0].author} • {blogPosts[0].date}</span>
                      <span className="text-racecar-red font-medium">Read More →</span>
                    </div>
                  </div>
                </div>
              </Card>
            </Link>
          </div>
          
          {/* Blog Post Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogPosts.slice(1).map(post => (
              <Link to={`/blog/${post.slug}`} key={post.id}>
                <Card className="overflow-hidden hover:shadow-lg transition-shadow h-full">
                  <div className="h-48 overflow-hidden">
                    <img 
                      src={post.image} 
                      alt={post.title} 
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <CardHeader>
                    <span className="text-sm font-medium text-racecar-red mb-1">{post.category}</span>
                    <h3 className="text-xl font-bold">{post.title}</h3>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4">{post.excerpt}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">{post.author} • {post.date}</span>
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
