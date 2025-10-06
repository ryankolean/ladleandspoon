
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Skeleton } from "@/components/ui/skeleton";

const categoryColors = {
  soup: "#f59e0b",
  baked_good: "#eab308",
  specials: "#8b5cf6"
};

export default function CategoryBreakdown({ orders, menuItems, isLoading }) {
  if (isLoading) {
    return (
      <Card className="border-0 shadow-md bg-white/60 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Sales by Category</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    );
  }

  const generateCategoryData = () => {
    const categoryTotals = {};
    
    orders.forEach(order => {
      order.items?.forEach(orderItem => {
        const menuItem = menuItems.find(mi => mi.id === orderItem.menu_item_id);
        if (menuItem) {
          const category = menuItem.category;
          categoryTotals[category] = (categoryTotals[category] || 0) + (orderItem.price * orderItem.quantity);
        }
      });
    });

    return Object.entries(categoryTotals).map(([category, total]) => ({
      category: category.charAt(0).toUpperCase() + category.slice(1),
      value: total,
      color: categoryColors[category] || "#6b7280"
    }));
  };

  const chartData = generateCategoryData();

  return (
    <Card className="border-0 shadow-md bg-white/60 backdrop-blur-sm">
      <CardHeader>
        <CardTitle>Sales by Category</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              outerRadius={100}
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value) => [`$${value.toFixed(2)}`, 'Revenue']}
            />
          </PieChart>
        </ResponsiveContainer>
        
        <div className="mt-4 space-y-2">
          {chartData.map((category, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: category.color }}
                />
                <span className="text-sm">{category.category}</span>
              </div>
              <span className="text-sm font-semibold">${category.value.toFixed(2)}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
