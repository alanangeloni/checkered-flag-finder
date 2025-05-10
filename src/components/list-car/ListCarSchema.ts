
import { z } from 'zod';

// Form schema with validation rules
export const formSchema = z.object({
  name: z.string().min(3, 'Car name must be at least 3 characters'),
  make: z.string().min(1, 'Make is required'),
  model: z.string().optional(),
  year: z.string().regex(/^\d{4}$/, 'Year must be a 4-digit number'),
  categoryId: z.string().min(1, 'Category is required'),
  subcategoryId: z.string().optional(),
  price: z.string().min(1, 'Price is required'),
  shortDescription: z.string().min(10, 'Short description must be at least 10 characters'),
  detailedDescription: z.string().optional(),
  location: z.string().optional(),
  engineHours: z.string().optional(),
  engineSpecs: z.string().optional(),
  raceCarType: z.string().optional(),
  drivetrain: z.string().optional(),
  transmission: z.string().optional(),
  safetyEquipment: z.string().optional(),
  suspension: z.string().optional(),
  brakes: z.string().optional(),
  weight: z.string().optional(),
  sellerType: z.string().optional(),
});

// Define the type from the schema
export type ListCarFormValues = z.infer<typeof formSchema>;

// Default form values
export const defaultFormValues: ListCarFormValues = {
  name: '',
  make: '',
  model: '',
  year: '',
  categoryId: '',
  subcategoryId: '',
  price: '',
  shortDescription: '',
  detailedDescription: '',
  location: '',
  engineHours: '',
  engineSpecs: '',
  raceCarType: '',
  drivetrain: '',
  transmission: '',
  safetyEquipment: '',
  suspension: '',
  brakes: '',
  weight: '',
  sellerType: '',
};
