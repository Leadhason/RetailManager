import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DashboardMetrics } from "@/types";

interface TopProductsProps {
  products: DashboardMetrics['topProducts'];
}

export default function TopProducts({ products }: TopProductsProps) {
  return (
    <Card data-testid="top-products">
      <CardHeader>
        <CardTitle>Top Selling Products</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {products.length > 0 ? (
            products.map((product, index) => (
              <div 
                key={product.id} 
                className="flex items-center justify-between p-3 bg-muted rounded-lg"
                data-testid={`product-item-${index}`}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary rounded flex items-center justify-center">
                    <span className="text-primary-foreground text-sm font-medium">
                      {product.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium">{product.name}</p>
                    <p className="text-sm text-muted-foreground">{product.category}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">GHS {product.sales.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">{product.units} units</p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>No product data available</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
