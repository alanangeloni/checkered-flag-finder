
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Control } from 'react-hook-form';
import { ListCarFormValues } from './ListCarSchema';

interface DescriptionSectionProps {
  control: Control<ListCarFormValues>;
}

export const DescriptionSection: React.FC<DescriptionSectionProps> = ({ control }) => {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Description</h2>
      <FormField
        control={control}
        name="shortDescription"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Short Description</FormLabel>
            <FormControl>
              <Input placeholder="Brief description of your car" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="mt-4">
        <FormField
          control={control}
          name="detailedDescription"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Detailed Description (Optional)</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Detailed information about the car's features, history, condition, etc." 
                  className="min-h-32" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};

export default DescriptionSection;
