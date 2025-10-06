import React, { useState, useEffect, useCallback } from 'react';
import { TaxSettings } from '@/services';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Calculator, Save, Info } from "lucide-react";

export default function TaxSettingsComponent() {
  const [settings, setSettings] = useState({
    is_tax_enabled: true,
    tax_percentage: 0.08,
    tax_display_name: "Tax"
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const loadSettings = useCallback(async () => {
    try {
      const taxSettings = await TaxSettings.list();
      if (taxSettings.length > 0) {
        setSettings(taxSettings[0]);
      } else {
        // Create default settings if none exist
        const defaultSettings = {
          is_tax_enabled: true,
          tax_percentage: 0.08,
          tax_display_name: "Tax"
        };
        const created = await TaxSettings.create(defaultSettings);
        setSettings(created);
      }
    } catch (error) {
      console.error("Error loading tax settings:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await TaxSettings.update(settings.id, settings);
      alert("Tax settings saved successfully!");
    } catch (error) {
      console.error("Error saving tax settings:", error);
      alert("Error saving tax settings. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handlePercentageChange = (value) => {
    const percentage = parseFloat(value) / 100; // Convert from percentage to decimal
    setSettings(prev => ({ ...prev, tax_percentage: isNaN(percentage) ? 0 : percentage }));
  };

  if (isLoading) {
    return (
      <Card className="border-0 shadow-md bg-white/60 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <Calculator className="w-6 h-6 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-md bg-white/60 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="w-5 h-5" />
          Tax Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert className="border-blue-200 bg-blue-50">
          <Info className="w-4 h-4" />
          <AlertDescription className="text-blue-800">
            These settings control how tax is calculated and displayed on all customer orders.
          </AlertDescription>
        </Alert>

        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <Label className="text-base font-semibold">Enable Tax Collection</Label>
            <p className="text-sm text-gray-600">Toggle to enable or disable tax on all orders</p>
          </div>
          <Switch
            checked={settings.is_tax_enabled}
            onCheckedChange={(checked) => setSettings(prev => ({ ...prev, is_tax_enabled: checked }))}
          />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label>Tax Percentage</Label>
            <div className="relative">
              <Input
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={(settings.tax_percentage * 100).toFixed(2)}
                onChange={(e) => handlePercentageChange(e.target.value)}
                placeholder="8.00"
                disabled={!settings.is_tax_enabled}
              />
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">%</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Current rate: {(settings.tax_percentage * 100).toFixed(2)}%
            </p>
          </div>

          <div>
            <Label>Display Name</Label>
            <Input
              value={settings.tax_display_name}
              onChange={(e) => setSettings(prev => ({ ...prev, tax_display_name: e.target.value }))}
              placeholder="Tax"
              disabled={!settings.is_tax_enabled}
            />
            <p className="text-xs text-gray-500 mt-1">
              How tax appears on receipts
            </p>
          </div>
        </div>

        {settings.is_tax_enabled && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-semibold text-green-800 mb-2">Example Calculation</h4>
            <div className="text-sm space-y-1 text-green-700">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>$10.00</span>
              </div>
              <div className="flex justify-between">
                <span>{settings.tax_display_name} ({(settings.tax_percentage * 100).toFixed(2)}%):</span>
                <span>${(10 * settings.tax_percentage).toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-semibold border-t border-green-300 pt-1">
                <span>Total:</span>
                <span>${(10 * (1 + settings.tax_percentage)).toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}

        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="w-full bg-orange-600 hover:bg-orange-700"
        >
          {isSaving ? (
            <>
              <Calculator className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save Tax Settings
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}