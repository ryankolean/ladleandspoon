
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, Package } from "lucide-react";

export default function InventoryAlerts({ menuItems }) {
  const soldOutItems = menuItems.filter(item => {
    if (item.category === 'soup' || item.category === 'box') {
      return item.variants && item.variants.every(v => v.units_available <= 0);
    }
    return item.units_available <= 0;
  });

  const lowStockItems = menuItems.filter(item => {
    if (item.category === 'soup' || item.category === 'box') {
      return item.variants && item.variants.some(v => 
        v.units_available > 0 && v.units_available <= (item.low_stock_threshold || 5)
      );
    }
    return item.units_available > 0 && item.units_available <= (item.low_stock_threshold || 5);
  });

  if (soldOutItems.length === 0 && lowStockItems.length === 0) {
    return null;
  }

  return (
    <Card className="border-0 shadow-md bg-white/60 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-orange-600">
          <Package className="w-5 h-5" />
          Inventory Alerts
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {soldOutItems.length > 0 && (
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="w-4 h-4 text-red-600" />
            <AlertDescription className="text-red-800">
              <div className="font-semibold mb-2">Sold Out Items ({soldOutItems.length})</div>
              <div className="space-y-1">
                {soldOutItems.map(item => (
                  <div key={item.id} className="text-sm">
                    • {item.name}
                    {item.category === 'soup' || item.category === 'box' ? (
                      <span className="text-red-600 ml-2">
                        (All {item.category === 'soup' ? 'sizes' : 'options'} sold out)
                      </span>
                    ) : null}
                  </div>
                ))}
              </div>
            </AlertDescription>
          </Alert>
        )}

        {lowStockItems.length > 0 && (
          <Alert className="border-orange-200 bg-orange-50">
            <AlertTriangle className="w-4 h-4 text-orange-600" />
            <AlertDescription className="text-orange-800">
              <div className="font-semibold mb-2">Low Stock Items ({lowStockItems.length})</div>
              <div className="space-y-1">
                {lowStockItems.map(item => (
                  <div key={item.id} className="text-sm">
                    • {item.name}
                    {item.category === 'soup' || item.category === 'box' ? (
                      <div className="ml-4 text-xs">
                        {item.variants.filter(v => v.units_available > 0 && v.units_available <= 5).map(v => (
                          <div key={v.name}>{v.name}: {v.units_available} left</div>
                        ))}
                      </div>
                    ) : (
                      <span className="text-orange-600 ml-2">({item.units_available} left)</span>
                    )}
                  </div>
                ))}
              </div>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
