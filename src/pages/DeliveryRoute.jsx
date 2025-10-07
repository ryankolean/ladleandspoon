import React, { useState, useEffect } from "react";
import { Order } from "@/services";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MapPin, Navigation, Package, Clock } from "lucide-react";
import { format } from "date-fns";

const STORE_ADDRESS = "1247 Bielby, Waterford, MI 48328";
const STORE_LAT = 42.6725;
const STORE_LNG = -83.3799;

export default function DeliveryRoute() {
  const [readyOrders, setReadyOrders] = useState([]);
  const [selectedOrders, setSelectedOrders] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isCreatingRoute, setIsCreatingRoute] = useState(false);

  useEffect(() => {
    loadReadyOrders();
  }, []);

  const loadReadyOrders = async () => {
    setIsLoading(true);
    try {
      const orders = await Order.filter({ status: "ready" });

      const sortedOrders = orders.sort((a, b) =>
        new Date(a.created_at) - new Date(b.created_at)
      );

      setReadyOrders(sortedOrders);

      const initialSelection = {};
      sortedOrders.forEach(order => {
        initialSelection[order.id] = true;
      });
      setSelectedOrders(initialSelection);
    } catch (error) {
      console.error("Error loading ready orders:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleOrderSelection = (orderId) => {
    setSelectedOrders(prev => ({
      ...prev,
      [orderId]: !prev[orderId]
    }));
  };

  const toggleSelectAll = () => {
    const allSelected = readyOrders.every(order => selectedOrders[order.id]);
    const newSelection = {};
    readyOrders.forEach(order => {
      newSelection[order.id] = !allSelected;
    });
    setSelectedOrders(newSelection);
  };

  const createOptimizedRoute = async () => {
    const selected = readyOrders.filter(order => selectedOrders[order.id]);

    if (selected.length === 0) {
      alert("Please select at least one order for delivery.");
      return;
    }

    setIsCreatingRoute(true);

    try {
      const waypoints = selected
        .filter(order => order.address_lat && order.address_lng)
        .map(order => ({
          location: `${order.address_lat},${order.address_lng}`,
          address: order.delivery_address || order.customer_address
        }));

      if (waypoints.length === 0) {
        alert("Selected orders don't have valid address coordinates.");
        setIsCreatingRoute(false);
        return;
      }

      let googleMapsUrl;

      if (waypoints.length === 1) {
        googleMapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${STORE_LAT},${STORE_LNG}&destination=${waypoints[0].location}&travelmode=driving`;
      } else {
        const origin = `${STORE_LAT},${STORE_LNG}`;
        const destination = waypoints[waypoints.length - 1].location;
        const waypointsParam = waypoints.slice(0, -1)
          .map(wp => wp.location)
          .join('|');

        googleMapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&waypoints=${waypointsParam}&travelmode=driving`;
      }

      window.open(googleMapsUrl, '_blank');

    } catch (error) {
      console.error("Error creating route:", error);
      alert("Error creating delivery route. Please try again.");
    } finally {
      setIsCreatingRoute(false);
    }
  };

  const selectedCount = Object.values(selectedOrders).filter(Boolean).length;
  const allSelected = readyOrders.length > 0 && readyOrders.every(order => selectedOrders[order.id]);

  if (isLoading) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-8 text-center">
            <p>Loading ready orders...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Delivery Route</h1>
          <p className="text-gray-600 mt-1">
            Optimize delivery routes for orders ready to ship
          </p>
        </div>
        <Button
          onClick={createOptimizedRoute}
          disabled={selectedCount === 0 || isCreatingRoute}
          size="lg"
          className="gap-2"
        >
          <Navigation className="w-5 h-5" />
          {isCreatingRoute ? "Creating Route..." : `Create Route (${selectedCount})`}
        </Button>
      </div>

      {readyOrders.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Package className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Orders Ready for Delivery</h3>
            <p className="text-gray-600">
              Orders with "Ready" status will appear here for route optimization
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Ready Orders ({readyOrders.length})</CardTitle>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="select-all"
                  checked={allSelected}
                  onCheckedChange={toggleSelectAll}
                />
                <label htmlFor="select-all" className="text-sm font-medium cursor-pointer">
                  Select All
                </label>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">Select</TableHead>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Delivery Address</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Payment</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {readyOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedOrders[order.id] || false}
                        onCheckedChange={() => toggleOrderSelection(order.id)}
                      />
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      #{order.id.slice(0, 8)}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{order.customer_name}</div>
                        {order.is_guest && (
                          <Badge variant="outline" className="text-xs mt-1">
                            Guest
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{order.phone || order.customer_phone}</TableCell>
                    <TableCell>
                      <div className="flex items-start gap-2 max-w-xs">
                        <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-gray-500" />
                        <span className="text-sm">
                          {order.delivery_address || order.customer_address}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="font-semibold">
                      ${(order.total || order.total_amount || 0).toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Clock className="w-4 h-4" />
                        {format(new Date(order.created_at), 'h:mm a')}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={order.payment_status === 'paid' ? 'default' : 'outline'}>
                        {order.payment_method}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-semibold text-blue-900 mb-1">Route Optimization</h4>
              <p className="text-sm text-blue-800">
                Starting point: <strong>{STORE_ADDRESS}</strong>
              </p>
              <p className="text-sm text-blue-700 mt-1">
                The route will be optimized to minimize travel time between deliveries.
                Google Maps will open in a new tab with turn-by-turn directions.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
