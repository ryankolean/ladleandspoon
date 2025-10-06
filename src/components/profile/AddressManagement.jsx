import React, { useState, useEffect } from 'react';
import { UserAddress } from '@/api/entities';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Home, Trash, Edit } from 'lucide-react';
import AddressAutocomplete from '../customer/AddressAutocomplete';

export default function AddressManagement() {
  const [addresses, setAddresses] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [newAddress, setNewAddress] = useState(null);
  const [newAddressLabel, setNewAddressLabel] = useState("");
  const [newAddressInstructions, setNewAddressInstructions] = useState("");

  useEffect(() => {
    loadAddresses();
  }, []);

  const loadAddresses = async () => {
    const userAddresses = await UserAddress.list();
    setAddresses(userAddresses);
  };

  const handleSaveAddress = async () => {
    if (!newAddress || !newAddress.formatted_address || !newAddressLabel) {
      alert("Please provide an address and a label.");
      return;
    }
    const addressData = {
      label: newAddressLabel,
      full_address: newAddress.formatted_address,
      lat: newAddress.lat,
      lng: newAddress.lng,
      delivery_instructions: newAddressInstructions,
    };
    
    if (editingAddress) {
      await UserAddress.update(editingAddress.id, addressData);
    } else {
      await UserAddress.create(addressData);
    }
    
    resetForm();
    loadAddresses();
  };

  const handleEdit = (address) => {
    setEditingAddress(address);
    setNewAddressLabel(address.label);
    setNewAddressInstructions(address.delivery_instructions || "");
    setNewAddress({ formatted_address: address.full_address, lat: address.lat, lng: address.lng });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this address?")) {
      await UserAddress.delete(id);
      loadAddresses();
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingAddress(null);
    setNewAddress(null);
    setNewAddressLabel("");
    setNewAddressInstructions("");
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Saved Addresses</CardTitle>
          {!showForm && (
            <Button size="sm" onClick={() => setShowForm(true)}>
              <Plus className="w-4 h-4 mr-2" /> Add New
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {addresses.length > 0 ? (
            <div className="space-y-4">
              {addresses.map(addr => (
                <div key={addr.id} className="p-4 border rounded-lg flex justify-between items-start">
                  <div>
                    <h4 className="font-bold">{addr.label}</h4>
                    <p>{addr.full_address}</p>
                    {addr.delivery_instructions && <p className="text-sm text-gray-500">Instructions: {addr.delivery_instructions}</p>}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(addr)}><Edit className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(addr.id)} className="text-red-500"><Trash className="w-4 h-4" /></Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No saved addresses.</p>
          )}
        </CardContent>
      </Card>
      
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingAddress ? 'Edit Address' : 'Add New Address'}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Address Label *</label>
              <input value={newAddressLabel} onChange={e => setNewAddressLabel(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border" placeholder="e.g., Home, Work" />
            </div>
            <AddressAutocomplete value={newAddress} onAddressChange={setNewAddress} />
            <div>
              <label className="block text-sm font-medium text-gray-700">Delivery Instructions</label>
              <textarea value={newAddressInstructions} onChange={e => setNewAddressInstructions(e.target.value)} rows="2" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border" placeholder="e.g., Leave at front door"></textarea>
            </div>
            <div className="flex gap-4">
              <Button onClick={handleSaveAddress}>Save Address</Button>
              <Button variant="outline" onClick={resetForm}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}