
import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import HeroSection from '@/components/HeroSection';
import PopularCategories from '@/components/PopularCategories';
import RecentlyListedCars from '@/components/RecentlyListedCars';
import CallToAction from '@/components/CallToAction';
import PopularSearches from '@/components/PopularSearches';
import HomeBlogSection from '@/components/HomeBlogSection';

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <section>
          <h1 className="sr-only">Racecar Finder - Premium Race Cars For Sale</h1>
          <HeroSection />
        </section>
        <section aria-labelledby="popular-categories">
          <PopularCategories />
        </section>
        <section aria-labelledby="recent-listings">
          <RecentlyListedCars />
        </section>
        <section aria-labelledby="cta-section">
          <CallToAction />
        </section>
        <section aria-labelledby="blog-section">
          <HomeBlogSection />
        </section>
        <section aria-labelledby="popular-searches">
          <PopularSearches />
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
