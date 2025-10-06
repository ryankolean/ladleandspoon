
import React from 'react';
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function MenuFilters({ 
  categoryFilter, 
  setCategoryFilter, 
  availabilityFilter, 
  setAvailabilityFilter 
}) {
  const categories = ["all", "soup", "baked_good", "specials", "box"];

  return (
    <div className="flex gap-4">
      <Select value={categoryFilter} onValueChange={setCategoryFilter}>
        <SelectTrigger className="w-40 bg-white">
          <SelectValue placeholder="Category" />
        </SelectTrigger>
        <SelectContent>
          {categories.map(category => (
            <SelectItem key={category} value={category}>
              {category === "all" ? "All Categories" : 
               category === "baked_good" ? "Baked Goods" :
               category === "box" ? "Box Meals" :
               category.charAt(0).toUpperCase() + category.slice(1)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={availabilityFilter} onValueChange={setAvailabilityFilter}>
        <SelectTrigger className="w-40 bg-white">
          <SelectValue placeholder="Availability" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Items</SelectItem>
          <SelectItem value="available">Available</SelectItem>
          <SelectItem value="unavailable">Unavailable</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
