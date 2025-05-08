
import React from 'react';
import { useParams } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

// Mock blog article data
const blogArticles = [
  {
    id: 1,
    slug: "evolution-of-formula-1-aerodynamics",
    title: "The Evolution of Formula 1 Aerodynamics",
    excerpt: "A deep dive into how aerodynamic innovations have shaped Formula 1 racing over the decades.",
    content: `
      <p class="lead">For decades, aerodynamic development has been at the forefront of Formula 1 innovation, reshaping how race cars perform on the track.</p>
      
      <p>When Formula 1 began in 1950, cars were essentially bullet-shaped with minimal consideration for downforce. Drivers relied primarily on mechanical grip from their tires. By the late 1960s, teams began experimenting with wings to push cars into the track, increasing cornering speeds dramatically.</p>
      
      <h2>The Ground Effect Era</h2>
      
      <p>The late 1970s saw Lotus pioneer "ground effect" aerodynamics, using the car's floor shape to create a vacuum that sucked the car to the track. This technological leap produced unprecedented cornering speeds, though it was eventually banned due to safety concerns when cars lost downforce suddenly over bumps or kerbs.</p>
      
      <p>Through the 1980s and 1990s, teams focused on intricate front and rear wing designs, introducing multiple elements that could be fine-tuned for different circuit requirements. The introduction of computational fluid dynamics (CFD) technology allowed engineers to model airflow without physical testing.</p>
      
      <h2>The Modern Era</h2>
      
      <p>Today's Formula 1 cars generate around 5 times their weight in downforce at high speeds. The 2022 regulations introduced a significant shift toward "ground effect" once again, but with safer implementation through venturi tunnels under the car. This change was designed to reduce "dirty air" behind cars, allowing for closer racing and more overtaking opportunities.</p>
      
      <p>Teams now employ hundreds of aerodynamicists who work with wind tunnels and sophisticated CFD simulations to find fractions of a second in lap time through better airflow management. Every surface of a modern F1 car—from the front wing to the floor to the cooling ducts—is meticulously designed to control airflow in the most advantageous way possible.</p>
      
      <h2>The Future of F1 Aerodynamics</h2>
      
      <p>As Formula 1 pushes toward more sustainable racing, aerodynamic efficiency becomes even more crucial. Future regulations will likely continue to balance the competing demands of spectacular performance, close racing, and environmental responsibility, with aerodynamics remaining at the heart of car development.</p>
    `,
    author: "Michael Reynolds",
    authorTitle: "Former F1 Aerodynamicist",
    authorImage: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e",
    date: "May 3, 2025",
    category: "Technology",
    image: "https://images.unsplash.com/photo-1617196701537-7329482cc9fe",
    readingTime: "8 min read"
  },
  {
    id: 2,
    slug: "mastering-the-track-tips-from-professionals",
    title: "Mastering the Track: Tips from Professional Race Drivers",
    excerpt: "Professional drivers share their secrets for optimizing performance on any racing circuit.",
    content: `
      <p class="lead">Whether you're an amateur enthusiast or aiming for a professional career, these insights from top racing drivers can help you improve your track performance.</p>
      
      <h2>Perfect Your Racing Line</h2>
      <p>Professional drivers unanimously highlight the racing line as the foundation of fast track driving. "The perfect line through a corner is rarely what beginners think," explains three-time champion Alex Morris. "It's about maximizing exit speed on corners leading to long straights, and sometimes sacrificing entry speed for a better exit."</p>
      
      <p>Professionals recommend walking the track before racing whenever possible, noting reference points for braking, turn-in, apex, and track-out positions.</p>
      
      <h2>Brake Once, Brake Hard</h2>
      <p>Efficient braking can make or break your lap time. "Progressive braking is a myth in modern racing," says touring car champion Sophia Chen. "You want to hit peak braking force quickly and then gradually release as you approach the turn-in point." This technique, known as "trail braking," helps rotate the car into corners while maintaining stability.</p>
      
      <h2>Look Where You Want to Go</h2>
      <p>Vision is perhaps the most underrated skill in motorsports. "Your hands follow your eyes," explains rally champion James Wilson. "If you're looking at the wall, that's where you'll end up. Always focus your sight far ahead, where you want the car to go." Professional drivers typically look 2-3 turns ahead, processing information far in advance.</p>
      
      <h2>Master Throttle Control</h2>
      <p>The gas pedal should be treated like a dimmer switch, not an on/off button. Smooth, progressive throttle application prevents wheelspin and maintains balance. "Finding the exact limit of grip requires thousands of hours of practice," notes sports car champion Emma Clarke. "But when you get it right, you're extracting every bit of performance from the car."</p>
      
      <h2>Mental Preparation</h2>
      <p>Top-level racing is as much mental as physical. Many professional drivers use visualization techniques, mentally driving perfect laps before getting in the car. Others use simulators extensively to build muscle memory and track familiarity. "The calmest driver is usually the fastest," says David Martinez, Formula 3 winner. "Racing requires absolute focus and emotional control."</p>
    `,
    author: "Sophia Chen",
    authorTitle: "Racing Instructor",
    authorImage: "https://images.unsplash.com/photo-1494790108377-be9c29b29330",
    date: "April 28, 2025",
    category: "Driving Tips",
    image: "https://images.unsplash.com/photo-1516546453174-5e1098a4b4af",
    readingTime: "6 min read"
  }
];

const BlogArticle = () => {
  const { slug } = useParams();
  const article = blogArticles.find(article => article.slug === slug);
  
  if (!article) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-12">
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
            src={article.image} 
            alt={article.title} 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-70"></div>
          <div className="absolute bottom-0 container mx-auto px-4 py-6 text-white">
            <span className="bg-racecar-red px-3 py-1 rounded-md text-sm font-medium mb-2 inline-block">
              {article.category}
            </span>
            <h1 className="text-4xl md:text-5xl font-bold mb-2">{article.title}</h1>
            <div className="flex items-center gap-4 text-sm md:text-base">
              <span>{article.date}</span>
              <span>•</span>
              <span>{article.readingTime}</span>
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
                className="prose prose-lg max-w-none"
                dangerouslySetInnerHTML={{ __html: article.content }}
              />
            </div>
            
            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-8">
              {/* Author box */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <div className="flex items-center mb-4">
                  <img 
                    src={article.authorImage}
                    alt={article.author}
                    className="w-16 h-16 rounded-full object-cover mr-4"
                  />
                  <div>
                    <h3 className="font-bold text-lg">{article.author}</h3>
                    <p className="text-gray-600">{article.authorTitle}</p>
                  </div>
                </div>
                <p className="text-gray-700">
                  Expert in motorsports with over a decade of experience in professional racing and vehicle development.
                </p>
              </div>
              
              {/* Related articles */}
              <div>
                <h3 className="text-xl font-bold mb-4">Related Articles</h3>
                <div className="space-y-4">
                  {blogArticles.filter(a => a.id !== article.id).map(related => (
                    <Link to={`/blog/${related.slug}`} key={related.id} className="block">
                      <div className="flex gap-3">
                        <img 
                          src={related.image} 
                          alt={related.title}
                          className="w-24 h-24 object-cover rounded-md"
                        />
                        <div>
                          <h4 className="font-bold hover:text-racecar-red transition-colors">{related.title}</h4>
                          <p className="text-sm text-gray-600">{related.date}</p>
                        </div>
                      </div>
                    </Link>
                  ))}
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
