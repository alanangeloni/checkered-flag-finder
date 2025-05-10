
import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const CarDetailsLoading = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-racecar-red mx-auto mb-4"></div>
          <p className="text-gray-600">Loading car details...</p>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CarDetailsLoading;
