
import React, { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { UploadCloud } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

// Updated categories data
const categories = [
  { id: '1', name: 'Open Wheel' },
  { id: '2', name: 'Prototype' },
  { id: '3', name: 'GT' },
  { id: '4', name: 'Stock Car' },
  { id: '5', name: 'Touring' },
  { id: '6', name: 'Rally' },
  { id: '7', name: 'Drift' },
  { id: '8', name: 'Drag' },
  { id: '9', name: 'Vintage and Classic' },
  { id: '10', name: 'Production' },
  { id: '11', name: 'Karts' },
];

// Updated subcategories by category
const subcategoriesByCategory = {
  '1': [
    { id: '101', name: 'Formula 1' },
    { id: '102', name: 'Formula 2' },
    { id: '103', name: 'IndyCar' },
    { id: '104', name: 'Formula 3' },
    { id: '105', name: 'Formula E' },
  ],
  '2': [
    { id: '201', name: 'Hypercar' },
    { id: '202', name: 'LMP1' },
    { id: '203', name: 'LMP2' },
    { id: '204', name: 'LMP3' },
  ],
  '3': [
    { id: '301', name: 'GT1' },
    { id: '302', name: 'GT2' },
    { id: '303', name: 'GT3' },
    { id: '304', name: 'GT4' },
    { id: '305', name: 'GTE' },
  ],
  '4': [
    { id: '401', name: 'NASCAR Cup Series' },
    { id: '402', name: 'NASCAR Xfinity Series' },
    { id: '403', name: 'NASCAR Truck Series' },
    { id: '404', name: 'ARCA' },
  ],
  '5': [
    { id: '501', name: 'BTCC' },
    { id: '502', name: 'DTM' },
    { id: '503', name: 'WTCC' },
    { id: '504', name: 'TCR' },
    { id: '505', name: 'V8 Supercars' },
  ],
  '6': [
    { id: '601', name: 'WRC' },
    { id: '602', name: 'Rally Cross' },
    { id: '603', name: 'Rally Raid' },
    { id: '604', name: 'Historic Rally' },
  ],
  '7': [
    { id: '701', name: 'Formula Drift' },
    { id: '702', name: 'D1 Grand Prix' },
    { id: '703', name: 'Drift Masters European Championship' },
  ],
  '8': [
    { id: '801', name: 'Top Fuel' },
    { id: '802', name: 'Funny Car' },
    { id: '803', name: 'Pro Stock' },
    { id: '804', name: 'Pro Modified' },
  ],
  '9': [
    { id: '901', name: '1950s' },
    { id: '902', name: '1960s' },
    { id: '903', name: '1970s' },
    { id: '904', name: '1980s' },
    { id: '905', name: 'Pre-War' },
  ],
  '10': [
    { id: '1001', name: 'Production Sports Cars' },
    { id: '1002', name: 'Production Saloons' },
    { id: '1003', name: 'One-Make Series' },
  ],
  '11': [
    { id: '1101', name: 'Shifter Karts' },
    { id: '1102', name: 'Sprint Karts' },
    { id: '1103', name: 'Indoor Karts' },
    { id: '1104', name: 'Superkarts' },
  ],
};

// Updated race car types dropdown options
const raceCarTypes = [
  'Formula 1',
  'Formula 2',
  'Formula 3',
  'IndyCar',
  'GT3',
  'GT4',
  'LMP1',
  'LMP2',
  'NASCAR',
  'Touring Car',
  'Rally Car',
  'Drift Car',
  'Drag Racer',
  'Vintage Racer',
  'Production Based',
  'Kart',
  'Other'
];

// Updated schema to include our race car fields
const formSchema = z.object({
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

const ListCar = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
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
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsSubmitting(true);

      // Check if the user is logged in
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('You must be logged in to list a car');
        navigate('/login');
        return;
      }

      // Create the car listing
      const { data: carListing, error: carError } = await supabase
        .from('car_listings')
        .insert({
          name: values.name,
          make: values.make,
          model: values.model,
          year: values.year ? parseInt(values.year) : null,
          category_id: values.categoryId,
          subcategory_id: values.subcategoryId,
          price: values.price ? parseFloat(values.price) : 0,
          short_description: values.shortDescription,
          detailed_description: values.detailedDescription,
          location: values.location,
          user_id: session.user.id,
          engine_hours: values.engineHours ? parseInt(values.engineHours) : null,
          engine_specs: values.engineSpecs,
          race_car_type: values.raceCarType,
          drivetrain: values.drivetrain,
          transmission: values.transmission,
          safety_equipment: values.safetyEquipment,
          suspension: values.suspension,
          brakes: values.brakes,
          weight: values.weight,
          seller_type: values.sellerType,
        })
        .select()
        .single();

      if (carError) throw carError;

      // Handle image uploads if needed
      if (imageFiles.length > 0 && carListing) {
        // Logic for handling image uploads would go here
        toast.success('Car listing created successfully!');
        navigate(`/car-details/${carListing.id}`);
      } else {
        toast.success('Car listing created successfully!');
        navigate(`/car-details/${carListing.id}`);
      }
    } catch (err: any) {
      console.error('Error creating listing:', err);
      toast.error(err.message || 'Failed to create listing');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
    form.setValue('categoryId', categoryId);
    form.setValue('subcategoryId', ''); // Reset subcategory when category changes
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;
    
    // Store the files for later upload
    const newFiles = Array.from(files);
    setImageFiles([...imageFiles, ...newFiles]);
    
    // Create preview URLs
    const newPreviewImages = newFiles.map(file => URL.createObjectURL(file));
    setPreviewImages([...previewImages, ...newPreviewImages]);
  };

  const removeImage = (index: number) => {
    const newImageFiles = [...imageFiles];
    newImageFiles.splice(index, 1);
    setImageFiles(newImageFiles);

    const newPreviewImages = [...previewImages];
    URL.revokeObjectURL(newPreviewImages[index]);
    newPreviewImages.splice(index, 1);
    setPreviewImages(newPreviewImages);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">List Your Race Car</h1>
        
        <Card className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Basic Information */}
              <div>
                <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Car Name/Title</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. 2022 Ferrari F1-75" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="make"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Make/Brand</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Ferrari" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="model"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Model (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. F1-75" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="year"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Year</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. 2022" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="categoryId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select 
                          onValueChange={(value) => handleCategoryChange(value)}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {categories.map((category) => (
                              <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="subcategoryId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Subcategory (Optional)</FormLabel>
                        <Select 
                          onValueChange={field.onChange}
                          value={field.value}
                          disabled={!selectedCategory}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a subcategory" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {selectedCategory && subcategoriesByCategory[selectedCategory as keyof typeof subcategoriesByCategory]?.map((subcategory) => (
                              <SelectItem key={subcategory.id} value={subcategory.id}>{subcategory.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price ($)</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. 250000" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Location (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Miami, FL" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Race Car Specifications */}
              <div>
                <h2 className="text-xl font-semibold mb-4">Race Car Specifications</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
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
                    control={form.control}
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
                    control={form.control}
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
                    control={form.control}
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
                    control={form.control}
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
                    control={form.control}
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
                    control={form.control}
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
                    control={form.control}
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
                    control={form.control}
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
                    control={form.control}
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

              {/* Description */}
              <div>
                <h2 className="text-xl font-semibold mb-4">Description</h2>
                <FormField
                  control={form.control}
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
                    control={form.control}
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

              {/* Image Upload */}
              <div>
                <h2 className="text-xl font-semibold mb-4">Images</h2>
                <Label htmlFor="images">Car Images</Label>
                <div className="mt-2 border-2 border-dashed border-gray-300 rounded-md p-6 text-center">
                  <div className="flex flex-col items-center">
                    <UploadCloud className="h-10 w-10 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600">Upload images of your car</p>
                    <p className="text-xs text-gray-500 mb-3">PNG, JPG, GIF up to 5MB each</p>
                    <Input 
                      id="images" 
                      type="file" 
                      accept="image/*" 
                      multiple
                      className="hidden" 
                      onChange={handleImageUpload}
                    />
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={() => document.getElementById('images')?.click()}
                    >
                      Select Files
                    </Button>
                  </div>
                </div>

                {previewImages.length > 0 && (
                  <div className="mt-4 grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {previewImages.map((src, index) => (
                      <div key={index} className="relative">
                        <img 
                          src={src} 
                          alt={`Car preview ${index + 1}`}
                          className="w-full h-24 object-cover rounded-md"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-1 right-1 h-5 w-5"
                          onClick={() => removeImage(index)}
                        >
                          ×
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <Button 
                type="submit" 
                variant="primary" 
                className="w-full md:w-auto"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Listing'}
              </Button>
            </form>
          </Form>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default ListCar;
