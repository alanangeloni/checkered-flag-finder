
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { UploadCloud, GripVertical } from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

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
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="images" direction="horizontal">
            {(provided) => (
              <div 
                className="mt-4 grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4" 
                {...provided.droppableProps}
                ref={provided.innerRef}
              >
                {previewImages.map((src, index) => (
                  <Draggable key={`image-${index}`} draggableId={`image-${index}`} index={index}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className="relative group"
                      >
                        <div 
                          {...provided.dragHandleProps}
                          className="absolute top-1 left-1 bg-black/50 p-1 rounded-full text-white cursor-move opacity-0 group-hover:opacity-100 transition-opacity z-10"
                        >
                          <GripVertical size={14} />
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
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      )}
    </div>
  );
};

export default ImageUploadSection;
