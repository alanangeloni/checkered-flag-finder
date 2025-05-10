
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Control } from 'react-hook-form';
import { ListCarFormValues } from './ListCarSchema';
import { raceCarTypes } from './ListCarFormData';

interface SpecificationsSectionProps {
  control: Control<ListCarFormValues>;
}

export const SpecificationsSection: React.FC<SpecificationsSectionProps> = ({ control }) => {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Race Car Specifications</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          control={control}
          name="engineHours"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Engine Hours</FormLabel>
              <FormControl>
                <Input placeholder="e.g. 200" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="engineSpecs"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Engine Specifications</FormLabel>
              <FormControl>
                <Input placeholder="e.g. 4.0L Flat-6, 502hp" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="raceCarType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Race Car Type</FormLabel>
              <Select 
                onValueChange={field.onChange}
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select race car type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {raceCarTypes.map((type) => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="drivetrain"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Drivetrain</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Rear-wheel drive" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="transmission"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Transmission</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Sequential Racing Gearbox" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="safetyEquipment"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Safety Equipment</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Full Roll Cage, Fire Suppression" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="suspension"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Suspension</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Racing Coilovers, Adjustable" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="brakes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Brakes</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Carbon Ceramic, 6-piston" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="weight"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Weight</FormLabel>
              <FormControl>
                <Input placeholder="e.g. 2,800 lbs" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="sellerType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Seller Type</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Professional Race Team" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};

export default SpecificationsSection;
