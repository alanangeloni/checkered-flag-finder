
import React from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Link } from 'react-router-dom';

// Sample blog posts data
const featuredPosts = [
  {
    id: 1,
    title: "The Evolution of Formula 1 Aerodynamics",
    excerpt: "A deep dive into how aerodynamic innovations have shaped Formula 1 racing over the decades.",
    author: "Michael Reynolds",
    date: "May 3, 2025",
    image: "https://images.unsplash.com/photo-1617196701537-7329482cc9fe",
    slug: "evolution-of-formula-1-aerodynamics"
  },
  {
    id: 2,
    title: "Mastering the Track: Pro Racing Tips",
    excerpt: "Professional drivers share their secrets for optimizing performance on any racing circuit.",
    author: "Sophia Chen",
    date: "April 28, 2025",
    image: "https://images.unsplash.com/photo-1516546453174-5e1098a4b4af",
    slug: "mastering-the-track-tips-from-professionals"
  },
  {
    id: 3,
    title: "The Rise of Electric Racing",
    excerpt: "Exploring how electric vehicles are transforming motorsports and what this means for traditional racing.",
    author: "James Wilson",
    date: "April 22, 2025",
    image: "https://images.unsplash.com/photo-1574275555839-061fbe6723e6",
    slug: "rise-of-electric-racing"
  }
];

const HomeBlogSection = () => {
  return (
    <div className="container mx-auto px-4 py-10 bg-racecar-darkgray">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-white">Latest from our Blog</h1>
        <Link to="/blog" className="text-racecar-red hover:underline">
          View all articles →
        </Link>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {featuredPosts.map(post => (
          <Link key={post.id} to={`/blog/${post.slug}`}>
            <Card className="overflow-hidden hover:shadow-lg transition-shadow h-full bg-gray-900 border-gray-800">
              <div className="h-48 overflow-hidden">
                <img 
                  src={post.image} 
                  alt={post.title} 
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
              <CardHeader className="text-white">
                <span className="text-sm font-medium text-racecar-red mb-1">{post.date}</span>
                <h3 className="text-xl font-bold">{post.title}</h3>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400 mb-4">{post.excerpt}</p>
                <span className="text-racecar-red font-medium">Read More →</span>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default HomeBlogSection;
