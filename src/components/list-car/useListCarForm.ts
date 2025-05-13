
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { ListCarFormValues, formSchema, defaultFormValues } from './ListCarSchema';
import { v4 as uuidv4 } from 'uuid';

export const useListCarForm = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  
  const form = useForm<ListCarFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultFormValues,
  });

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
  
  // Handle drag end event for reordering images
  const handleDragEnd = (result: any) => {
    if (!result.destination) return;
    
    const items = Array.from(previewImages);
    const files = Array.from(imageFiles);
    
    // Reorder preview images
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    // Reorder image files to match preview order
    const [reorderedFile] = files.splice(result.source.index, 1);
    files.splice(result.destination.index, 0, reorderedFile);
    
    setPreviewImages(items);
    setImageFiles(files);
  };

  const onSubmit = async (values: ListCarFormValues) => {
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
          subcategory_id: values.subcategoryId || null, // Ensure it's null if empty
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
          slug: values.name.toLowerCase().replace(/[^\w\s]/gi, '').replace(/\s+/g, '-')
        })
        .select()
        .single();

      if (carError) throw carError;

      // Handle image uploads if needed
      if (imageFiles.length > 0 && carListing) {
        toast.success('Car listing created successfully!');
        navigate(`/car-details/${carListing.id}/${carListing.slug}`);
      } else {
        toast.success('Car listing created successfully!');
        navigate(`/car-details/${carListing.id}/${carListing.slug}`);
      }
    } catch (err: any) {
      console.error('Error creating listing:', err);
      toast.error(err.message || 'Failed to create listing');
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    form,
    selectedCategory,
    previewImages,
    imageFiles,
    isSubmitting,
    handleCategoryChange,
    handleImageUpload,
    removeImage,
    handleDragEnd,
    onSubmit,
  };
};

export default useListCarForm;
