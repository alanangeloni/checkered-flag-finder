
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { UploadCloud, GripVertical, ArrowUp, ArrowDown } from 'lucide-react';

interface ImageUploadSectionProps {
  previewImages: string[];
  onImageUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveImage: (index: number) => void;
  onDragEnd: (result: any) => void;
}

export const ImageUploadSection: React.FC<ImageUploadSectionProps> = ({ 
  previewImages, 
  onImageUpload,
  onRemoveImage,
  onDragEnd
}) => {
  // Simple reordering functions until react-beautiful-dnd is properly installed
  const moveImageUp = (index: number) => {
    if (index <= 0) return;
    const result = {
      source: { index },
      destination: { index: index - 1 }
    };
    onDragEnd(result);
  };

  const moveImageDown = (index: number) => {
    if (index >= previewImages.length - 1) return;
    const result = {
      source: { index },
      destination: { index: index + 1 }
    };
    onDragEnd(result);
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Images</h2>
      <Label htmlFor="images">Car Images</Label>
      <div className="mt-2 border-2 border-dashed border-gray-300 rounded-md p-6 text-center">
        <div className="flex flex-col items-center">
          <UploadCloud className="h-10 w-10 text-gray-400 mb-2" />
          <p className="text-sm text-gray-600">Upload images of your car</p>
          <p className="text-xs text-gray-500 mb-3">PNG, JPG, GIF up to 5MB each</p>
          <Input 
            id="images" 
            type="file" 
            accept="image/*" 
            multiple
            className="hidden" 
            onChange={onImageUpload}
          />
          <Button 
            type="button" 
            variant="outline"
            onClick={() => document.getElementById('images')?.click()}
          >
            Select Files
          </Button>
        </div>
      </div>

      {previewImages.length > 0 && (
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {previewImages.map((src, index) => (
            <div key={`image-${index}`} className="relative group">
              <div className="absolute top-1 left-1 bg-black/50 p-1 rounded-full text-white z-10 flex gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5 p-0 text-white hover:text-white hover:bg-black/30"
                  onClick={() => moveImageUp(index)}
                  disabled={index === 0}
                >
                  <ArrowUp size={12} />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5 p-0 text-white hover:text-white hover:bg-black/30"
                  onClick={() => moveImageDown(index)}
                  disabled={index === previewImages.length - 1}
                >
                  <ArrowDown size={12} />
                </Button>
                <GripVertical size={14} className="cursor-move" />
              </div>
              <img 
                src={src} 
                alt={`Car preview ${index + 1}`}
                className="w-full h-24 object-cover rounded-md"
              />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-1 right-1 h-5 w-5"
                onClick={() => onRemoveImage(index)}
              >
                ×
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageUploadSection;
