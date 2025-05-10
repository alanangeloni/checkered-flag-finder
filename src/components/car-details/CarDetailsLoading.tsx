
import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const CarDetailsLoading = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-6">
        <div className="mb-4">
          <div className="h-8 w-2/3 bg-gray-200 rounded-md animate-pulse mb-2"></div>
          <div className="h-4 w-1/2 bg-gray-200 rounded-md animate-pulse"></div>
        </div>
        
        {/* Image gallery loading state */}
        <div className="w-full h-[500px] bg-gray-200 rounded-lg animate-pulse mb-6"></div>
        
        {/* Two column layout loading state */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Car details loading state */}
          <div className="lg:col-span-2 space-y-6">
            <div className="h-32 bg-gray-200 rounded-md animate-pulse"></div>
            <div className="h-40 bg-gray-200 rounded-md animate-pulse"></div>
            <div className="h-24 bg-gray-200 rounded-md animate-pulse"></div>
          </div>
          
          {/* Related listings loading state */}
          <div className="lg:col-span-1 space-y-4">
            <div className="h-6 w-1/2 bg-gray-200 rounded-md animate-pulse"></div>
            <div className="h-36 bg-gray-200 rounded-md animate-pulse"></div>
            <div className="h-36 bg-gray-200 rounded-md animate-pulse"></div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CarDetailsLoading;
