import React, { useState, useEffect } from 'react';
import { DeliverySettings as DeliverySettingsService } from '@/services';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Truck, DollarSign, CheckCircle, AlertCircle, Loader2, History } from 'lucide-react';
import { format } from 'date-fns';

export default function DeliverySettings() {
  const [settings, setSettings] = useState(null);
  const [baseFee, setBaseFee] = useState('5.00');
  const [isActive, setIsActive] = useState(true);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [auditHistory, setAuditHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await DeliverySettingsService.getSettings();
      setSettings(data);
      setBaseFee(data.base_delivery_fee.toString());
      setIsActive(data.is_active);
    } catch (err) {
      console.error('Error loading delivery settings:', err);
      setError('Failed to load delivery settings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadAuditHistory = async () => {
    try {
      const history = await DeliverySettingsService.getAuditHistory();
      setAuditHistory(history);
      setShowHistory(true);
    } catch (err) {
      console.error('Error loading audit history:', err);
      setError('Failed to load audit history.');
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      const feeValue = parseFloat(baseFee);

      if (isNaN(feeValue) || feeValue < 0) {
        setError('Please enter a valid positive number for the delivery fee.');
        return;
      }

      await DeliverySettingsService.updateSettings(
        feeValue,
        isActive,
        reason || null
      );

      setSuccess('Delivery settings updated successfully! Changes will apply to all new orders.');
      setReason('');
      await loadSettings();

      setTimeout(() => setSuccess(null), 5000);
    } catch (err) {
      console.error('Error saving delivery settings:', err);
      setError(err.message || 'Failed to update delivery settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleFeeChange = (e) => {
    const value = e.target.value;
    if (value === '' || /^\d*\.?\d{0,2}$/.test(value)) {
      setBaseFee(value);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-orange-600 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="border-orange-100">
        <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50">
          <CardTitle className="flex items-center gap-2">
            <Truck className="w-5 h-5 text-orange-600" />
            Delivery Settings
          </CardTitle>
          <CardDescription>
            Configure the base delivery fee applied to all orders
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          {error && (
            <Alert className="border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">{success}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg border border-orange-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Current Base Delivery Fee</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {DeliverySettingsService.formatFee(settings?.base_delivery_fee || 0)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  settings?.is_active
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {settings?.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="baseFee" className="text-sm font-medium">
                  Base Delivery Fee
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
                    $
                  </span>
                  <Input
                    id="baseFee"
                    type="text"
                    value={baseFee}
                    onChange={handleFeeChange}
                    placeholder="5.00"
                    className="pl-7 text-lg font-medium"
                  />
                </div>
                <p className="text-xs text-gray-500">
                  Enter a positive decimal number (e.g., 5.00, 10.50, 15.99)
                </p>
              </div>

              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="space-y-0.5">
                  <Label htmlFor="isActive" className="text-sm font-medium">
                    Delivery Fee Status
                  </Label>
                  <p className="text-xs text-gray-500">
                    Enable or disable the delivery fee for all orders
                  </p>
                </div>
                <Switch
                  id="isActive"
                  checked={isActive}
                  onCheckedChange={setIsActive}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="reason" className="text-sm font-medium">
                  Change Reason (Optional)
                </Label>
                <Input
                  id="reason"
                  type="text"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g., Adjusting for fuel costs"
                  className="w-full"
                />
                <p className="text-xs text-gray-500">
                  Provide a reason for this change to help track modifications
                </p>
              </div>
            </div>

            <Separator />

            <div className="flex gap-3">
              <Button
                onClick={handleSave}
                disabled={saving}
                className="bg-orange-600 hover:bg-orange-700 flex-1"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>

              <Button
                onClick={loadAuditHistory}
                variant="outline"
                className="border-orange-200 hover:bg-orange-50"
              >
                <History className="w-4 h-4 mr-2" />
                View History
              </Button>
            </div>
          </div>

          <Alert className="border-orange-200 bg-orange-50">
            <AlertCircle className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800">
              <strong>Note:</strong> Changes to the delivery fee will take effect immediately
              for all new orders. Existing orders will not be affected.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {showHistory && auditHistory.length > 0 && (
        <Card className="border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="w-5 h-5" />
              Change History
            </CardTitle>
            <CardDescription>
              Track all modifications to delivery settings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {auditHistory.map((entry) => (
                <div
                  key={entry.id}
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-lg">
                          {DeliverySettingsService.formatFee(entry.base_delivery_fee)}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                          entry.is_active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {entry.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      {entry.change_reason && (
                        <p className="text-sm text-gray-600">
                          Reason: {entry.change_reason}
                        </p>
                      )}
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>Changed by: {entry.changed_by_email || 'Unknown'}</span>
                        <span>•</span>
                        <span>{format(new Date(entry.changed_at), 'MMM d, yyyy h:mm a')}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
