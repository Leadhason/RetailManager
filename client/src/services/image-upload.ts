import { apiRequest } from '@/lib/queryClient';

export interface ImageUploadResponse {
  message: string;
  productId: string;
  imageUrls: string[];
}

interface ImageFile {
  file: File;
  preview: string;
  id: string;
}

export async function uploadProductImages(images: ImageFile[], productId?: string): Promise<ImageUploadResponse> {
  const formData = new FormData();
  
  // Add images to form data
  images.forEach((image, index) => {
    formData.append('images', image.file);
  });
  
  // Add product ID if provided
  if (productId) {
    formData.append('productId', productId);
  }

  const response = await fetch('/api/products/upload-images', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Upload failed with status ${response.status}`);
  }

  return response.json();
}