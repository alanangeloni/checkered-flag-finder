
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";

interface Car {
  id: number;
  title: string;
  price: number;
  location?: string;
  image: string;
}

interface ListingCardProps {
  car: Car;
}

const ListingCard: React.FC<ListingCardProps> = ({ car }) => {
  return (
    <Link to={`/car-details/${car.id}`}>
      <Card className="overflow-hidden rounded-lg hover:shadow-lg transition-shadow h-full border-0 shadow">
        <div className="relative">
          <img 
            src={car.image} 
            alt={car.title} 
            className="w-full h-48 object-cover" 
          />
          <div className="absolute bottom-0 left-0 bg-white text-black font-bold px-4 py-1 m-3 rounded">
            ${car.price.toLocaleString()}
          </div>
        </div>
        <CardContent className="p-4">
          <h3 className="text-lg font-bold">{car.title}</h3>
          <div className="text-xs text-gray-600 mt-1">
            Race Car Details, Race Car Details, Race Car Details
          </div>
          <div className="text-xs text-gray-600 mt-2">
            {car.location}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default ListingCard;
