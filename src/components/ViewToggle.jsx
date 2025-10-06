import React from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, Settings } from "lucide-react";

export default function ViewToggle({ currentView, onViewChange }) {
  return (
    <div className="flex items-center gap-2 bg-white/90 backdrop-blur-sm rounded-lg border border-orange-100 p-1 shadow-sm">
      <Button
        variant={currentView === "admin" ? "default" : "ghost"}
        size="sm"
        onClick={() => onViewChange("admin")}
        className={currentView === "admin" ? "bg-orange-600 hover:bg-orange-700" : "hover:bg-orange-50"}
      >
        <Settings className="w-4 h-4 mr-1" />
        Admin
      </Button>
      <Button
        variant={currentView === "customer" ? "default" : "ghost"}
        size="sm"
        onClick={() => onViewChange("customer")}
        className={currentView === "customer" ? "bg-green-600 hover:bg-green-700" : "hover:bg-green-50"}
      >
        <Eye className="w-4 h-4 mr-1" />
        Customer
      </Button>
    </div>
  );
}