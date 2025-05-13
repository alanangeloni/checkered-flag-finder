
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
  
  // Check if the user is authenticated on component mount
  useEffect(() => {
    const checkUserAuth = async () => {
      try {
        // Check if the user is authenticated
        const { data: userData } = await supabase.auth.getUser();
        if (!userData?.user) {
          console.warn("User not authenticated");
          toast.warning("You need to be logged in to upload images");
          return;
        }
        
        console.log("User authenticated:", userData.user.id);
      } catch (err) {
        console.error("Exception checking user auth:", err);
      }
    };
    
    checkUserAuth();
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

              <div className="flex flex-col md:flex-row gap-4">
                <Button 
                  type="submit" 
                  variant="primary" 
                  className="w-full md:w-auto"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Listing'}
                </Button>
                
                <Button 
                  type="button" 
                  variant="outline" 
                  className="w-full md:w-auto"
                  onClick={async () => {
                    try {
                      // Test if we can list the bucket contents
                      const { data, error } = await supabase.storage.from('car_images').list();
                      if (error) {
                        console.error('Error listing bucket contents:', error);
                        toast.error(`Storage access error: ${error.message}`);
                      } else {
                        console.log('Bucket contents:', data);
                        toast.success(`Successfully accessed car_images bucket. Found ${data.length} items.`);
                      }
                    } catch (err: any) {
                      console.error('Exception testing bucket access:', err);
                      toast.error(`Exception: ${err.message}`);
                    }
                  }}
                >
                  Test Storage Access
                </Button>
              </div>
            </form>
          </Form>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default ListCar;
