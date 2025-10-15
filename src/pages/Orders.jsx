
import React, { useState, useEffect } from "react";
import { Order, MenuItem } from "@/services";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

import OrdersList from "../components/orders/OrdersList";
import NewOrderDialog from "../components/orders/NewOrderDialog";
import OrderDetails from "../components/orders/OrderDetails";
import AdminOnly from "../components/auth/AdminOnly";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showNewOrderDialog, setShowNewOrderDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 15000); // Refresh every 15 seconds
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      const [ordersData, menuData] = await Promise.all([
        Order.list("-created_at"),
        MenuItem.filter({ available: true })
      ]);
      
      setOrders(ordersData);
      setMenuItems(menuData);
      setIsLoading(false);
    } catch (error) {
      console.error("Error loading orders data:", error);
      setIsLoading(false);
    }
  };

  const handleOrderUpdate = async (orderId, updates) => {
    // Perform the database update
    await Order.update(orderId, updates);

    // Immediately update the selected order in the UI for a responsive feel
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder(prevOrder => ({ ...prevOrder, ...updates }));
    }

    // Refresh the entire order list in the background to ensure data consistency
    loadData();
  };

  const handleNewOrder = async (orderData) => {
    await Order.create(orderData);
    setShowNewOrderDialog(false);
    loadData();
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.customer_name?.toLowerCase().includes(searchTerm.toLowerCase());
    let matchesStatus;
    if (statusFilter === "all") {
      matchesStatus = order.status !== "cancelled";
    } else {
      matchesStatus = order.status === statusFilter;
    }
    return matchesSearch && matchesStatus;
  });

  return (
    <AdminOnly>
      <div className="p-4 md:p-8 min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
              <p className="text-gray-600 mt-1">Manage and track all online orders</p>
            </div>
            <Button 
              onClick={() => setShowNewOrderDialog(true)}
              className="bg-green-600 hover:bg-green-700 shadow-lg"
            >
              <Plus className="w-5 h-5 mr-2" />
              New Order
            </Button>
          </div>

          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {["all", "pending", "preparing", "ready", "completed", "cancelled"].map((status) => (
                <Button
                  key={status}
                  variant={statusFilter === status ? "default" : "outline"}
                  onClick={() => setStatusFilter(status)}
                  className="capitalize"
                >
                  {status}
                </Button>
              ))}
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <OrdersList 
                orders={filteredOrders}
                isLoading={isLoading}
                onOrderSelect={setSelectedOrder}
                onOrderUpdate={handleOrderUpdate}
              />
            </div>
            <div>
              <OrderDetails 
                order={selectedOrder}
                onOrderUpdate={handleOrderUpdate}
              />
            </div>
          </div>

          <NewOrderDialog
            open={showNewOrderDialog}
            onClose={() => setShowNewOrderDialog(false)}
            menuItems={menuItems}
            onSubmit={handleNewOrder}
          />
        </div>
      </div>
    </AdminOnly>
  );
}
