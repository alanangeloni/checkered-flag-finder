
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { ListCarFormValues, formSchema } from '../list-car/ListCarSchema';
import { v4 as uuidv4 } from 'uuid';

export const useEditCarForm = (carId: string | undefined) => {
  const [carData, setCarData] = useState<any>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<any[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  
  const form = useForm<ListCarFormValues>({
    resolver: zodResolver(formSchema),
    mode: 'onSubmit', // Only validate on submit
    reValidateMode: 'onSubmit',
  });

  // Fetch car data
  useEffect(() => {
    const fetchCarData = async () => {
      if (!carId) return;

      try {
        console.log("Fetching car data for ID:", carId);
        
        // Fetch car listing data
        const { data: carData, error } = await supabase
          .from('car_listings')
          .select('*, images:car_images(*)')
          .eq('id', carId)
          .single();

        if (error) {
          console.error("Error fetching car data:", error);
          throw error;
        }
        
        console.log("Car data retrieved:", carData);
        
        if (carData) {
          setCarData(carData);
          setSelectedCategory(carData.category_id);
          
          // Set form values from the fetched data
          form.reset({
            name: carData.name,
            make: carData.make,
            model: carData.model || '',
            year: carData.year ? String(carData.year) : '',
            categoryId: carData.category_id || '',
            subcategoryId: carData.subcategory_id || '',
            price: carData.price ? String(carData.price) : '',
            shortDescription: carData.short_description,
            detailedDescription: carData.detailed_description || '',
            location: carData.location || '',
            engineHours: carData.engine_hours ? String(carData.engine_hours) : '',
            engineSpecs: carData.engine_specs || '',
            raceCarType: carData.race_car_type || '',
            drivetrain: carData.drivetrain || '',
            transmission: carData.transmission || '',
            safetyEquipment: carData.safety_equipment || '',
            suspension: carData.suspension || '',
            brakes: carData.brakes || '',
            weight: carData.weight || '',
            sellerType: carData.seller_type || ''
          });

          // Setup images
          if (carData.images && carData.images.length > 0) {
            console.log("Found existing images:", carData.images);
            setExistingImages(carData.images);
            const imageUrls = carData.images.map((img: any) => img.image_url);
            setPreviewImages(imageUrls);
          } else {
            console.log("No existing images found");
          }
        }
      } catch (error: any) {
        console.error('Error fetching car data:', error);
        toast.error('Failed to load car data: ' + error.message);
      }
    };

    fetchCarData();
  }, [carId, form]);

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
    // Check if this is an existing image or a new one
    if (index < existingImages.length) {
      // It's an existing image - mark for deletion
      setExistingImages(prev => {
        const updated = [...prev];
        updated.splice(index, 1);
        return updated;
      });
      
      // Update the preview images
      setPreviewImages(prev => {
        const updated = [...prev];
        updated.splice(index, 1);
        return updated;
      });
    } else {
      // It's a new image
      const newImageIndex = index - existingImages.length;
      
      // Revoke URL to prevent memory leaks
      URL.revokeObjectURL(previewImages[index]);
      
      // Remove from state
      setImageFiles(prev => {
        const updated = [...prev];
        updated.splice(newImageIndex, 1);
        return updated;
      });
      
      // Update preview images
      setPreviewImages(prev => {
        const updated = [...prev];
        updated.splice(index, 1);
        return updated;
      });
    }
  };

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;
    
    const sourceIndex = result.source.index;
    const destIndex = result.destination.index;
    
    // Update preview images order
    setPreviewImages(prev => {
      const updated = [...prev];
      const [moved] = updated.splice(sourceIndex, 1);
      updated.splice(destIndex, 0, moved);
      return updated;
    });
    
    // Update existing and new images accordingly
    // This is complex because we need to track both existing and new images
    if (sourceIndex < existingImages.length && destIndex < existingImages.length) {
      // Both are existing images, update existingImages order
      setExistingImages(prev => {
        const updated = [...prev];
        const [moved] = updated.splice(sourceIndex, 1);
        updated.splice(destIndex, 0, moved);
        return updated;
      });
    } else if (sourceIndex >= existingImages.length && destIndex >= existingImages.length) {
      // Both are new images, update imageFiles order
      const newSourceIndex = sourceIndex - existingImages.length;
      const newDestIndex = destIndex - existingImages.length;
      
      setImageFiles(prev => {
        const updated = [...prev];
        const [moved] = updated.splice(newSourceIndex, 1);
        updated.splice(newDestIndex, 0, moved);
        return updated;
      });
    } 
    // The mixed case (moving between existing and new) is complex
    // and would require a complete reorganization of both arrays
    // For simplicity, we'll just update the visual order for now
  };

  const onSubmit = async (values: ListCarFormValues) => {
    console.log('Form submitted with values:', values);
    try {
      setIsSubmitting(true);
      console.log("Starting submission for edit...");

      // Check if the user is logged in
      const { data } = await supabase.auth.getSession();
      const session = data.session;
      
      console.log('Session check result:', session ? 'User is logged in' : 'No active session');
      console.log('Image files to upload:', imageFiles.length);
      
      if (!session) {
        toast.error('You must be logged in to update a listing');
        navigate('/login');
        return;
      }

      // Check if user owns this listing
      if (carData && carData.user_id !== session.user.id) {
        toast.error('You can only edit your own listings');
        navigate('/listings');
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

      console.log("Updating car listing...");

      // Update the car listing
      console.log('Updating car listing with ID:', carId);
      
      const { data: updatedCar, error: updateError } = await supabase
        .from('car_listings')
        .update({
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
          slug: carSlug,
          updated_at: new Date().toISOString()
        })
        .eq('id', carId)
        .select()
        .single();

      if (updateError) {
        console.error("Error updating car listing:", updateError);
        throw updateError;
      }
      
      console.log("Car listing updated successfully:", updatedCar);

      // Handle deleted existing images (if any)
      const imagesToDelete = carData.images ? carData.images.filter((img: any) => 
        !existingImages.some(existing => existing.id === img.id)
      ) : [];
      
      console.log('Images to delete:', imagesToDelete);
      
      if (imagesToDelete.length > 0) {
        console.log(`Deleting ${imagesToDelete.length} images...`);
        
        for (const img of imagesToDelete) {
          console.log(`Deleting image ${img.id}...`);
          
          // Delete from car_images table
          const { error: deleteImageError } = await supabase
            .from('car_images')
            .delete()
            .eq('id', img.id);
            
          if (deleteImageError) {
            console.error('Error deleting image record:', deleteImageError);
          }
        }
      }

      // Handle any new image uploads
      if (imageFiles.length > 0 && updatedCar) {
        console.log('Car ID for image uploads:', updatedCar.id);
        console.log('User ID for image uploads:', session.user.id);
        console.log(`Uploading ${imageFiles.length} new images...`);
        
        // Upload each image sequentially
        for (let i = 0; i < imageFiles.length; i++) {
          const file = imageFiles[i];
          
          try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${uuidv4()}.${fileExt}`;
            const filePath = `${session.user.id}/${updatedCar.id}/${fileName}`;
            
            console.log(`Uploading image ${i + 1}/${imageFiles.length}: ${filePath}`);
            
            // Upload the file to storage
            console.log(`Attempting to upload ${filePath} to car_images bucket...`);
            const { data: uploadData, error: uploadError } = await supabase.storage
              .from('car_images')
              .upload(filePath, file, {
                cacheControl: '3600',
                upsert: true // Allow overwriting if needed
              });
              
            console.log('Upload result:', uploadError ? 'Error' : 'Success', uploadData);
            
            if (uploadError) {
              console.error(`Error uploading image ${i}:`, uploadError);
              toast.error(`Failed to upload image ${i + 1}: ${uploadError.message}`);
              continue;
            }
            
            // Get the public URL
            const { data: publicURLData } = supabase.storage
              .from('car_images')
              .getPublicUrl(filePath);
            
            if (!publicURLData || !publicURLData.publicUrl) {
              console.error(`Failed to get public URL for image ${i}`);
              continue;
            }
            
            console.log(`Image ${i + 1} uploaded, URL:`, publicURLData.publicUrl);
            
            // Add image record to car_images table
            const isPrimary = existingImages.length === 0 && i === 0; // First image is primary if no existing images
            
            const { data: imageRecord, error: imageRecordError } = await supabase
              .from('car_images')
              .insert({
                car_id: updatedCar.id,
                image_url: publicURLData.publicUrl,
                is_primary: isPrimary
              })
              .select()
              .single();
            
            if (imageRecordError) {
              console.error(`Error creating image record ${i}:`, imageRecordError);
              toast.error(`Failed to save image ${i + 1} to database`);
            }
          } catch (err) {
            console.error(`Unexpected error with image ${i}:`, err);
          }
        }
      }
      
      // Step 3: Fetch the complete car listing with images to confirm update
      const { data: completeCarListing, error: fetchError } = await supabase
        .from('car_listings')
        .select(`
          *,
          images:car_images(*)
        `)
        .eq('id', updatedCar.id)
        .single();

      if (fetchError) {
        console.error('Error fetching complete car listing:', fetchError);
      } else {
        console.log('Updated car listing with images:', completeCarListing);
      }
      
      toast.success('Car listing updated successfully!');
      navigate(`/car-details/${carSlug}`);
    } catch (err: any) {
      console.error('Error updating listing:', err);
      toast.error(err.message || 'Failed to update listing');
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    form,
    carData,
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

export default useEditCarForm;
