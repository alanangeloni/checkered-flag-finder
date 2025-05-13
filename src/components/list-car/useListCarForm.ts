
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
    if (!files || files.length === 0) return;
    
    // Validate files (size, type, etc.)
    const validFiles = Array.from(files).filter(file => {
      // Check file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} is too large. Maximum size is 5MB.`);
        return false;
      }
      
      // Check file type
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} is not an image.`);
        return false;
      }
      
      return true;
    });
    
    if (validFiles.length === 0) return;
    
    // Store the files for later upload
    setImageFiles(prev => [...prev, ...validFiles]);
    
    // Create preview URLs
    const newPreviewImages = validFiles.map(file => URL.createObjectURL(file));
    setPreviewImages(prev => [...prev, ...newPreviewImages]);
    
    // Clear the input to allow selecting the same file again
    if (event.target) {
      event.target.value = '';
    }
  };

  const removeImage = (index: number) => {
    // Revoke object URL to avoid memory leaks
    URL.revokeObjectURL(previewImages[index]);
    
    // Remove from state
    setPreviewImages(prev => {
      const updated = [...prev];
      updated.splice(index, 1);
      return updated;
    });
    
    setImageFiles(prev => {
      const updated = [...prev];
      updated.splice(index, 1);
      return updated;
    });
  };
  
  // Handle drag end event for reordering images
  const handleDragEnd = (result: any) => {
    if (!result.destination) return;
    
    const sourceIndex = result.source.index;
    const destIndex = result.destination.index;
    
    // Reorder preview images
    setPreviewImages(prev => {
      const updated = [...prev];
      const [moved] = updated.splice(sourceIndex, 1);
      updated.splice(destIndex, 0, moved);
      return updated;
    });
    
    // Reorder image files
    setImageFiles(prev => {
      const updated = [...prev];
      const [moved] = updated.splice(sourceIndex, 1);
      updated.splice(destIndex, 0, moved);
      return updated;
    });
  };

  const onSubmit = async (values: ListCarFormValues) => {
    try {
      setIsSubmitting(true);
      console.log("Starting submission...");

      // Check if the user is logged in
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('You must be logged in to list a car');
        navigate('/login');
        return;
      }

      // Generate a slug for the car listing
      const carSlug = values.name.toLowerCase()
        .replace(/[^\w\s]/gi, '')
        .replace(/\s+/g, '-');

      // Handle category and subcategory IDs
      let categoryId = null;
      if (values.categoryId && values.categoryId !== '' && values.categoryId !== '1') {
        categoryId = values.categoryId;
      }

      let subcategoryId = null;
      if (values.subcategoryId && values.subcategoryId !== '') {
        subcategoryId = values.subcategoryId;
      }

      console.log("Creating car listing...");
      
      // Create the car listing
      const { data: carListing, error: carError } = await supabase
        .from('car_listings')
        .insert({
          name: values.name,
          make: values.make,
          model: values.model || null,
          year: values.year ? parseInt(values.year) : null,
          category_id: categoryId,
          subcategory_id: subcategoryId,
          price: values.price ? parseFloat(values.price) : 0,
          short_description: values.shortDescription,
          detailed_description: values.detailedDescription || null,
          location: values.location || null,
          user_id: session.user.id,
          engine_hours: values.engineHours ? parseInt(values.engineHours) : null,
          engine_specs: values.engineSpecs || null,
          race_car_type: values.raceCarType || null,
          drivetrain: values.drivetrain || null,
          transmission: values.transmission || null,
          safety_equipment: values.safetyEquipment || null,
          suspension: values.suspension || null,
          brakes: values.brakes || null,
          weight: values.weight || null,
          seller_type: values.sellerType || null,
          slug: carSlug
        })
        .select()
        .single();

      if (carError) {
        console.error('Error creating listing:', carError);
        throw carError;
      }

      console.log("Car listing created:", carListing);

      // Handle image uploads
      if (imageFiles.length > 0 && carListing) {
        console.log(`Uploading ${imageFiles.length} images...`);
        
        for (let i = 0; i < imageFiles.length; i++) {
          const file = imageFiles[i];
          
          try {
            // Generate unique filename
            const fileExt = file.name.split('.').pop();
            const fileName = `${uuidv4()}.${fileExt}`;
            const filePath = `${session.user.id}/${carListing.id}/${fileName}`;
            
            console.log(`Uploading image ${i + 1}/${imageFiles.length}: ${filePath}`);
            
            // Upload the file to storage
            const { error: uploadError } = await supabase.storage
              .from('car-images')
              .upload(filePath, file);
            
            if (uploadError) {
              console.error(`Error uploading image ${i}:`, uploadError);
              toast.error(`Failed to upload image ${i + 1}: ${uploadError.message}`);
              continue;
            }
            
            // Get the public URL
            const { data: publicURLData } = supabase.storage
              .from('car-images')
              .getPublicUrl(filePath);
            
            if (!publicURLData || !publicURLData.publicUrl) {
              console.error(`Failed to get public URL for image ${i}`);
              continue;
            }
            
            console.log(`Image ${i + 1} uploaded, URL:`, publicURLData.publicUrl);
            
            // Add image record to car_images table
            const { error: imageRecordError } = await supabase
              .from('car_images')
              .insert({
                car_id: carListing.id,
                image_url: publicURLData.publicUrl,
                is_primary: i === 0 // First image is primary
              });
            
            if (imageRecordError) {
              console.error(`Error creating image record ${i}:`, imageRecordError);
              toast.error(`Failed to save image ${i + 1} to database`);
            }
          } catch (err) {
            console.error(`Unexpected error with image ${i}:`, err);
            toast.error(`Error processing image ${i + 1}`);
          }
        }
      }
      
      toast.success('Car listing created successfully!');
      navigate(`/car-details/${carSlug}`);
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
    isSubmitting,
    handleCategoryChange,
    handleImageUpload,
    removeImage,
    handleDragEnd,
    onSubmit,
  };
};

export default useListCarForm;
