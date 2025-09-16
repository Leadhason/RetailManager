import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import ImageUpload from "./image-upload";

const productSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  slug: z.string().min(1, "Product slug is required"),
  description: z.string().optional(),
  shortDescription: z.string().optional(),
  sku: z.string().optional(),
  barcode: z.string().optional(),
  brand: z.string().optional(),
  costPrice: z.string().optional(),
  sellingPrice: z.string().min(1, "Selling price is required"),
  msrp: z.string().optional(),
  weight: z.string().optional(),
  status: z.enum(["active", "inactive", "draft", "discontinued"]).default("active"),
  images: z.array(z.string()).min(2, "At least 2 images are required").max(4, "Maximum 4 images allowed"),
});

type ProductFormData = z.infer<typeof productSchema>;

interface ImageFile {
  file: File;
  preview: string;
  id: string;
}

interface ProductFormProps {
  onSubmit: (data: ProductFormData & { imageFiles?: ImageFile[] }) => void;
  initialData?: Partial<ProductFormData>;
  isLoading?: boolean;
}

export default function ProductForm({ onSubmit, initialData, isLoading }: ProductFormProps) {
  const { toast } = useToast();
  const [imageFiles, setImageFiles] = useState<ImageFile[]>([]);
  
  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: initialData?.name || "",
      slug: initialData?.slug || "",
      description: initialData?.description || "",
      shortDescription: initialData?.shortDescription || "",
      sku: initialData?.sku || "",
      barcode: initialData?.barcode || "",
      brand: initialData?.brand || "",
      costPrice: initialData?.costPrice || "",
      sellingPrice: initialData?.sellingPrice || "",
      msrp: initialData?.msrp || "",
      weight: initialData?.weight || "",
      status: initialData?.status || "active",
      images: initialData?.images || [],
    },
  });

  const handleSubmit = (data: ProductFormData) => {
    try {
      // Validate images
      if (imageFiles.length < 2) {
        toast({
          title: "Images Required",
          description: "Please upload at least 2 product images",
          variant: "destructive",
        });
        return;
      }

      if (imageFiles.length > 4) {
        toast({
          title: "Too Many Images",
          description: "Please upload no more than 4 product images",
          variant: "destructive",
        });
        return;
      }

      // Auto-generate slug if not provided
      if (!data.slug && data.name) {
        data.slug = data.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '');
      }
      
      // Include image files in submission
      onSubmit({ ...data, imageFiles });
    } catch (error) {
      toast({
        title: "Validation Error",
        description: "Please check your input and try again",
        variant: "destructive",
      });
    }
  };

  const handleImagesChange = (images: ImageFile[]) => {
    setImageFiles(images);
    // Update form value for validation
    form.setValue('images', images.map((_, index) => `temp-url-${index}`));
  };

  return (
    <Card data-testid="product-form">
      <CardHeader>
        <CardTitle>{initialData ? "Edit Product" : "Add New Product"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Product Name *</Label>
              <Input
                id="name"
                {...form.register("name")}
                placeholder="Enter product name"
                data-testid="input-name"
              />
              {form.formState.errors.name && (
                <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">Slug</Label>
              <Input
                id="slug"
                {...form.register("slug")}
                placeholder="product-slug"
                data-testid="input-slug"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sku">SKU</Label>
              <Input
                id="sku"
                {...form.register("sku")}
                placeholder="Enter SKU"
                data-testid="input-sku"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="barcode">Barcode</Label>
              <Input
                id="barcode"
                {...form.register("barcode")}
                placeholder="Enter barcode"
                data-testid="input-barcode"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="brand">Brand</Label>
              <Input
                id="brand"
                {...form.register("brand")}
                placeholder="Enter brand"
                data-testid="input-brand"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select 
                value={form.watch("status")} 
                onValueChange={(value) => form.setValue("status", value as any)}
              >
                <SelectTrigger data-testid="select-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="discontinued">Discontinued</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Descriptions */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="shortDescription">Short Description</Label>
              <Textarea
                id="shortDescription"
                {...form.register("shortDescription")}
                placeholder="Brief product description"
                rows={2}
                data-testid="textarea-short-description"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Full Description</Label>
              <Textarea
                id="description"
                {...form.register("description")}
                placeholder="Detailed product description"
                rows={4}
                data-testid="textarea-description"
              />
            </div>
          </div>

          {/* Pricing */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="costPrice">Cost Price (GHS)</Label>
              <Input
                id="costPrice"
                type="number"
                step="0.01"
                {...form.register("costPrice")}
                placeholder="0.00"
                data-testid="input-cost-price"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sellingPrice">Selling Price (GHS) *</Label>
              <Input
                id="sellingPrice"
                type="number"
                step="0.01"
                {...form.register("sellingPrice")}
                placeholder="0.00"
                data-testid="input-selling-price"
              />
              {form.formState.errors.sellingPrice && (
                <p className="text-sm text-destructive">{form.formState.errors.sellingPrice.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="msrp">MSRP (GHS)</Label>
              <Input
                id="msrp"
                type="number"
                step="0.01"
                {...form.register("msrp")}
                placeholder="0.00"
                data-testid="input-msrp"
              />
            </div>
          </div>

          {/* Physical Properties */}
          <div className="space-y-2">
            <Label htmlFor="weight">Weight (kg)</Label>
            <Input
              id="weight"
              type="number"
              step="0.01"
              {...form.register("weight")}
              placeholder="0.00"
              data-testid="input-weight"
            />
          </div>

          {/* Product Images */}
          <div className="space-y-2">
            <Label>Product Images *</Label>
            <ImageUpload
              onImagesChange={handleImagesChange}
              initialImages={initialData?.images}
              maxImages={4}
              minImages={2}
            />
            {form.formState.errors.images && (
              <p className="text-sm text-destructive">{form.formState.errors.images.message}</p>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex gap-2">
            <Button 
              type="submit" 
              disabled={isLoading}
              data-testid="button-submit"
            >
              {isLoading ? "Saving..." : (initialData ? "Update Product" : "Create Product")}
            </Button>
            <Button 
              type="button" 
              variant="outline"
              onClick={() => form.reset()}
              data-testid="button-reset"
            >
              Reset
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
