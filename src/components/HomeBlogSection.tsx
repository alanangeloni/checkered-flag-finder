
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";

// Sample blog posts data with dates formatted as MM/DD/YY
const featuredPosts = [
  {
    id: 1,
    title: "The Mental Side of Racing: Techniques for Improving Focus and Concentration",
    excerpt: "A deep dive into how mental preparation can improve racing performance.",
    date: "10/22/24",
    image: "https://images.unsplash.com/photo-1617196701537-7329482cc9fe",
    slug: "mental-side-of-racing"
  },
  {
    id: 2,
    title: "Why Rallycross is Gaining Global Popularity",
    excerpt: "Exploring the factors behind the rising popularity of rallycross events worldwide.",
    date: "10/22/24",
    image: "https://images.unsplash.com/photo-1516546453174-5e1098a4b4af",
    slug: "rallycross-global-popularity"
  },
  {
    id: 3,
    title: "How Historic Racing Series Keep Motorsports History Alive",
    excerpt: "Celebrating the importance of historic racing events in preserving automotive heritage.",
    date: "10/22/24",
    image: "https://images.unsplash.com/photo-1574275555839-061fbe6723e6",
    slug: "historic-racing-series"
  }
];

const HomeBlogSection = () => {
  return (
    <div className="container mx-auto px-4 py-12 bg-white">
      <h1 className="text-4xl font-bold mb-8 text-black">Latest Articles</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Featured article - takes up more space */}
        <div className="lg:col-span-7">
          <Link to={`/blog/${featuredPosts[0].slug}`} className="block h-full">
            <div className="rounded-lg overflow-hidden shadow-md h-full relative">
              <img 
                src={featuredPosts[0].image} 
                alt={featuredPosts[0].title} 
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
                <h2 className="font-bold text-2xl text-white">{featuredPosts[0].title}</h2>
              </div>
            </div>
          </Link>
        </div>
        
        {/* Sidebar articles with smaller images and text on the right */}
        <div className="lg:col-span-5 space-y-6 flex flex-col justify-start">
          {featuredPosts.map((post) => (
            <Link key={post.id} to={`/blog/${post.slug}`} className="block">
              <div className="flex items-start space-x-4">
                <div className="w-32 h-24 flex-shrink-0">
                  <img 
                    src={post.image} 
                    alt={post.title} 
                    className="w-full h-full object-cover rounded-lg"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-black line-clamp-2">{post.title}</h3>
                  <p className="text-gray-500 text-sm mt-1">{post.date}</p>
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
