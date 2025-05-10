
import React from 'react';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';
import { CarListingWithImages } from '@/types/customTypes';

interface CarSpecificationsProps {
  carListing: CarListingWithImages;
}

const CarSpecifications = ({ carListing }: CarSpecificationsProps) => {
  return (
    <Card className="mb-6 shadow-sm overflow-hidden">
      <div className="grid grid-cols-1 md:grid-cols-2">
        <div className="border-b md:border-b-0 md:border-r border-gray-200">
          <Table>
            <TableBody>
              <TableRow>
                <TableCell className="py-2 font-medium text-gray-500">Make</TableCell>
                <TableCell className="py-2">{carListing.make}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="py-2 font-medium text-gray-500">Model</TableCell>
                <TableCell className="py-2">{carListing.model || 'N/A'}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="py-2 font-medium text-gray-500">Year</TableCell>
                <TableCell className="py-2">{carListing.year || 'N/A'}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="py-2 font-medium text-gray-500">Engine Hours</TableCell>
                <TableCell className="py-2">{carListing.engine_hours || 'N/A'}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="py-2 font-medium text-gray-500">Engine Specs</TableCell>
                <TableCell className="py-2">{carListing.engine_specs || 'N/A'}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="py-2 font-medium text-gray-500">Category</TableCell>
                <TableCell className="py-2">{carListing.category_name || 'N/A'}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="py-2 font-medium text-gray-500">Subcategory</TableCell>
                <TableCell className="py-2">{carListing.subcategory_name || 'N/A'}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
        
        <div>
          <Table>
            <TableBody>
              <TableRow>
                <TableCell className="py-2 font-medium text-gray-500">Race Car Type</TableCell>
                <TableCell className="py-2">{carListing.race_car_type || 'N/A'}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="py-2 font-medium text-gray-500">Drivetrain</TableCell>
                <TableCell className="py-2">{carListing.drivetrain || 'N/A'}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="py-2 font-medium text-gray-500">Transmission</TableCell>
                <TableCell className="py-2">{carListing.transmission || 'N/A'}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="py-2 font-medium text-gray-500">Weight</TableCell>
                <TableCell className="py-2">{carListing.weight || 'N/A'}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="py-2 font-medium text-gray-500">Safety Equipment</TableCell>
                <TableCell className="py-2">{carListing.safety_equipment || 'N/A'}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="py-2 font-medium text-gray-500">Suspension</TableCell>
                <TableCell className="py-2">{carListing.suspension || 'N/A'}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="py-2 font-medium text-gray-500">Brakes</TableCell>
                <TableCell className="py-2">{carListing.brakes || 'N/A'}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="py-2 font-medium text-gray-500">Location</TableCell>
                <TableCell className="py-2">{carListing.location || 'N/A'}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </div>
    </Card>
  );
};

export default CarSpecifications;
