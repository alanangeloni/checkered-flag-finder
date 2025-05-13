
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
  });

  // Fetch car data
  useEffect(() => {
    const fetchCarData = async () => {
      if (!carId) return;

      try {
        // Fetch car listing data
        const { data: carData, error } = await supabase
          .from('car_listings')
          .select('*, images:car_images(*)')
          .eq('id', carId)
          .single();

        if (error) throw error;
        
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
            setExistingImages(carData.images);
            const imageUrls = carData.images.map((img: any) => img.image_url);
            setPreviewImages(imageUrls);
          }
        }
      } catch (error: any) {
        console.error('Error fetching car data:', error);
        toast.error('Failed to load car data');
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
    
    // Store the files for later upload
    const newFiles = Array.from(files);
    setImageFiles([...imageFiles, ...newFiles]);
    
    // Create preview URLs
    const newPreviewImages = newFiles.map(file => URL.createObjectURL(file));
    setPreviewImages([...previewImages, ...newPreviewImages]);
    
    // Clear the input to allow selecting the same file again
    if (event.target) {
      event.target.value = '';
    }
  };

  const removeImage = (index: number) => {
    // Check if this is an existing image or a new one
    if (index < existingImages.length) {
      // It's an existing image
      const updatedExistingImages = [...existingImages];
      const removedImage = updatedExistingImages.splice(index, 1)[0];
      setExistingImages(updatedExistingImages);
      
      // Mark image for deletion in database later
      // This would need to be implemented in the onSubmit function
    } else {
      // It's a new image
      const newImageIndex = index - existingImages.length;
      const newImageFiles = [...imageFiles];
      newImageFiles.splice(newImageIndex, 1);
      setImageFiles(newImageFiles);
    }

    // Update preview images
    const newPreviewImages = [...previewImages];
    newPreviewImages.splice(index, 1);
    setPreviewImages(newPreviewImages);
  };

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;
    
    const items = Array.from(previewImages);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    setPreviewImages(items);
    
    // Update existing and new images accordingly
    // This is more complex and would need detailed implementation
  };

  const onSubmit = async (values: ListCarFormValues) => {
    try {
      setIsSubmitting(true);

      // Check if the user is logged in
      const { data: { session } } = await supabase.auth.getSession();
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
      const carSlug = values.name.toLowerCase().replace(/[^\w\s]/gi, '').replace(/\s+/g, '-');

      // Handle category and subcategory IDs - ensure they are valid UUIDs or null
      const categoryId = values.categoryId && values.categoryId !== '1' ? values.categoryId : null;
      const subcategoryId = values.subcategoryId && values.subcategoryId !== '' ? values.subcategoryId : null;

      // Update the car listing
      const { data: updatedCar, error: updateError } = await supabase
        .from('car_listings')
        .update({
          name: values.name,
          make: values.make,
          model: values.model,
          year: values.year ? parseInt(values.year) : null,
          category_id: categoryId,
          subcategory_id: subcategoryId,
          price: values.price ? parseFloat(values.price) : 0,
          short_description: values.shortDescription,
          detailed_description: values.detailedDescription,
          location: values.location,
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
          slug: carSlug,
          updated_at: new Date().toISOString()
        })
        .eq('id', carId)
        .select()
        .single();

      if (updateError) throw updateError;

      // Handle any new image uploads
      if (imageFiles.length > 0 && updatedCar) {
        for (let i = 0; i < imageFiles.length; i++) {
          const file = imageFiles[i];
          const fileExt = file.name.split('.').pop();
          const fileName = `${uuidv4()}.${fileExt}`;
          const filePath = `${session.user.id}/${updatedCar.id}/${fileName}`;
          
          console.log('Uploading image to:', filePath);
          
          // Upload the file to storage
          const { error: uploadError } = await supabase.storage
            .from('car-images')
            .upload(filePath, file);
          
          if (uploadError) {
            console.error('Error uploading image:', uploadError);
            continue;
          }
          
          // Get the public URL
          const { data: publicURL } = supabase.storage
            .from('car-images')
            .getPublicUrl(filePath);
          
          // Add image record to car_images table
          const isPrimary = existingImages.length === 0 && i === 0; // First image is primary if no existing images
          
          const { error: imageRecordError } = await supabase
            .from('car_images')
            .insert({
              car_id: updatedCar.id,
              image_url: publicURL.publicUrl,
              is_primary: isPrimary
            });
          
          if (imageRecordError) {
            console.error('Error creating image record:', imageRecordError);
          }
        }
      }
      
      toast.success('Car listing updated successfully!');
      navigate(`/car-details/${carId}/${carSlug}`);
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
