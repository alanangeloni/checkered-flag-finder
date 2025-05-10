
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface CarDescriptionProps {
  detailedDescription?: string | null;
  shortDescription?: string | null;
}

const CarDescription = ({ detailedDescription, shortDescription }: CarDescriptionProps) => {
  return (
    <Card className="shadow-sm mb-6">
      <CardContent className="p-6">
        <h2 className="text-lg font-bold mb-4">Description</h2>
        <p className="text-gray-700 whitespace-pre-line">{detailedDescription || shortDescription}</p>
      </CardContent>
    </Card>
  );
};

export default CarDescription;
