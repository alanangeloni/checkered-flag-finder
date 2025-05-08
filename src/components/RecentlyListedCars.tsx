
import React from 'react';
import { Card } from '@/components/ui/card';

type CarListing = {
  title: string;
  price: string;
  image: string;
  details: string[];
  location: string;
};

const carListings: CarListing[] = [
  {
    title: 'F1 Race Car',
    price: '$25,000',
    image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5',
    details: ['Race Car Details', 'Race Car Circuits', 'More Car Details'],
    location: 'FL Lauderdale, FL 33809',
  },
  {
    title: 'F1 Race Car',
    price: '$25,000',
    image: 'https://images.unsplash.com/photo-1487887235947-a955ef187fcc',
    details: ['Race Car Details', 'Race Car Circuits', 'Race Car Details'],
    location: 'FL Lauderdale, FL 33809',
  },
  {
    title: 'F1 Race Car',
    price: '$25,000',
    image: 'https://images.unsplash.com/photo-1500673922987-e212871fec22',
    details: ['Race Car Details', 'Race Car Circuits', 'More Car Details'],
    location: 'FL Lauderdale, FL 33809',
  },
  {
    title: 'F1 Race Car',
    price: '$35,000',
    image: 'https://images.unsplash.com/photo-1452378174528-3090a4bba7b2',
    details: ['Race Car Details', 'Race Car Circuits', 'More Car Details'],
    location: 'FL Lauderdale, FL 33809',
  },
  {
    title: 'F1 Race Car',
    price: '$25,000',
    image: 'https://images.unsplash.com/photo-1466721591366-2d5fba72006d',
    details: ['Race Car Details', 'Race Car Circuits', 'More Car Details'],
    location: 'FL Lauderdale, FL 33809',
  },
  {
    title: 'F1 Race Car',
    price: '$25,000',
    image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5',
    details: ['Race Car Details', 'Race Car Circuits', 'More Car Details'],
    location: 'FL Lauderdale, FL 33809',
  },
  {
    title: 'F1 Race Car',
    price: '$25,000',
    image: 'https://images.unsplash.com/photo-1487887235947-a955ef187fcc',
    details: ['Race Car Details', 'Race Car Circuits', 'More Car Details'],
    location: 'FL Lauderdale, FL 33809',
  },
  {
    title: 'F1 Race Car',
    price: '$25,000',
    image: 'https://images.unsplash.com/photo-1500673922987-e212871fec22',
    details: ['Race Car Details', 'Race Car Circuits', 'More Car Details'],
    location: 'FL Lauderdale, FL 33809',
  },
];

const CarListingCard = ({ listing }: { listing: CarListing }) => {
  return (
    <Card className="overflow-hidden">
      <div className="relative">
        <img
          src={listing.image}
          alt={listing.title}
          className="w-full h-44 object-cover"
        />
        <div className="absolute top-2 left-2 bg-white rounded px-3 py-1 font-bold">
          {listing.price}
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-bold mb-1">{listing.title}</h3>
        <div className="text-xs text-gray-600 space-x-1 mb-2">
          {listing.details.map((detail, idx) => (
            <React.Fragment key={idx}>
              <span>{detail}</span>
              {idx < listing.details.length - 1 && <span>•</span>}
            </React.Fragment>
          ))}
        </div>
        <p className="text-xs text-gray-600">{listing.location}</p>
      </div>
    </Card>
  );
};

const RecentlyListedCars = () => {
  return (
    <div className="container mx-auto px-4 py-6">
      <h2 className="text-2xl font-bold mb-6">Recently Listed Race Cars For Sale</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {carListings.slice(0, 8).map((listing, index) => (
          <CarListingCard key={index} listing={listing} />
        ))}
      </div>
    </div>
  );
};

export default RecentlyListedCars;
