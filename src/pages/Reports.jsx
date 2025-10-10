
import React, { useState, useEffect } from "react";
import { Order, MenuItem } from "@/services";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, TrendingUp, TrendingDown } from "lucide-react";
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, format } from "date-fns";

import SalesChart from "../components/reports/SalesChart";
import CategoryBreakdown from "../components/reports/CategoryBreakdown";
import TopItems from "../components/reports/TopItems";
import OrdersLog from "../components/reports/OrdersLog";
import AdminOnly from "../components/auth/AdminOnly";

export default function Reports() {
  const [orders, setOrders] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [dateRange, setDateRange] = useState("week");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadReportsData();
  }, []);

  const loadReportsData = async () => {
    try {
      const [ordersData, menuData] = await Promise.all([
        Order.list("-created_at"),
        MenuItem.list()
      ]);
      
      setOrders(ordersData);
      setMenuItems(menuData);
      setIsLoading(false);
    } catch (error) {
      console.error("Error loading reports data:", error);
      setIsLoading(false);
    }
  };

  const getDateRange = () => {
    const today = new Date();
    switch (dateRange) {
      case "week":
        return { start: startOfWeek(today), end: endOfWeek(today) };
      case "month":
        return { start: startOfMonth(today), end: endOfMonth(today) };
      default:
        return { start: startOfWeek(today), end: endOfWeek(today) };
    }
  };

  const { start: startDate, end: endDate } = getDateRange();
  
  const filteredOrders = orders.filter(order => {
    const orderDate = new Date(order.created_at);
    return orderDate >= startDate && orderDate <= endDate;
  });

  const calculateStats = () => {
    const totalRevenue = filteredOrders
      .filter(order => order.payment_status === 'paid')
      .reduce((sum, order) => sum + (order.total_amount || 0), 0);
    
    const totalOrders = filteredOrders.length;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    
    return {
      totalRevenue,
      totalOrders,
      avgOrderValue
    };
  };

  const stats = calculateStats();

  return (
    <AdminOnly>
      <div className="p-4 md:p-8 min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Sales Reports</h1>
              <p className="text-gray-600 mt-1">
                {format(startDate, "MMM d")} - {format(endDate, "MMM d, yyyy")}
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                variant={dateRange === "week" ? "default" : "outline"}
                onClick={() => setDateRange("week")}
              >
                This Week
              </Button>
              <Button
                variant={dateRange === "month" ? "default" : "outline"}
                onClick={() => setDateRange("month")}
              >
                This Month
              </Button>
              <Button variant="outline" className="gap-2">
                <Download className="w-4 h-4" />
                Export
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="border-0 shadow-md bg-white/60 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Total Revenue</p>
                    <p className="text-3xl font-bold text-gray-900">${stats.totalRevenue.toFixed(2)}</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-md bg-white/60 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Total Orders</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.totalOrders}</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md bg-white/60 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Avg Order Value</p>
                    <p className="text-3xl font-bold text-gray-900">${stats.avgOrderValue.toFixed(2)}</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts and Analysis */}
          <div className="grid lg:grid-cols-2 gap-6 mb-6">
            <SalesChart orders={filteredOrders} isLoading={isLoading} />
            <CategoryBreakdown orders={filteredOrders} menuItems={menuItems} isLoading={isLoading} />
          </div>

          <div className="mb-6">
            <TopItems orders={filteredOrders} menuItems={menuItems} isLoading={isLoading} />
          </div>

          {/* Orders Log */}
          <div>
            <OrdersLog orders={orders} isLoading={isLoading} />
          </div>
        </div>
      </div>
    </AdminOnly>
  );
}
