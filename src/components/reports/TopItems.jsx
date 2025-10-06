import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Star } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function TopItems({ orders, menuItems, isLoading }) {
  if (isLoading) {
    return (
      <Card className="border-0 shadow-md bg-white/60 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Top Selling Items</CardTitle>
        </CardHeader>
        <CardContent>
          {Array(5).fill(0).map((_, i) => (
            <div key={i} className="flex items-center justify-between mb-4">
              <Skeleton className="h-12 w-3/4 rounded-lg" />
              <Skeleton className="h-6 w-16 rounded-full" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  const getTopItems = () => {
    const itemStats = {};
    
    orders.forEach(order => {
      order.items?.forEach(orderItem => {
        const menuItem = menuItems.find(mi => mi.id === orderItem.menu_item_id);
        if (menuItem) {
          const key = orderItem.menu_item_id;
          if (!itemStats[key]) {
            itemStats[key] = {
              name: menuItem.name,
              category: menuItem.category,
              totalSold: 0,
              totalRevenue: 0
            };
          }
          itemStats[key].totalSold += orderItem.quantity;
          itemStats[key].totalRevenue += orderItem.price * orderItem.quantity;
        }
      });
    });

    return Object.values(itemStats)
      .sort((a, b) => b.totalSold - a.totalSold)
      .slice(0, 10);
  };

  const topItems = getTopItems();

  return (
    <Card className="border-0 shadow-md bg-white/60 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="w-5 h-5" />
          Top Selling Items
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {topItems.map((item, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-white rounded-lg border">
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 bg-gradient-to-r from-orange-100 to-amber-100 rounded-full flex items-center justify-center font-bold text-orange-700">
                  #{index + 1}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{item.name}</p>
                  <Badge variant="secondary" className="capitalize">
                    {item.category}
                  </Badge>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  <span className="font-bold">{item.totalSold} sold</span>
                </div>
                <p className="text-sm text-gray-500">${item.totalRevenue.toFixed(2)} revenue</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}