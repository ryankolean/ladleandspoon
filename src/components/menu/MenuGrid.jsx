
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Edit, Trash2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";

const categoryColors = {
  soup: "bg-amber-100 text-amber-800",
  baked_good: "bg-yellow-100 text-yellow-800",
  specials: "bg-purple-100 text-purple-800",
  box: "bg-green-100 text-green-800"
};

export default function MenuGrid({ items, isLoading, onItemEdit, onItemDelete, onToggleAvailability }) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array(9).fill(0).map((_, i) => (
          <Card key={i} className="border-0 shadow-md">
            <CardContent className="p-6">
              <Skeleton className="h-32 w-full rounded-lg mb-4" />
              <Skeleton className="h-5 w-3/4 mb-2" />
              <Skeleton className="h-4 w-full mb-4" />
              <Skeleton className="h-6 w-1/2" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {items.map((item) => {
        const isOutOfStock = (item.category === 'soup' || item.category === 'box') 
          ? item.variants && item.variants.every(v => v.units_available <= 0)
          : item.units_available <= 0;
        
        const isLowStock = (item.category === 'soup' || item.category === 'box')
          ? item.variants && item.variants.some(v => v.units_available > 0 && v.units_available <= (item.low_stock_threshold || 5))
          : item.units_available > 0 && item.units_available <= (item.low_stock_threshold || 5);

        return (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -5 }}
            className="h-full"
          >
            <Card className={`border-0 shadow-md bg-white/60 backdrop-blur-sm h-full flex flex-col ${
              !item.available || isOutOfStock ? 'opacity-60' : ''
            }`}>
              <div className="h-40 bg-gradient-to-br from-orange-100 to-amber-100 rounded-t-lg flex items-center justify-center">
                {item.image_url ? (
                  <img 
                    src={item.image_url} 
                    alt={item.name}
                    className="w-full h-full object-cover rounded-t-lg"
                  />
                ) : (
                  <div className="text-orange-400 text-6xl">🍽️</div>
                )}
              </div>
              
              <CardContent className="p-6 flex-1 flex flex-col">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-gray-900 mb-1">{item.name}</h3>
                    <div className="flex flex-wrap gap-2">
                      <Badge className={categoryColors[item.category]} variant="secondary">
                        {item.category === 'baked_good' ? 'Baked Good' : 
                         item.category === 'box' ? 'Box Meal' : item.category}
                      </Badge>
                      {isOutOfStock && (
                        <Badge variant="destructive">Sold Out</Badge>
                      )}
                      {isLowStock && !isOutOfStock && (
                        <Badge className="bg-orange-100 text-orange-800">Low Stock</Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={item.available && !isOutOfStock}
                      onCheckedChange={() => onToggleAvailability(item)}
                      disabled={isOutOfStock}
                    />
                  </div>
                </div>

                <p className="text-gray-600 text-sm mb-4 flex-1">
                  {item.description || "No description available"}
                </p>

                {/* Inventory Display */}
                <div className="mb-4 text-sm">
                  {(item.category === 'soup' || item.category === 'box') && item.variants && item.variants.length > 0 ? (
                    <div className="space-y-1">
                      {item.variants.map((variant, index) => (
                        <div key={index} className="flex justify-between items-center">
                          <span className="text-gray-600">{variant.name}:</span>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">${variant.price.toFixed(2)}</span>
                            <Badge variant="outline" className={variant.units_available <= 0 ? 'bg-red-50 text-red-600' : variant.units_available <= (item.low_stock_threshold || 5) ? 'bg-orange-50 text-orange-600' : 'bg-green-50 text-green-600'}>
                              {variant.units_available} left
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-lg text-gray-900">${item.price.toFixed(2)}</span>
                      <Badge variant="outline" className={item.units_available <= 0 ? 'bg-red-50 text-red-600' : item.units_available <= (item.low_stock_threshold || 5) ? 'bg-orange-50 text-orange-600' : 'bg-green-50 text-green-600'}>
                        {item.units_available} left
                      </Badge>
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => onItemEdit(item)}
                    className="hover:bg-orange-50 hover:border-orange-200"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => onItemDelete(item)}
                    className="hover:bg-red-50 hover:border-red-200 hover:text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}
