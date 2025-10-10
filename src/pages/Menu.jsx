import React, { useState, useEffect } from "react";
import { MenuItem } from "@/services";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search } from "lucide-react";
import { motion } from "framer-motion";

import MenuGrid from "../components/menu/MenuGrid";
import MenuFilters from "../components/menu/MenuFilters";
import MenuItemDialog from "../components/menu/MenuItemDialog";
import AdminOnly from "../components/auth/AdminOnly";

export default function Menu() {
  const [menuItems, setMenuItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showItemDialog, setShowItemDialog] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [availabilityFilter, setAvailabilityFilter] = useState("all");

  useEffect(() => {
    loadMenuItems();
  }, []);

  const loadMenuItems = async () => {
    setIsLoading(true);
    try {
      const items = await MenuItem.list("-created_at");
      setMenuItems(items);
    } catch (error) {
      console.error("Error loading menu items:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleItemSubmit = async (itemData) => {
    try {
      if (editingItem) {
        await MenuItem.update(editingItem.id, itemData);
      } else {
        await MenuItem.create(itemData);
      }
      loadMenuItems();
      setShowItemDialog(false);
      setEditingItem(null);
    } catch (error) {
      console.error("Error saving menu item:", error);
    }
  };

  const handleItemEdit = (item) => {
    setEditingItem(item);
    setShowItemDialog(true);
  };

  const handleToggleAvailability = async (item) => {
    try {
      await MenuItem.update(item.id, { ...item, available: !item.available });
      loadMenuItems();
    } catch (error) {
      console.error("Error updating item availability:", error);
    }
  };

  const handleItemDelete = async (item) => {
    if (!window.confirm(`Are you sure you want to delete "${item.name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await MenuItem.delete(item.id);
      loadMenuItems();
    } catch (error) {
      console.error("Error deleting menu item:", error);
      alert("Failed to delete menu item. Please try again.");
    }
  };

  const filteredItems = menuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || item.category === categoryFilter;
    const matchesAvailability = availabilityFilter === "all" || 
                               (availabilityFilter === "available" && item.available) ||
                               (availabilityFilter === "unavailable" && !item.available);
    
    return matchesSearch && matchesCategory && matchesAvailability;
  });

  return (
    <AdminOnly>
      <div className="p-4 md:p-8 min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4"
          >
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Menu Management</h1>
              <p className="text-gray-600">Manage your restaurant's menu items</p>
            </div>
            <Button 
              onClick={() => setShowItemDialog(true)}
              className="bg-orange-600 hover:bg-orange-700 shadow-lg"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Menu Item
            </Button>
          </motion.div>

          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search menu items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white"
              />
            </div>
            <MenuFilters
              categoryFilter={categoryFilter}
              setCategoryFilter={setCategoryFilter}
              availabilityFilter={availabilityFilter}
              setAvailabilityFilter={setAvailabilityFilter}
            />
          </div>

          {/* Menu Grid */}
          <MenuGrid
            items={filteredItems}
            isLoading={isLoading}
            onItemEdit={handleItemEdit}
            onItemDelete={handleItemDelete}
            onToggleAvailability={handleToggleAvailability}
          />

          {/* Add/Edit Item Dialog */}
          <MenuItemDialog
            open={showItemDialog}
            onClose={() => {
              setShowItemDialog(false);
              setEditingItem(null);
            }}
            item={editingItem}
            onSubmit={handleItemSubmit}
          />
        </div>
      </div>
    </AdminOnly>
  );
}