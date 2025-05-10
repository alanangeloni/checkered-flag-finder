import React from 'react';
import { MessageCircle, Tag, FileText, User } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
interface CarPriceInfoProps {
  price: number;
  raceCarType: string | null;
  sellerType: string | null;
  createdAt: string;
  onContactClick: () => void;
}
const CarPriceInfo = ({
  price,
  raceCarType,
  sellerType,
  createdAt,
  onContactClick
}: CarPriceInfoProps) => {
  return <Card className="mb-6 shadow-sm">
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex flex-wrap gap-6">
            <div className="flex items-center gap-2">
              <Tag size={18} className="text-gray-500" />
              <div>
                <div className="text-sm text-gray-500">Price</div>
                <div className="font-semibold text-xl">${price?.toLocaleString()}</div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <FileText size={18} className="text-gray-500" />
              <div>
                <div className="text-sm text-gray-500">Racing Class</div>
                <div className="font-semibold">{raceCarType || 'N/A'}</div>
              </div>
            </div>
            
            
          </div>
          
          <div className="flex gap-2 w-full sm:w-auto">
            <Button variant="primary" className="w-full sm:w-auto" onClick={onContactClick}>
              <MessageCircle size={18} />
              Contact Seller
            </Button>
          </div>
        </div>
        
        
      </CardContent>
    </Card>;
};
export default CarPriceInfo;