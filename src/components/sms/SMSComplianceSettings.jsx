import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";

export default function SMSComplianceSettings() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>SMS Compliance Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            All SMS messages must comply with TCPA regulations. Users must explicitly opt-in to receive messages.
          </AlertDescription>
        </Alert>
        <div className="space-y-2 text-sm">
          <p className="font-semibold">Requirements:</p>
          <ul className="list-disc list-inside space-y-1 text-gray-600">
            <li>Obtain explicit consent before sending messages</li>
            <li>Include opt-out instructions in every message</li>
            <li>Honor opt-out requests immediately</li>
            <li>Only send messages during appropriate hours</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
