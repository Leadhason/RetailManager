import React, { useState } from "react";
import { useCreateProduct } from "@/hooks/use-products";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import ProductForm from "@/components/products/product-form";
import { uploadProductImages } from "@/services/image-upload";

export default function AddProduct() {
  const createProduct = useCreateProduct();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: any) => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      // Validate minimum images requirement
      if (!data.imageFiles || data.imageFiles.length < 2) {
        toast({
          title: "Error",
          description: "At least 2 product images are required",
          variant: "destructive",
        });
        return;
      }

      if (data.imageFiles.length > 4) {
        toast({
          title: "Error", 
          description: "Maximum 4 product images allowed",
          variant: "destructive",
        });
        return;
      }

      // Create product first without images
      const productData = { ...data };
      delete productData.imageFiles; // Remove image files from product data

      const newProduct = await createProduct.mutateAsync(productData);
      
      // Upload images after product creation
      await uploadProductImages(data.imageFiles, newProduct.id);
      
      toast({
        title: "Success",
        description: "Product created successfully with images",
      });
      setLocation("/products");
    } catch (error) {
      console.error("Product creation error:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create product",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6" data-testid="add-product-page">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setLocation("/products")}
          data-testid="back-to-products"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Products
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Add New Product</h1>
          <p className="text-muted-foreground">
            Create a new product for your catalog
          </p>
        </div>
      </div>

      {/* Product Form */}
      <ProductForm
        onSubmit={handleSubmit}
        isLoading={createProduct.isPending || isSubmitting}
      />
    </div>
  );
}
