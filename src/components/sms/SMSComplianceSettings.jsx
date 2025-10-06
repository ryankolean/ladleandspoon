import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Shield, CheckCircle, AlertTriangle, Info } from "lucide-react";

export default function SMSComplianceSettings() {
  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-md bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            SMS Compliance Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="w-4 h-4" />
            <AlertDescription className="text-green-800">
              <strong>TCPA Compliant:</strong> Your SMS system includes all required compliance features.
            </AlertDescription>
          </Alert>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="font-semibold flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                Active Protections
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-green-50 text-green-700">✓</Badge>
                  Automatic STOP keyword handling
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-green-50 text-green-700">✓</Badge>
                  Opt-out footer on all messages
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-green-50 text-green-700">✓</Badge>
                  Consent tracking and timestamps
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-green-50 text-green-700">✓</Badge>
                  Business identification in messages
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold flex items-center gap-2">
                <Info className="w-4 h-4 text-blue-600" />
                Best Practices
              </h4>
              <div className="space-y-2 text-sm text-gray-600">
                <p>• Only message customers who explicitly opted in</p>
                <p>• Keep messages under 160 characters when possible</p>
                <p>• Send during reasonable hours (9 AM - 9 PM)</p>
                <p>• Limit frequency to avoid spam complaints</p>
                <p>• Always include clear business identification</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-md bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Automatic Opt-Out Handling</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert className="border-blue-200 bg-blue-50 mb-4">
            <Info className="w-4 h-4" />
            <AlertDescription className="text-blue-800">
              The system automatically processes the following opt-out keywords: STOP, QUIT, UNSUBSCRIBE, CANCEL, END
            </AlertDescription>
          </Alert>
          
          <div className="space-y-3">
            <h4 className="font-semibold">What happens when a customer texts STOP:</h4>
            <div className="bg-gray-50 p-4 rounded-lg text-sm space-y-2">
              <p>1. Customer is immediately unsubscribed from all SMS</p>
              <p>2. Automatic confirmation message is sent</p>
              <p>3. Opt-out timestamp is recorded</p>
              <p>4. Customer will not receive any future messages</p>
              <p>5. Admin dashboard is updated with the change</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-md bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Legal Requirements</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert className="border-amber-200 bg-amber-50">
            <AlertTriangle className="w-4 h-4" />
            <AlertDescription className="text-amber-800">
              <strong>Important:</strong> Ensure your privacy policy includes SMS data usage and that you have proper consent before sending messages.
            </AlertDescription>
          </Alert>
          
          <div className="mt-4 space-y-3 text-sm text-gray-600">
            <h4 className="font-semibold text-gray-900">Required Elements:</h4>
            <ul className="space-y-1 ml-4">
              <li>• Clear opt-in consent before first message</li>
              <li>• Business name identification in messages</li>
              <li>• Easy opt-out instructions (STOP keyword)</li>
              <li>• Privacy policy covering SMS data usage</li>
              <li>• Record keeping of consent and opt-outs</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}