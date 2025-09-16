import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

// Storage bucket configuration
export const STORAGE_BUCKET = 'product-images';

// Helper function to initialize bucket
export async function initializeStorageBucket() {
  try {
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some(bucket => bucket.name === STORAGE_BUCKET);
    
    if (!bucketExists) {
      const { error } = await supabase.storage.createBucket(STORAGE_BUCKET, {
        public: true,
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
        fileSizeLimit: 5242880, // 5MB
      });
      
      if (error) {
        if (error.message.includes('already exists')) {
          console.log(`Storage bucket '${STORAGE_BUCKET}' already exists`);
        } else if (error.message.includes('policy')) {
          console.warn(`Bucket '${STORAGE_BUCKET}' may need to be created manually in Supabase dashboard due to RLS policy`);
        } else {
          console.error('Error creating storage bucket:', error);
        }
      } else {
        console.log(`Storage bucket '${STORAGE_BUCKET}' created successfully`);
      }
    } else {
      console.log(`Storage bucket '${STORAGE_BUCKET}' already exists`);
    }
  } catch (error) {
    console.warn('Error initializing storage bucket (this is normal if bucket exists):', error instanceof Error ? error.message : error);
  }
}

// Helper function to upload file
export async function uploadProductImage(file: File, productId: string, imageIndex: number): Promise<string> {
  const fileExt = file.name.split('.').pop();
  const fileName = `${productId}/image-${imageIndex}.${fileExt}`;
  
  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: true
    });

  if (error) {
    throw new Error(`Upload failed: ${error.message}`);
  }

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from(STORAGE_BUCKET)
    .getPublicUrl(fileName);

  return publicUrl;
}

// Helper function to delete images
export async function deleteProductImages(productId: string): Promise<void> {
  const { data: files } = await supabase.storage
    .from(STORAGE_BUCKET)
    .list(productId);

  if (files && files.length > 0) {
    const filePaths = files.map(file => `${productId}/${file.name}`);
    await supabase.storage
      .from(STORAGE_BUCKET)
      .remove(filePaths);
  }
}