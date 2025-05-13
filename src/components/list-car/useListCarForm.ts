
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

      // Prepare data for insertion, handling UUID validation
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
      
      // Only add category/subcategory if they're valid UUIDs
      if (values.categoryId && values.categoryId !== '' && values.categoryId !== '1') {
        try {
          // Validate if it's a proper UUID
          const uuid = uuidv4(); // Just to access the UUID validation logic
          if (typeof values.categoryId === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(values.categoryId)) {
            carData.category_id = values.categoryId;
          } else {
            console.log("Invalid category ID format, setting to null:", values.categoryId);
          }
        } catch (err) {
          console.log("Error validating category ID, setting to null:", err);
        }
      }
      
      if (values.subcategoryId && values.subcategoryId !== '') {
        try {
          // Validate if it's a proper UUID
          if (typeof values.subcategoryId === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(values.subcategoryId)) {
            carData.subcategory_id = values.subcategoryId;
          } else {
            console.log("Invalid subcategory ID format, setting to null:", values.subcategoryId);
          }
        } catch (err) {
          console.log("Error validating subcategory ID, setting to null:", err);
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

      // Check if storage bucket exists and create it if it doesn't
      const { data: buckets } = await supabase.storage.listBuckets();
      console.log("Available buckets:", buckets);
      
      const carImagesBucketExists = buckets?.some(bucket => bucket.name === 'car-images');
      
      if (!carImagesBucketExists) {
        try {
          console.log('Attempting to create car-images storage bucket...');
          const { data: newBucket, error: bucketError } = await supabase.storage.createBucket('car-images', {
            public: true,
            fileSizeLimit: 5242880, // 5MB in bytes
            allowedMimeTypes: ['image/png', 'image/jpeg', 'image/gif', 'image/webp']
          });
          
          if (bucketError) {
            console.error('Error creating bucket:', bucketError);
            // Continue anyway, as the bucket might still work or already exist
          } else {
            console.log('Bucket created successfully:', newBucket);
          }
        } catch (bucketErr) {
          console.error('Exception when creating bucket:', bucketErr);
          // Continue anyway
        }
      }

      if (imageFiles.length > 0) {
        console.log(`Uploading ${imageFiles.length} images...`);
        
        for (let i = 0; i < imageFiles.length; i++) {
          const file = imageFiles[i];
          
          try {
            // Generate unique filename
            const fileExt = file.name.split('.').pop();
            const fileName = `${uuidv4()}.${fileExt}`;
            const filePath = `${userId}/${carListing.id}/${fileName}`;
            
            console.log(`Uploading image ${i + 1}/${imageFiles.length}: ${filePath}`);
            
            // Upload the file to storage
            const { data: uploadData, error: uploadError } = await supabase.storage
              .from('car-images')
              .upload(filePath, file);
            
            if (uploadError) {
              console.error(`Error uploading image ${i}:`, uploadError);
              failedImages.push({ file: file.name, error: uploadError.message });
              continue;
            }
            
            console.log(`Upload successful for image ${i + 1}:`, uploadData);
            
            // Get the public URL
            const { data: publicURLData } = supabase.storage
              .from('car-images')
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

      // Check if the user is logged in
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('You must be logged in to list a car');
        navigate('/login');
        return;
      }

      // Use the extraction function to create listing and upload images
      const result = await createCarListingWithImages(values, session.user.id);
      
      if (result.success) {
        const successMessage = result.failedImages.length > 0
          ? `Car listing created with ${result.uploadedImages.length} images`
          : 'Car listing created successfully!';
          
        toast.success(successMessage);
        
        // Navigate to the car details page
        const slug = result.carListing.slug || result.carListing.id;
        navigate(`/car-details/${slug}`);
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
