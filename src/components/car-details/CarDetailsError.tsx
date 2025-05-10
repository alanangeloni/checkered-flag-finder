
import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface CarDetailsErrorProps {
  error: string | null;
}

const CarDetailsError = ({ error }: CarDetailsErrorProps) => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-6 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error || 'Car listing not found'}</p>
          <Button onClick={() => navigate('/listings')}>
            View All Listings
          </Button>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CarDetailsError;
