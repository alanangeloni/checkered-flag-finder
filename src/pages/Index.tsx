
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
        <HeroSection />
        <PopularCategories />
        <RecentlyListedCars />
        <CallToAction />
        <HomeBlogSection />
        <PopularSearches />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
