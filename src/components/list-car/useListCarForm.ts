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

  // Function to create car listing and handle image uploads
  const createCarListingWithImages = async (values: ListCarFormValues, userId: string) => {
    try {
      // Generate a slug for the car listing
      const carSlug = values.name.toLowerCase()
        .replace(/[^\w\s]/gi, '')
        .replace(/\s+/g, '-');

      console.log("Creating car listing...");
      console.log("Values:", values);

      // Prepare data for insertion
      const carData: any = {
        name: values.name,
        make: values.make,
        model: values.model || null,
        year: values.year ? parseInt(values.year) : null,
        price: values.price ? parseFloat(values.price) : 0,
        short_description: values.shortDescription,
        detailed_description: values.detailedDescription || null,
        location: values.location || null,
        user_id: userId,
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
      };
      
      // Add category/subcategory only if they're valid
      if (values.categoryId && values.categoryId !== '' && values.categoryId !== '1') {
        if (typeof values.categoryId === 'string' && values.categoryId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
          carData.category_id = values.categoryId;
        } else {
          console.log("Invalid category ID format, setting to null:", values.categoryId);
        }
      }
      
      if (values.subcategoryId && values.subcategoryId !== '') {
        if (typeof values.subcategoryId === 'string' && values.subcategoryId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
          carData.subcategory_id = values.subcategoryId;
        } else {
          console.log("Invalid subcategory ID format, setting to null:", values.subcategoryId);
        }
      }

      console.log("Prepared car data:", carData);

      // Step 1: Create the car listing first
      const { data: carListing, error: carError } = await supabase
        .from('car_listings')
        .insert(carData)
        .select()
        .single();

      if (carError) {
        console.error('Error creating listing:', carError);
        throw new Error(`Failed to create car listing: ${carError.message}`);
      }

      if (!carListing) {
        throw new Error('Car listing was created but no data was returned');
      }

      console.log("Car listing created:", carListing);

      // Step 2: Upload images and create image records
      const uploadedImages = [];
      const failedImages = [];

      // Skip bucket existence check and proceed with uploads
      console.log("Proceeding with image uploads to car_images bucket...");
      
      // Debug: List available buckets anyway (for logging purposes)
      try {
        const { data: buckets } = await supabase.storage.listBuckets();
        console.log("Available buckets (for debugging):", buckets?.map(b => b.name));
      } catch (err) {
        console.log("Could not list buckets for debugging:", err);
      }

      if (imageFiles.length > 0) {
        console.log(`Uploading ${imageFiles.length} images to bucket 'car_images'...`);
        
        // Wrap the entire upload process in a try-catch to catch any unexpected errors
        try {
          for (let i = 0; i < imageFiles.length; i++) {
            const file = imageFiles[i];
            
            try {
              // Generate unique filename
              const fileExt = file.name.split('.').pop();
              const fileName = `${uuidv4()}.${fileExt}`;
              const filePath = `${carListing.id}/${fileName}`;
              
              console.log(`Uploading image ${i + 1}/${imageFiles.length}: ${filePath}`);
              
              // Upload the file to storage
              console.log(`Attempting to upload ${filePath} to car_images bucket...`);
              const { data: uploadData, error: uploadError } = await supabase.storage
                .from('car_images')
                .upload(filePath, file, {
                  cacheControl: '3600',
                  upsert: true // Changed to true to allow overwriting if needed
                });
              
              if (uploadError) {
                console.error(`Error uploading image ${i}:`, uploadError);
                failedImages.push({ file: file.name, error: uploadError.message });
                continue;
              }
              
              console.log(`Upload successful for image ${i + 1}:`, uploadData);
              
              // Get the public URL
              const { data: publicURLData } = supabase.storage
                .from('car_images')
                .getPublicUrl(filePath);
              
              if (!publicURLData || !publicURLData.publicUrl) {
                console.error(`Failed to get public URL for image ${i}`);
                failedImages.push({ file: file.name, error: 'Failed to get public URL' });
                continue;
              }
              
              console.log(`Image ${i + 1} uploaded, URL:`, publicURLData.publicUrl);
              
              // Add image record to car_images table with is_primary true for first image only
              const isPrimary = i === 0;
              const { data: imageRecord, error: imageRecordError } = await supabase
                .from('car_images')
                .insert({
                  car_id: carListing.id,
                  image_url: publicURLData.publicUrl,
                  is_primary: isPrimary
                })
                .select()
                .single();
              
              if (imageRecordError) {
                console.error(`Error creating image record ${i}:`, imageRecordError);
                failedImages.push({ file: file.name, error: imageRecordError.message });
              } else if (imageRecord) {
                uploadedImages.push(imageRecord);
                console.log(`Image record created for image ${i + 1}:`, imageRecord);
              }
            } catch (err: any) {
              console.error(`Unexpected error with image ${i}:`, err);
              failedImages.push({ file: `Image ${i + 1}`, error: err.message || 'Unknown error' });
            }
          }
        } catch (outerErr: any) {
          console.error('Unexpected error during image upload process:', outerErr);
          throw new Error(`Image upload process failed: ${outerErr.message || 'Unknown error'}`);
        }
      }

      // Step 3: Fetch the complete car listing with images
      const { data: completeCarListing, error: fetchError } = await supabase
        .from('car_listings')
        .select(`
          *,
          images:car_images(*)
        `)
        .eq('id', carListing.id)
        .single();

      if (fetchError) {
        console.error('Error fetching complete car listing:', fetchError);
      }

      // Handle any failed uploads
      if (failedImages.length > 0) {
        const failedCount = failedImages.length;
        const successCount = uploadedImages.length;
        
        if (successCount > 0) {
          toast.warning(
            `${successCount} image(s) uploaded successfully, but ${failedCount} failed. Your listing was still created.`, 
            { duration: 6000 }
          );
        } else {
          toast.error(
            `Failed to upload all ${failedCount} images, but your listing was still created.`, 
            { duration: 6000 }
          );
        }
        
        console.error('Failed image uploads:', failedImages);
      }

      return { 
        success: true, 
        carListing: completeCarListing || carListing,
        uploadedImages,
        failedImages 
      };
    } catch (err: any) {
      console.error('Error in createCarListingWithImages:', err);
      throw err;
    }
  };

  const onSubmit = async (values: ListCarFormValues) => {
    try {
      setIsSubmitting(true);
      console.log("Starting submission...");
      console.log("Form values:", values);
      console.log("Image files:", imageFiles.length, "preview images:", previewImages.length);

      // Check if the user is logged in
      console.log("Checking user session...");
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.error("No active session found");
        toast.error('You must be logged in to list a car');
        navigate('/login');
        return;
      }
      console.log("User authenticated:", session.user.id);

      // Use the extraction function to create listing and upload images
      console.log("Calling createCarListingWithImages...");
      const result = await createCarListingWithImages(values, session.user.id);
      console.log("Result from createCarListingWithImages:", result);
      
      if (result.success) {
        const successMessage = result.failedImages.length > 0
          ? `Car listing created with ${result.uploadedImages.length} images`
          : 'Car listing created successfully!';
          
        console.log("Success message:", successMessage);
        toast.success(successMessage);
        
        // Navigate to the car details page
        const slug = result.carListing.slug || result.carListing.id;
        console.log("Navigating to car details page:", slug);
        navigate(`/car-details/${slug}`);
      } else {
        console.error("Result indicated failure but no error was thrown");
        toast.error("Failed to create listing");
      }
    } catch (err: any) {
      console.error('Error creating listing:', err);
      console.error('Error stack:', err.stack);
      toast.error(err.message || 'Failed to create listing');
    } finally {
      console.log("Setting isSubmitting to false");
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
    createCarListingWithImages
  };
};

export default useListCarForm;
