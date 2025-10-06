
import React, { useState, useEffect } from "react";
import { Order, MenuItem } from "@/services";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { 
  DollarSign, 
  ShoppingCart, 
  UtensilsCrossed,
  Plus,
  Activity
} from "lucide-react";
import { format, startOfToday, endOfToday } from "date-fns";

import QuickStats from "../components/dashboard/QuickStats";
import TodaysOrders from "../components/dashboard/TodaysOrders";
import QuickActions from "../components/dashboard/QuickActions";
import OrderingWindowControl from "../components/admin/OrderingWindowControl";
import AdminOnly from "../components/auth/AdminOnly";
import InventoryAlerts from "../components/dashboard/InventoryAlerts";

export default function Dashboard() {
  const [todaysOrders, setTodaysOrders] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
    const interval = setInterval(loadDashboardData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    try {
      const [orders, items] = await Promise.all([
        Order.list("-created_at"),
        MenuItem.list()
      ]);
      
      const today = new Date();
      const todayStart = startOfToday();
      const todayEnd = endOfToday();
      
      const todayOrders = orders.filter(order => {
        const orderDate = new Date(order.created_at);
        return orderDate >= todayStart && orderDate <= todayEnd;
      });

      setTodaysOrders(todayOrders);
      setMenuItems(items);
      setIsLoading(false);
    } catch (error) {
      console.error("Error loading dashboard data:", error);
      setIsLoading(false);
    }
  };

  const calculateStats = () => {
    const todayRevenue = todaysOrders
      .filter(order => order.payment_status === 'paid')
      .reduce((sum, order) => sum + (order.total || 0), 0);
    
    const avgOrderValue = todaysOrders.length > 0 
      ? todayRevenue / todaysOrders.length 
      : 0;

    return {
      todayRevenue,
      todayOrders: todaysOrders.length,
      avgOrderValue,
      activeOrders: todaysOrders.filter(order => order.status !== 'completed').length
    };
  };

  const stats = calculateStats();

  return (
    <AdminOnly>
      <div className="p-4 md:p-8 min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
        <div className="max-w-7xl mx-auto">
          {/* Welcome Header */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-2">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl flex items-center justify-center shadow-lg">
                <UtensilsCrossed className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                  Welcome back to Ladle & Spoon
                </h1>
                <p className="text-gray-600">{format(new Date(), "EEEE, MMMM d, yyyy")}</p>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-8">
            <QuickStats
              title="Today's Revenue"
              value={`$${stats.todayRevenue.toFixed(2)}`}
              icon={DollarSign}
              bgColor="bg-green-500"
              textColor="text-green-600"
              trend="+12% vs yesterday"
            />
            <QuickStats
              title="Orders Today"
              value={stats.todayOrders}
              icon={ShoppingCart}
              bgColor="bg-blue-500"
              textColor="text-blue-600"
              trend={`Avg $${stats.avgOrderValue.toFixed(2)}`}
            />
            <QuickStats
              title="Active Orders"
              value={stats.activeOrders}
              icon={Activity}
              bgColor="bg-purple-500"
              textColor="text-purple-600"
              trend="In progress"
            />
            <QuickStats
              title="Menu Items"
              value={menuItems.filter(item => item.available).length}
              icon={UtensilsCrossed}
              bgColor="bg-orange-500"
              textColor="text-orange-600"
              trend={`${menuItems.length} total`}
            />
          </div>

          {/* Quick Actions */}
          <QuickActions />

          {/* Inventory Alerts */}
          <div className="mt-8 mb-8">
            <InventoryAlerts menuItems={menuItems} />
          </div>

          {/* Ordering Window Control */}
          <div className="mt-8 mb-8">
            <OrderingWindowControl />
          </div>

          {/* Main Dashboard Grid */}
          <div className="grid lg:grid-cols-1 gap-6 mt-8">
            <TodaysOrders orders={todaysOrders} isLoading={isLoading} />
          </div>
        </div>
      </div>
    </AdminOnly>
  );
}
