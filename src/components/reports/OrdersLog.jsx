
import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download, Search, Filter, Calendar } from "lucide-react";
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subWeeks, subMonths } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
  preparing: "bg-blue-100 text-blue-800 border-blue-200",
  ready: "bg-green-100 text-green-800 border-green-200",
  completed: "bg-gray-100 text-gray-800 border-gray-200"
};

const paymentStatusColors = {
  unpaid: "bg-red-100 text-red-800 border-red-200",
  paid: "bg-green-100 text-green-800 border-green-200",
  refunded: "bg-orange-100 text-orange-800 border-orange-200",
  cash_on_delivery: "bg-blue-100 text-blue-800 border-blue-200",
};

export default function OrdersLog({ orders, isLoading }) {
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [dateRange, setDateRange] = useState("this_week");

  const applyFilters = useCallback(() => {
    let filtered = [...orders];

    // Apply date range filter
    const now = new Date();
    let startDate, endDate;

    switch (dateRange) {
      case "this_week":
        startDate = startOfWeek(now);
        endDate = endOfWeek(now);
        break;
      case "last_week":
        const lastWeek = subWeeks(now, 1);
        startDate = startOfWeek(lastWeek);
        endDate = endOfWeek(lastWeek);
        break;
      case "this_month":
        startDate = startOfMonth(now);
        endDate = endOfMonth(now);
        break;
      case "last_month":
        const lastMonth = subMonths(now, 1);
        startDate = startOfMonth(lastMonth);
        endDate = endOfMonth(lastMonth);
        break;
      default: // "all"
        startDate = null;
        endDate = null;
    }

    if (startDate && endDate) {
      filtered = filtered.filter(order => {
        const orderDate = new Date(order.created_at);
        return orderDate >= startDate && orderDate <= endDate;
      });
    }

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(order => 
        order.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.phone?.includes(searchTerm) ||
        order.id?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filters
    if (statusFilter !== "all") {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    if (paymentFilter !== "all") {
      filtered = filtered.filter(order => order.payment_status === paymentFilter);
    }

    setFilteredOrders(filtered);
  }, [orders, searchTerm, statusFilter, paymentFilter, dateRange]); // Dependencies for useCallback

  useEffect(() => {
    applyFilters();
  }, [applyFilters]); // Now, applyFilters is a stable reference thanks to useCallback

  const exportToCSV = () => {
    const headers = [
      'Order ID',
      'Customer Name',
      'Email',
      'Phone',
      'Status',
      'Payment Status',
      'Payment Method', // Added Payment Method to CSV export
      'Items Count',
      'Subtotal',
      'Tax',
      'Total',
      'Order Date',
      'Items Details'
    ];

    const csvData = filteredOrders.map(order => [
      order.id,
      order.customer_name || 'Guest',
      order.customer_email || '',
      order.phone || '',
      order.status,
      order.payment_status,
      order.payment_method || 'N/A', // Export payment method
      order.items?.length || 0,
      order.subtotal?.toFixed(2) || '0.00',
      order.tax?.toFixed(2) || '0.00',
      order.total?.toFixed(2) || '0.00',
      format(new Date(order.created_at), 'yyyy-MM-dd HH:mm:ss'),
      order.items?.map(item => `${item.name} (${item.quantity}x$${item.price})`).join('; ') || ''
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `orders_${dateRange}_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getDateRangeLabel = () => {
    const now = new Date();
    switch (dateRange) {
      case "this_week":
        return `${format(startOfWeek(now), 'MMM d')} - ${format(endOfWeek(now), 'MMM d, yyyy')}`;
      case "last_week":
        const lastWeek = subWeeks(now, 1);
        return `${format(startOfWeek(lastWeek), 'MMM d')} - ${format(endOfWeek(lastWeek), 'MMM d, yyyy')}`;
      case "this_month":
        return format(now, 'MMMM yyyy');
      case "last_month":
        return format(subMonths(now, 1), 'MMMM yyyy');
      default: // "all"
        return "All Time";
    }
  };

  if (isLoading) {
    return (
      <Card className="border-0 shadow-md bg-white/60 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Loading Orders...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array(10).fill(0).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-md bg-white/60 backdrop-blur-sm">
      <CardHeader>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Order History Log
            </CardTitle>
            <p className="text-sm text-gray-600 mt-1">
              {getDateRangeLabel()} • {filteredOrders.length} orders
            </p>
          </div>
          <Button onClick={exportToCSV} variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            Export CSV
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger>
              <SelectValue placeholder="Date Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="this_week">This Week</SelectItem>
              <SelectItem value="last_week">Last Week</SelectItem>
              <SelectItem value="this_month">This Month</SelectItem>
              <SelectItem value="last_month">Last Month</SelectItem>
              <SelectItem value="all">All Time</SelectItem>
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Order Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="preparing">Preparing</SelectItem>
              <SelectItem value="ready">Ready</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>

          <Select value={paymentFilter} onValueChange={setPaymentFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Payment Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Payments</SelectItem>
              <SelectItem value="unpaid">Unpaid</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="refunded">Refunded</SelectItem>
              <SelectItem value="cash_on_delivery">Cash on Delivery</SelectItem>
            </SelectContent>
          </Select>

          <Button 
            variant="outline" 
            onClick={() => {
              setSearchTerm("");
              setStatusFilter("all");
              setPaymentFilter("all");
              setDateRange("this_week");
            }}
            className="gap-2"
          >
            <Filter className="w-4 h-4" />
            Clear
          </Button>
        </div>

        {/* Orders Table */}
        <div className="rounded-lg border bg-white overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order Info</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Method</TableHead> {/* Replaced 'Items\' with 'Method' */}
                <TableHead>Total</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <div className="text-gray-500">
                      <Calendar className="w-12 h-12 mx-auto mb-4 opacity-30" />
                      <p className="font-medium">No orders found</p>
                      <p className="text-sm">Try adjusting your filters or date range</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredOrders.map((order) => (
                  <TableRow key={order.id} className="hover:bg-gray-50">
                    <TableCell>
                      <div className="font-medium text-sm">
                        ID: {order.id?.substring(0, 8)}...
                      </div>
                      {order.is_guest && (
                        <Badge variant="secondary" className="text-xs mt-1">Guest</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{order.customer_name || 'Guest'}</p>
                        <p className="text-sm text-gray-500">{order.customer_email}</p>
                        {order.phone && (
                          <p className="text-sm text-gray-500">{order.phone}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={statusColors[order.status]}>
                        {order.status.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={paymentStatusColors[order.payment_status]}>
                        {order.payment_status.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell> {/* New cell for Payment Method */}
                      <p className="font-medium capitalize">{order.payment_method || 'N/A'}</p>
                      {/* Optional: Add items info here if needed, but per outline, 'Items' column was replaced */}
                      {order.items?.length > 0 && (
                        <p className="text-xs text-gray-500 truncate max-w-32">
                          {order.items?.map(item => item.name).join(', ').substring(0, 40)}...
                        </p>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="text-right">
                        <p className="font-bold">${order.total?.toFixed(2)}</p>
                        {order.tax > 0 && (
                          <p className="text-xs text-gray-500">
                            Tax: ${order.tax?.toFixed(2)}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p>{format(new Date(order.created_at), 'MMM d, yyyy')}</p>
                        <p className="text-gray-500">{format(new Date(order.created_at), 'HH:mm')}</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
