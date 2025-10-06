
import React, { useState, useEffect, useCallback } from 'react';
import { OrderingWindow } from '@/services';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Clock, Save, Calendar, RotateCcw } from "lucide-react";
import { format } from "date-fns";

export default function OrderingWindowControl() {
  const [settings, setSettings] = useState({
    is_open: false,
    open_time: "09:00",
    close_time: "21:00",
    open_date: "",
    close_date: "",
    message: "We're currently closed. Please check back during our ordering hours.",
    days_of_week: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"],
    use_recurring_schedule: true
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const daysOfWeek = [
    { value: "monday", label: "Monday" },
    { value: "tuesday", label: "Tuesday" },
    { value: "wednesday", label: "Wednesday" },
    { value: "thursday", label: "Thursday" },
    { value: "friday", label: "Friday" },
    { value: "saturday", label: "Saturday" },
    { value: "sunday", label: "Sunday" }
  ];

  const loadSettings = useCallback(async () => {
    try {
      const windows = await OrderingWindow.list();
      if (windows.length > 0) {
        const windowSettings = windows[0];
        // Set default dates if not specified
        if (!windowSettings.open_date) {
          windowSettings.open_date = format(new Date(), 'yyyy-MM-dd');
        }
        if (!windowSettings.close_date) {
          const nextWeek = new Date();
          nextWeek.setDate(nextWeek.getDate() + 7);
          windowSettings.close_date = format(nextWeek, 'yyyy-MM-dd');
        }
        setSettings(windowSettings);
      } else {
        const today = new Date();
        const nextWeek = new Date();
        nextWeek.setDate(today.getDate() + 7);
        
        // This object is now fully defined, removing the dependency on the `settings` state
        // from the component's scope, thus fixing the useCallback dependency warning.
        const defaultSettings = {
          is_open: false,
          open_time: "09:00",
          close_time: "21:00",
          open_date: format(today, 'yyyy-MM-dd'),
          close_date: format(nextWeek, 'yyyy-MM-dd'),
          message: "We're currently closed. Please check back during our ordering hours.",
          days_of_week: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"],
          use_recurring_schedule: true
        };
        
        const created = await OrderingWindow.create(defaultSettings);
        setSettings(created);
      }
    } catch (error) {
      console.error("Error loading ordering window settings:", error);
    } finally {
      setIsLoading(false);
    }
  }, []); // Empty dependency array is now correct as 'settings' state is no longer referenced here.

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await OrderingWindow.update(settings.id, settings);
      alert("Ordering window settings saved successfully!");
    } catch (error) {
      console.error("Error saving settings:", error);
      alert("Error saving settings. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const toggleDay = (day) => {
    setSettings(prev => ({
      ...prev,
      days_of_week: prev.days_of_week.includes(day)
        ? prev.days_of_week.filter(d => d !== day)
        : [...prev.days_of_week, day]
    }));
  };

  if (isLoading) {
    return (
      <Card className="border-0 shadow-md bg-white/60 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <Clock className="w-6 h-6 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-md bg-white/60 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Ordering Window Control
          <Badge variant={settings.is_open ? "default" : "destructive"} className="ml-auto">
            {settings.is_open ? "Open" : "Closed"}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <Label className="text-base font-semibold">Allow Customer Orders</Label>
            <p className="text-sm text-gray-600">Toggle to open or close ordering for customers</p>
          </div>
          <Switch
            checked={settings.is_open}
            onCheckedChange={(checked) => setSettings(prev => ({ ...prev, is_open: checked }))}
          />
        </div>

        {/* Schedule Type Toggle */}
        <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
          <div>
            <Label className="text-base font-semibold">Schedule Type</Label>
            <p className="text-sm text-gray-600">
              {settings.use_recurring_schedule ? 'Recurring weekly schedule' : 'Specific date range'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <RotateCcw className="w-4 h-4 text-blue-600" />
            <Switch
              checked={settings.use_recurring_schedule}
              onCheckedChange={(checked) => setSettings(prev => ({ ...prev, use_recurring_schedule: checked }))}
            />
          </div>
        </div>

        {settings.use_recurring_schedule ? (
          /* Recurring Schedule */
          <>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Daily Opening Time</Label>
                <Input
                  type="time"
                  value={settings.open_time}
                  onChange={(e) => setSettings(prev => ({ ...prev, open_time: e.target.value }))}
                />
              </div>
              <div>
                <Label>Daily Closing Time</Label>
                <Input
                  type="time"
                  value={settings.close_time}
                  onChange={(e) => setSettings(prev => ({ ...prev, close_time: e.target.value }))}
                />
              </div>
            </div>

            <div>
              <Label className="text-base font-semibold">Available Days</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2">
                {daysOfWeek.map(day => (
                  <div key={day.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={day.value}
                      checked={settings.days_of_week.includes(day.value)}
                      onCheckedChange={() => toggleDay(day.value)}
                    />
                    <Label htmlFor={day.value} className="text-sm">
                      {day.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          /* Specific Date Range */
          <>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Opening Date & Time
                </Label>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  <Input
                    type="date"
                    value={settings.open_date}
                    onChange={(e) => setSettings(prev => ({ ...prev, open_date: e.target.value }))}
                  />
                  <Input
                    type="time"
                    value={settings.open_time}
                    onChange={(e) => setSettings(prev => ({ ...prev, open_time: e.target.value }))}
                  />
                </div>
              </div>
              <div>
                <Label className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Closing Date & Time
                </Label>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  <Input
                    type="date"
                    value={settings.close_date}
                    onChange={(e) => setSettings(prev => ({ ...prev, close_date: e.target.value }))}
                  />
                  <Input
                    type="time"
                    value={settings.close_time}
                    onChange={(e) => setSettings(prev => ({ ...prev, close_time: e.target.value }))}
                  />
                </div>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <p className="text-sm text-amber-800">
                <strong>Date Range Mode:</strong> Ordering will be available from{' '}
                <strong>{settings.open_date} at {settings.open_time}</strong> until{' '}
                <strong>{settings.close_date} at {settings.close_time}</strong>
              </p>
            </div>
          </>
        )}

        <div>
          <Label>Closed Message</Label>
          <Textarea
            value={settings.message}
            onChange={(e) => setSettings(prev => ({ ...prev, message: e.target.value }))}
            placeholder="Message to show customers when ordering is closed..."
            className="h-20"
          />
        </div>

        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="w-full bg-orange-600 hover:bg-orange-700"
        >
          {isSaving ? (
            <>
              <Clock className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save Settings
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
