import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Plus, UtensilsCrossed, BarChart3, Settings } from "lucide-react";

export default function QuickActions() {
  const actions = [
    {
      title: "New Order",
      description: "Start taking a new order",
      icon: Plus,
      url: createPageUrl("Orders"),
      color: "bg-green-500 hover:bg-green-600"
    },
    {
      title: "Manage Menu",
      description: "Add or edit menu items",
      icon: UtensilsCrossed,
      url: createPageUrl("Menu"),
      color: "bg-blue-500 hover:bg-blue-600"
    },
    {
      title: "View Reports",
      description: "Check sales and analytics",
      icon: BarChart3,
      url: createPageUrl("Reports"),
      color: "bg-orange-500 hover:bg-orange-600"
    },
    {
      title: "Settings",
      description: "Configure ordering window",
      icon: Settings,
      url: createPageUrl("OrderingSettings"),
      color: "bg-purple-500 hover:bg-purple-600"
    }
  ];

  return (
    <Card className="border-0 shadow-md bg-white/60 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-lg font-bold text-gray-900">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {actions.map((action) => (
            <Link key={action.title} to={action.url}>
              <Button 
                variant="outline" 
                className="w-full h-24 flex flex-col gap-2 bg-white border-2 border-gray-100 hover:border-orange-200 hover:shadow-lg transition-all duration-300"
              >
                <div className={`p-2 rounded-lg ${action.color} shadow-sm`}>
                  <action.icon className="w-5 h-5 text-white" />
                </div>
                <div className="text-center">
                  <p className="font-semibold text-gray-900 text-sm">{action.title}</p>
                  <p className="text-xs text-gray-500">{action.description}</p>
                </div>
              </Button>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}