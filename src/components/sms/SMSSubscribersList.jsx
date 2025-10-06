import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function SMSSubscribersList({ subscribers, isLoading }) {
  if (isLoading) {
    return <Card><CardContent className="p-8 text-center">Loading...</CardContent></Card>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>SMS Subscribers</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {subscribers.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No subscribers yet</p>
          ) : (
            subscribers.map((subscriber) => (
              <div key={subscriber.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <div>
                  <p className="font-medium">{subscriber.phone_number}</p>
                </div>
                <Badge variant={subscriber.subscribed ? "default" : "secondary"}>
                  {subscriber.subscribed ? "Active" : "Inactive"}
                </Badge>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
