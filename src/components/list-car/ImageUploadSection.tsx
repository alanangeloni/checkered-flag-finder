
import React, { useRef } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { UploadCloud, ArrowUp, ArrowDown, X } from 'lucide-react';
import { Card } from '@/components/ui/card';

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
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Simple reordering functions
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

  const handleSelectFilesClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Images</h2>
      <Card className="p-6 border-2 border-dashed">
        <div className="flex flex-col items-center">
          <UploadCloud className="h-16 w-16 text-gray-400 mb-2" />
          <p className="text-lg font-medium text-gray-700">Upload images of your car</p>
          <p className="text-sm text-gray-500 mb-5">PNG, JPG, GIF up to 5MB each</p>
          <Input 
            id="images"
            ref={fileInputRef}
            type="file" 
            accept="image/*" 
            multiple
            className="hidden" 
            onChange={onImageUpload}
          />
          <Button 
            type="button" 
            variant="default"
            size="lg"
            className="px-8"
            onClick={handleSelectFilesClick}
          >
            Select Files
          </Button>
        </div>
      </Card>

      {previewImages.length > 0 && (
        <div className="mt-8">
          <h3 className="text-md font-medium mb-3">Selected Images</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {previewImages.map((src, index) => (
              <div key={`image-${index}`} className="relative group border rounded-md overflow-hidden">
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all z-0"></div>
                <img 
                  src={src} 
                  alt={`Car preview ${index + 1}`}
                  className="w-full h-32 object-cover"
                />
                <div className="absolute top-2 left-2 flex space-x-1">
                  <Button
                    type="button"
                    variant="secondary"
                    size="icon"
                    className="h-6 w-6 bg-white/80 hover:bg-white"
                    onClick={() => moveImageUp(index)}
                    disabled={index === 0}
                  >
                    <ArrowUp size={14} />
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    size="icon"
                    className="h-6 w-6 bg-white/80 hover:bg-white"
                    onClick={() => moveImageDown(index)}
                    disabled={index === previewImages.length - 1}
                  >
                    <ArrowDown size={14} />
                  </Button>
                </div>
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 h-6 w-6"
                  onClick={() => onRemoveImage(index)}
                >
                  <X size={14} />
                </Button>
                <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-center text-xs py-1">
                  {index === 0 ? 'Primary Image' : `Image ${index + 1}`}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUploadSection;
