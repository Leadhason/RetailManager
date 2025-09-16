import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { X, Upload, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { validateImageFile } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

interface ImageFile {
  file: File;
  preview: string;
  id: string;
}

interface ImageUploadProps {
  onImagesChange: (images: ImageFile[]) => void;
  initialImages?: string[];
  maxImages?: number;
  minImages?: number;
}

export default function ImageUpload({ 
  onImagesChange, 
  initialImages = [], 
  maxImages = 4, 
  minImages = 2 
}: ImageUploadProps) {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const { toast } = useToast();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const validFiles: ImageFile[] = [];
    
    acceptedFiles.forEach((file) => {
      const error = validateImageFile(file);
      if (error) {
        toast({
          title: "Invalid File",
          description: error,
          variant: "destructive",
        });
        return;
      }

      if (images.length + validFiles.length >= maxImages) {
        toast({
          title: "Too Many Images",
          description: `Maximum ${maxImages} images allowed`,
          variant: "destructive",
        });
        return;
      }

      const imageFile: ImageFile = {
        file,
        preview: URL.createObjectURL(file),
        id: Math.random().toString(36).substr(2, 9),
      };
      validFiles.push(imageFile);
    });

    if (validFiles.length > 0) {
      const newImages = [...images, ...validFiles];
      setImages(newImages);
      onImagesChange(newImages);
    }
  }, [images, maxImages, toast, onImagesChange]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    multiple: true,
    maxFiles: maxImages,
    onDragEnter: () => setDragOver(true),
    onDragLeave: () => setDragOver(false),
  });

  const removeImage = useCallback((id: string) => {
    const newImages = images.filter(img => img.id !== id);
    setImages(newImages);
    onImagesChange(newImages);
    
    // Clean up object URL
    const removedImage = images.find(img => img.id === id);
    if (removedImage) {
      URL.revokeObjectURL(removedImage.preview);
    }
  }, [images, onImagesChange]);

  const canAddMore = images.length < maxImages;
  const hasMinimum = images.length >= minImages;

  return (
    <div className="space-y-4" data-testid="image-upload">
      {/* Upload Area */}
      {canAddMore && (
        <Card 
          {...getRootProps()} 
          className={`cursor-pointer transition-colors border-dashed ${
            isDragActive || dragOver 
              ? 'border-primary bg-primary/5' 
              : 'border-border hover:border-primary/50'
          }`}
          data-testid="image-upload-dropzone"
        >
          <CardContent className="flex flex-col items-center justify-center py-8 px-4">
            <input {...getInputProps()} />
            <Upload className="h-10 w-10 text-muted-foreground mb-4" />
            <div className="text-center">
              <p className="text-sm font-medium">
                {isDragActive 
                  ? 'Drop images here...' 
                  : 'Drag & drop images here, or click to select'
                }
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                JPEG, PNG, WebP (max 5MB each) • {images.length}/{maxImages} images
              </p>
              <p className="text-xs text-muted-foreground">
                Minimum {minImages} images required
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Image Preview Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {images.map((image, index) => (
            <Card key={image.id} className="relative group" data-testid={`image-preview-${index}`}>
              <CardContent className="p-2">
                <div className="aspect-square relative overflow-hidden rounded-md bg-muted">
                  <img
                    src={image.preview}
                    alt={`Product image ${index + 1}`}
                    className="w-full h-full object-cover"
                    onLoad={() => URL.revokeObjectURL(image.preview)}
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => removeImage(image.id)}
                    data-testid={`remove-image-${index}`}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                  {index === 0 && (
                    <div className="absolute bottom-1 left-1 bg-primary text-primary-foreground text-xs px-1 py-0.5 rounded">
                      Primary
                    </div>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1 truncate">
                  {image.file.name}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Status Messages */}
      {!hasMinimum && images.length > 0 && (
        <div className="flex items-center text-sm text-amber-600 dark:text-amber-400">
          <ImageIcon className="h-4 w-4 mr-2" />
          Need {minImages - images.length} more image(s) (minimum {minImages} required)
        </div>
      )}

      {hasMinimum && (
        <div className="flex items-center text-sm text-green-600 dark:text-green-400">
          <ImageIcon className="h-4 w-4 mr-2" />
          {images.length} image(s) ready for upload
        </div>
      )}
    </div>
  );
}