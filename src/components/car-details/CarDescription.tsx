
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Category, FileText } from 'lucide-react';

interface CarDescriptionProps {
  detailedDescription?: string | null;
  shortDescription?: string | null;
  raceCarType?: string | null;
  categoryName?: string | null;
  subcategoryName?: string | null;
}

const CarDescription = ({ 
  detailedDescription, 
  shortDescription,
  raceCarType,
  categoryName,
  subcategoryName
}: CarDescriptionProps) => {
  return (
    <Card className="shadow-sm mb-6">
      <CardContent className="p-6">
        <h2 className="text-lg font-bold mb-4">Description</h2>
        
        {/* Race Car Categories Section */}
        {(raceCarType || categoryName || subcategoryName) && (
          <div className="mb-4 flex flex-wrap gap-2 items-center">
            <Category size={18} className="text-gray-500 mr-1" />
            
            {categoryName && (
              <Badge variant="outline" className="bg-gray-100">
                {categoryName}
              </Badge>
            )}
            
            {subcategoryName && (
              <Badge variant="outline" className="bg-gray-100">
                {subcategoryName}
              </Badge>
            )}
            
            {raceCarType && (
              <Badge className="bg-racecar-red text-white">
                {raceCarType}
              </Badge>
            )}
          </div>
        )}
        
        {/* Description Text */}
        <p className="text-gray-700 whitespace-pre-line">{detailedDescription || shortDescription}</p>
      </CardContent>
    </Card>
  );
};

export default CarDescription;
