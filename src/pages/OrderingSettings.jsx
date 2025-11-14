import React from 'react';
import OrderingWindowControl from '../components/admin/OrderingWindowControl';
import TaxSettingsComponent from '../components/admin/TaxSettings';
import DeliverySettingsComponent from '../components/admin/DeliverySettings';
import AdminOnly from '../components/auth/AdminOnly';

export default function OrderingSettings() {
  return (
    <AdminOnly>
      <div className="p-4 md:p-8 min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Ordering Settings</h1>
            <p className="text-gray-600">Configure ordering hours, tax rates, delivery fees, and system preferences</p>
          </div>

          <div className="space-y-8">
            <OrderingWindowControl />
            <TaxSettingsComponent />
            <DeliverySettingsComponent />
          </div>
        </div>
      </div>
    </AdminOnly>
  );
}