
import React from 'react';
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
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

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
  
  // Check if the storage bucket exists on component load
  useEffect(() => {
    const checkBucket = async () => {
      try {
        const { data: buckets, error } = await supabase.storage.listBuckets();
        if (error) {
          console.error("Error fetching buckets:", error);
          return;
        }

        const carImagesBucketExists = buckets?.some(bucket => bucket.name === 'car-images');
        console.log("Car images bucket exists:", carImagesBucketExists);
        
        if (!carImagesBucketExists) {
          // Try to create the bucket
          console.log("Attempting to create car-images bucket on page load...");
          const { data, error: createError } = await supabase.storage.createBucket('car-images', {
            public: true,
            fileSizeLimit: 5242880,
            allowedMimeTypes: ['image/png', 'image/jpeg', 'image/gif', 'image/webp']
          });
          
          if (createError) {
            console.error("Error creating car-images bucket:", createError);
          } else {
            console.log("Car-images bucket created successfully:", data);
          }
        }
      } catch (err) {
        console.error("Exception checking/creating bucket:", err);
      }
    };
    
    checkBucket();
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
