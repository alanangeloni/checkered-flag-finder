
import React from 'react';
import { Button } from '@/components/ui/button';

const CallToAction = () => {
  return (
    <div className="container mx-auto px-4 py-10">
      <div className="bg-racecar-lightgray rounded-lg p-6 flex flex-col md:flex-row items-center justify-between">
        <div className="md:w-2/3 mb-6 md:mb-0">
          <h2 className="text-2xl font-bold mb-2">Ready to Sell Your Race Car?</h2>
          <p className="text-gray-700">
            List your race car to day on our website. List it now. Right now because you
            need to list your car now right now.
          </p>
          <Button variant="default" className="mt-4 bg-racecar-red hover:bg-red-700">
            List your racecar
          </Button>
        </div>
        <div className="md:w-1/3">
          <img
            src="https://images.unsplash.com/photo-1487887235947-a955ef187fcc"
            alt="Sell your racecar"
            className="rounded-md w-full object-cover"
          />
        </div>
      </div>
    </div>
  );
};

export default CallToAction;
