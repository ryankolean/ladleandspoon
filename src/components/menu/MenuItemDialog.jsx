
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { UploadFile } from "@/api/integrations";
import { Loader2, Plus, Minus } from "lucide-react";

const defaultItemState = {
  name: "",
  description: "",
  price: 0,
  category: "soup",
  image_url: "",
  available: true,
  units_available: 0,
  low_stock_threshold: 5,
  variants: [
    { name: "Pint", price: 8.00, units_available: 0 },
    { name: "Quart", price: 15.00, units_available: 0 }
  ],
};

export default function MenuItemDialog({ open, onClose, item, onSubmit }) {
  const [itemData, setItemData] = useState(defaultItemState);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (open) {
      if (item) {
        setItemData({
          ...item,
          // Ensure variants are initialized with units_available and price if not present
          variants: item.variants ? item.variants.map(v => ({ ...v, units_available: v.units_available !== undefined ? v.units_available : 0, price: v.price !== undefined ? v.price : 0 })) : [],
          // Ensure units_available and low_stock_threshold are initialized
          units_available: item.units_available !== undefined ? item.units_available : 0,
          low_stock_threshold: item.low_stock_threshold !== undefined ? item.low_stock_threshold : 5
        });
      } else {
        setItemData(defaultItemState);
      }
    }
  }, [item, open]);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const { file_url } = await UploadFile({ file });
      setItemData(prev => ({ ...prev, image_url: file_url }));
    } catch (error) {
      console.error("Image upload failed:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleCategoryChange = (category) => {
    const newItemData = { ...itemData, category };
    
    // Auto-add variants based on category
    // Only auto-add if the category is changing to soup/box, or if it's a new item being created
    if (category === "soup" && (itemData.category !== 'soup' || !item)) {
      newItemData.variants = [
        { name: "Pint", price: 8.00, units_available: 0 },
        { name: "Quart", price: 15.00, units_available: 0 }
      ];
    } else if (category === "box" && (itemData.category !== 'box' || !item)) {
      newItemData.variants = [
        { name: "Vegetable", price: 0, units_available: 0 }
      ];
    } else if (category !== "soup" && category !== "box") {
      newItemData.variants = [];
    }
    
    setItemData(newItemData);
  };

  const addVariant = () => {
    // If it's a box category, we don't need price or units_available to be editable, so default to 0
    const newVariant = itemData.category === 'box'
        ? { name: "", price: 0, units_available: 0 } // Default for box variants
        : { name: "", price: 0, units_available: 0 }; // Default for soup variants
    setItemData(prev => ({
      ...prev,
      variants: [...prev.variants, newVariant]
    }));
  };

  const updateVariant = (index, field, value) => {
    setItemData(prev => ({
      ...prev,
      variants: prev.variants.map((variant, i) => 
        i === index ? { ...variant, [field]: value } : variant
      )
    }));
  };

  const removeVariant = (index) => {
    setItemData(prev => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const { prep_time, ...dataToSubmit } = itemData; // prep_time is not used in this component, safely destructure
    onSubmit(dataToSubmit);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {item ? 'Edit Menu Item' : 'Add New Menu Item'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label>Item Name</Label>
              <Input
                value={itemData.name}
                onChange={(e) => setItemData({...itemData, name: e.target.value})}
                placeholder="e.g. Chicken Alfredo"
                required
              />
            </div>
            <div>
              <Label>Base Price ($)</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={itemData.price}
                onChange={(e) => setItemData({...itemData, price: parseFloat(e.target.value) || 0})}
                required
              />
            </div>
          </div>

          <div>
            <Label>Description</Label>
            <Textarea
              value={itemData.description}
              onChange={(e) => setItemData({...itemData, description: e.target.value})}
              placeholder="Describe the dish..."
              className="h-24"
            />
          </div>

          <div>
            <Label>Category</Label>
            <Select 
              value={itemData.category} 
              onValueChange={handleCategoryChange}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="soup">Soup</SelectItem>
                <SelectItem value="baked_good">Baked Goods</SelectItem>
                <SelectItem value="specials">Chef's Specials</SelectItem>
                <SelectItem value="box">Box Meals</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Variants Section for Soup and Box */}
          {(itemData.category === "soup" || itemData.category === "box") && (
            <div>
              <Label className="text-base font-semibold">
                {itemData.category === "soup" ? "Size Options" : "Side Options"}
              </Label>
              <p className="text-sm text-gray-600 mb-3">
                {itemData.category === "soup" 
                  ? "Set the price and inventory for each size option" 
                  : "These are the included side options for this meal."
                }
              </p>
              <div className="space-y-3 mt-2">
                {itemData.variants.map((variant, index) => (
                  <div 
                    key={index} 
                    className={`grid ${itemData.category === 'soup' ? 'grid-cols-3' : 'grid-cols-1'} gap-3 p-4 bg-gray-50 rounded-lg border`}
                  >
                    <div className={itemData.category === 'soup' ? '' : 'col-span-1'}>
                      <Label className="text-sm font-medium mb-1 block">
                        {itemData.category === "soup" ? "Size Name" : "Side Option"}
                      </Label>
                      <Input
                        placeholder={itemData.category === "soup" ? "e.g., Pint, Quart" : "e.g., Vegetable, Roll"}
                        value={variant.name}
                        onChange={(e) => updateVariant(index, 'name', e.target.value)}
                      />
                    </div>
                    {/* Conditional rendering for Price and Units Available for 'soup' only */}
                    {itemData.category === 'soup' && (
                      <>
                        <div>
                          <Label className="text-sm font-medium mb-1 block">Price ($)</Label>
                          <Input
                            type="number"
                            placeholder="0.00"
                            min="0"
                            step="0.01"
                            value={variant.price}
                            onChange={(e) => updateVariant(index, 'price', parseFloat(e.target.value) || 0)}
                          />
                        </div>
                        <div>
                          <Label className="text-sm font-medium mb-1 block">Units Available</Label>
                          <Input
                            type="number"
                            placeholder="0"
                            min="0"
                            value={variant.units_available}
                            onChange={(e) => updateVariant(index, 'units_available', parseInt(e.target.value) || 0)}
                          />
                        </div>
                      </>
                    )}
                    <div className={`${itemData.category === 'soup' ? 'col-span-3' : 'col-span-1'} flex justify-end`}>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeVariant(index)}
                        className="text-red-600"
                      >
                        <Minus className="w-4 h-4 mr-1" />
                        Remove {itemData.category === "soup" ? "Size" : "Side"}
                      </Button>
                    </div>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={addVariant}
                  className="w-full"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Another {itemData.category === "soup" ? "Size Option" : "Side Option"}
                </Button>
              </div>
            </div>
          )}

          {/* Inventory Section for Non-Soup/Box Items */}
          {itemData.category !== "soup" && itemData.category !== "box" && (
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Units Available</Label>
                <Input
                  type="number"
                  min="0"
                  value={itemData.units_available}
                  onChange={(e) => setItemData({...itemData, units_available: parseInt(e.target.value) || 0})}
                  placeholder="Number of units available"
                />
              </div>
              <div>
                <Label>Low Stock Alert (units)</Label>
                <Input
                  type="number"
                  min="0"
                  value={itemData.low_stock_threshold}
                  onChange={(e) => setItemData({...itemData, low_stock_threshold: parseInt(e.target.value) || 5})}
                  placeholder="Alert when below this number"
                />
              </div>
            </div>
          )}
          
          <div>
            <Label>Image</Label>
            {itemData.image_url && !isUploading && (
              <div className="mt-2 mb-4">
                <img src={itemData.image_url} alt="Preview" className="w-full h-40 object-cover rounded-lg shadow-sm" />
              </div>
            )}
            {isUploading && (
              <div className="w-full h-40 flex items-center justify-center bg-gray-100 rounded-lg mt-2 mb-4">
                <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
              </div>
            )}
            <div className="relative">
              <Input
                id="image-upload"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
                disabled={isUploading}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">Upload an image for the menu item.</p>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Switch
                checked={itemData.available}
                onCheckedChange={(checked) => setItemData({...itemData, available: checked})}
              />
              <Label>Available for ordering</Label>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={isUploading}>
              {isUploading ? 'Uploading...' : (item ? 'Update Item' : 'Add Item')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
