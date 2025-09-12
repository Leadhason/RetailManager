import React from "react";
import { useCreateProduct } from "@/hooks/use-products";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import ProductForm from "@/components/products/product-form";

export default function AddProduct() {
  const createProduct = useCreateProduct();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const handleSubmit = async (data: any) => {
    try {
      await createProduct.mutateAsync(data);
      toast({
        title: "Success",
        description: "Product created successfully",
      });
      setLocation("/products");
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create product",
        variant: "destructive",
      });
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
        isLoading={createProduct.isPending}
      />
    </div>
  );
}
