import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format, eachDayOfInterval, startOfWeek, endOfWeek } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

export default function SalesChart({ orders, isLoading }) {
  if (isLoading) {
    return (
      <Card className="border-0 shadow-md bg-white/60 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Daily Sales</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    );
  }

  const generateChartData = () => {
    const weekStart = startOfWeek(new Date());
    const weekEnd = endOfWeek(new Date());
    const days = eachDayOfInterval({ start: weekStart, end: weekEnd });
    
    return days.map(day => {
      const dayOrders = orders.filter(order => {
        const orderDate = new Date(order.created_date);
        return format(orderDate, 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd') && 
               order.payment_status === 'paid';
      });
      
      const revenue = dayOrders.reduce((sum, order) => sum + (order.total || 0), 0);
      
      return {
        date: format(day, 'MMM dd'),
        revenue: revenue,
        orders: dayOrders.length
      };
    });
  };

  const chartData = generateChartData();

  return (
    <Card className="border-0 shadow-md bg-white/60 backdrop-blur-sm">
      <CardHeader>
        <CardTitle>Daily Sales Trend</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis dataKey="date" className="text-sm" />
            <YAxis className="text-sm" />
            <Tooltip 
              formatter={(value, name) => [
                name === 'revenue' ? `$${value.toFixed(2)}` : value,
                name === 'revenue' ? 'Revenue' : 'Orders'
              ]}
            />
            <Line 
              type="monotone" 
              dataKey="revenue" 
              stroke="#f97316" 
              strokeWidth={3}
              dot={{ fill: '#f97316', strokeWidth: 2, r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}