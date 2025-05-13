
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Form } from '@/components/ui/form';
import useEditCarForm from '@/components/edit-car/useEditCarForm';
import BasicInfoSection from '@/components/list-car/BasicInfoSection';
import SpecificationsSection from '@/components/list-car/SpecificationsSection';
import DescriptionSection from '@/components/list-car/DescriptionSection';
import ImageUploadSection from '@/components/list-car/ImageUploadSection';

const EditListing = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  const {
    form,
    carData,
    selectedCategory,
    previewImages,
    isSubmitting,
    handleCategoryChange,
    handleImageUpload,
    removeImage,
    handleDragEnd,
    onSubmit,
  } = useEditCarForm(id);

  useEffect(() => {
    // Check auth state
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error('Please log in to edit your listing');
        navigate('/login');
        return;
      }

      setIsLoading(false);
    };
    
    checkAuth();
  }, [navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8 flex items-center justify-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-racecar-red"></div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Edit Your Race Car Listing</h1>
        
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

              <div className="flex flex-col sm:flex-row gap-4 sm:items-center">
                <Button 
                  type="submit" 
                  variant="primary" 
                  className="w-full sm:w-auto"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Saving Changes...' : 'Save Changes'}
                </Button>
                
                <Button
                  type="button"
                  variant="outline"
                  className="w-full sm:w-auto"
                  onClick={() => {
                    if (carData?.slug) {
                      navigate(`/car-details/${carData.slug}`);
                    } else {
                      navigate(`/listings`);
                    }
                  }}
                >
                  Cancel
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

export default EditListing;
