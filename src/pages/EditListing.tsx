
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Form } from '@/components/ui/form';
import { useEditCarForm } from '@/components/edit-car/useEditCarForm';
import BasicInfoSection from '@/components/list-car/BasicInfoSection';
import SpecificationsSection from '@/components/list-car/SpecificationsSection';
import DescriptionSection from '@/components/list-car/DescriptionSection';
import ImageUploadSection from '@/components/list-car/ImageUploadSection';

const EditListing = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const {
    form,
    carData,
    selectedCategory,
    previewImages,
    imageFiles = [],
    isSubmitting,
    categories,
    subcategories,
    isLoadingCategories,
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
            <form 
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-6"
            >
              {/* Basic Information */}
              <BasicInfoSection 
                control={form.control} 
                selectedCategory={selectedCategory} 
                onCategoryChange={handleCategoryChange}
                categories={categories}
                subcategories={subcategories}
                isLoading={isLoadingCategories}
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
                  type="button" 
                  variant="primary" 
                  className="w-full sm:w-auto"
                  disabled={isSaving}
                  onClick={async () => {
                    try {
                      setIsSaving(true);
                      console.log('Save Changes button clicked directly');
                      
                      // Get form values
                      const formValues = form.getValues();
                      console.log('Form values:', formValues);
                      
                      // Check if user is logged in
                      const { data } = await supabase.auth.getSession();
                      const session = data.session;
                      
                      if (!session) {
                        toast.error('You must be logged in to update a listing');
                        navigate('/login');
                        return;
                      }
                      
                      // Generate slug
                      const carSlug = formValues.name.toLowerCase()
                        .replace(/[^\w\s]/gi, '')
                        .replace(/\s+/g, '-');
                      
                      // Update car listing
                      const { data: updatedCar, error: updateError } = await supabase
                        .from('car_listings')
                        .update({
                          name: formValues.name,
                          make: formValues.make,
                          model: formValues.model || null,
                          year: formValues.year ? parseInt(formValues.year) : null,
                          price: formValues.price ? parseFloat(formValues.price) : 0,
                          short_description: formValues.shortDescription,
                          detailed_description: formValues.detailedDescription || null,
                          location: formValues.location || null,
                          slug: carSlug,
                          updated_at: new Date().toISOString()
                        })
                        .eq('id', id)
                        .select()
                        .single();
                      
                      if (updateError) {
                        throw new Error(`Failed to update listing: ${updateError.message}`);
                      }
                      
                      console.log('Car listing updated:', updatedCar);
                      
                      // Upload new images if any
                      if (imageFiles && imageFiles.length > 0) {
                        console.log('Uploading new images:', imageFiles.length);
                        for (let i = 0; i < imageFiles.length; i++) {
                          const file = imageFiles[i];
                          if (!file) continue;
                          
                          // Generate unique filename
                          const fileExt = file.name.split('.').pop();
                          const fileName = `${uuidv4()}.${fileExt}`;
                          const filePath = `${id}/${fileName}`;
                          
                          // Upload to storage
                          const { data: uploadData, error: uploadError } = await supabase.storage
                            .from('car_images')
                            .upload(filePath, file, {
                              cacheControl: '3600',
                              upsert: true
                            });
                          
                          if (uploadError) {
                            console.error(`Error uploading image ${i}:`, uploadError);
                            continue;
                          }
                          
                          // Get public URL
                          const { data: publicURLData } = supabase.storage
                            .from('car_images')
                            .getPublicUrl(filePath);
                          
                          if (!publicURLData) continue;
                          
                          // Add to car_images table
                          await supabase
                            .from('car_images')
                            .insert({
                              car_id: id,
                              image_url: publicURLData.publicUrl,
                              is_primary: i === 0
                            });
                        }
                      }
                      
                      toast.success('Car listing updated successfully!');
                      navigate(`/car-details/${carSlug}`);
                    } catch (error: any) {
                      console.error('Error saving changes:', error);
                      toast.error(error.message || 'Failed to save changes');
                    } finally {
                      setIsSaving(false);
                    }
                  }}
                >
                  {isSaving ? 'Saving Changes...' : 'Save Changes'}
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
