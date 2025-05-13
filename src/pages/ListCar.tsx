
import React, { useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Form } from '@/components/ui/form';

// Import refactored components
import BasicInfoSection from '@/components/list-car/BasicInfoSection';
import SpecificationsSection from '@/components/list-car/SpecificationsSection';
import DescriptionSection from '@/components/list-car/DescriptionSection';
import ImageUploadSection from '@/components/list-car/ImageUploadSection';
import useListCarForm from '@/components/list-car/useListCarForm';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const ListCar = () => {
  const {
    form,
    selectedCategory,
    previewImages,
    isSubmitting,
    handleCategoryChange,
    handleImageUpload,
    removeImage,
    handleDragEnd,
    onSubmit,
  } = useListCarForm();
  
  // Initialize storage bucket on component mount
  useEffect(() => {
    const initStorageBucket = async () => {
      try {
        // First check if the bucket exists
        const { data: bucketList, error: bucketListError } = await supabase.storage.listBuckets();
        if (bucketListError) {
          console.error("Error fetching buckets:", bucketListError);
          return;
        }
        
        const carImagesBucketExists = bucketList?.some(bucket => bucket.name === 'car-images');
        console.log("Car images bucket exists:", carImagesBucketExists);
        
        // Only try to create the bucket if it doesn't exist
        if (!carImagesBucketExists) {
          console.log("Attempting to create car-images bucket...");
          
          try {
            // Check if the user has admin rights first
            const { data: userData } = await supabase.auth.getUser();
            if (!userData?.user) {
              console.warn("User not authenticated, cannot create bucket");
              toast.warning("You need to be logged in to upload images");
              return;
            }
            
            // Try to create the bucket
            const { data, error: createError } = await supabase.storage.createBucket('car-images', {
              public: true
            });
            
            if (createError) {
              console.error("Error creating car-images bucket:", createError);
              if (createError.message.includes("row-level security policy")) {
                toast.error("Permission denied: Only administrators can create storage buckets");
              } else {
                toast.error("Failed to create storage bucket. Please contact support.");
              }
            } else {
              console.log("Car-images bucket created successfully:", data);
              toast.success("Image storage configured successfully");
            }
          } catch (err) {
            console.error("Exception when creating bucket:", err);
          }
        }
      } catch (err) {
        console.error("Exception checking/creating bucket:", err);
      }
    };
    
    initStorageBucket();
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">List Your Race Car</h1>
        
        <Card className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Basic Information */}
              <BasicInfoSection 
                control={form.control} 
                selectedCategory={selectedCategory} 
                onCategoryChange={handleCategoryChange} 
              />

              {/* Race Car Specifications */}
              <SpecificationsSection control={form.control} />

              {/* Description */}
              <DescriptionSection control={form.control} />

              {/* Image Upload */}
              <ImageUploadSection 
                previewImages={previewImages}
                onImageUpload={handleImageUpload}
                onRemoveImage={removeImage}
                onDragEnd={handleDragEnd}
              />

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
