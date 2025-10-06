import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Phone, Mail, Calendar } from "lucide-react";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

export default function SMSSubscribersList({ subscribers, isLoading, onRefresh }) {
  const [searchTerm, setSearchTerm] = React.useState("");

  const filteredSubscribers = subscribers.filter(subscriber => 
    subscriber.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    subscriber.phone_number?.includes(searchTerm) ||
    subscriber.customer_email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Card className="border-0 shadow-md bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          SMS Subscribers
          <Badge variant="outline">{subscribers.filter(s => s.is_subscribed).length} Active</Badge>
        </CardTitle>
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search subscribers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {Array(5).fill(0).map((_, i) => (
              <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <Skeleton className="w-10 h-10 rounded-full" />
                  <div>
                    <Skeleton className="h-4 w-32 mb-2" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
            ))}
          </div>
        ) : filteredSubscribers.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Phone className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p>No subscribers found</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {filteredSubscribers.map((subscriber) => (
              <div key={subscriber.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-green-100 to-blue-100 rounded-full flex items-center justify-center">
                    <Phone className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <p className="font-semibold">{subscriber.customer_name || 'Unknown Customer'}</p>
                    <div className="flex items-center gap-3 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        {subscriber.phone_number}
                      </span>
                      {subscriber.customer_email && (
                        <span className="flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {subscriber.customer_email}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge 
                        variant={subscriber.is_subscribed ? "default" : "secondary"}
                        className={subscriber.is_subscribed ? "bg-green-100 text-green-800" : ""}
                      >
                        {subscriber.subscription_type || 'all'}
                      </Badge>
                      {subscriber.opted_in_date && (
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Joined {format(new Date(subscriber.opted_in_date), "MMM d, yyyy")}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={subscriber.is_subscribed ? "default" : "destructive"}>
                    {subscriber.is_subscribed ? "Active" : "Unsubscribed"}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}