
import React from 'react';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';

const CallToAction = () => {
  const isMobile = useIsMobile();
  
  return (
    <div className="container mx-auto px-4 py-8 sm:py-10">
      <div className="bg-racecar-lightgray rounded-lg p-4 sm:p-6 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="md:w-2/3 text-center md:text-left">
          <h2 className="text-xl sm:text-2xl font-bold mb-2">Ready to Sell Your Race Car?</h2>
          <p className="text-gray-700 text-sm sm:text-base">
            List your race car to day on our website. List it now. Right now because you
            need to list your car now right now.
          </p>
          <Button variant="default" className="mt-4 bg-racecar-red hover:bg-red-700 w-full sm:w-auto">
            List your racecar
          </Button>
        </div>
        <div className="md:w-1/3 w-full">
          <img 
            alt="Sell your racecar" 
            className="rounded-md w-full h-48 md:h-auto object-cover" 
            src="/lovable-uploads/bbe64c96-d6d8-468f-a9f2-238e03060cc4.png" 
          />
        </div>
      </div>
    </div>
  );
};

export default CallToAction;
