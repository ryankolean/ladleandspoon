import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";

export default function QuickStats({ title, value, icon: Icon, bgColor, textColor, trend }) {
  return (
    <Card className="relative overflow-hidden border-0 shadow-md bg-white/60 backdrop-blur-sm hover:shadow-lg transition-all duration-300">
      <div className={`absolute top-0 right-0 w-24 h-24 transform translate-x-6 -translate-y-6 ${bgColor} rounded-full opacity-10`} />
      <CardContent className="p-4 md:p-6">
        <div className="flex justify-between items-start mb-4">
          <div className={`p-3 rounded-xl ${bgColor} bg-opacity-15 shadow-sm`}>
            <Icon className={`w-5 h-5 md:w-6 md:h-6 ${textColor}`} />
          </div>
          <div className="text-right">
            <p className="text-xs md:text-sm font-medium text-gray-500 uppercase tracking-wide">{title}</p>
            <p className="text-xl md:text-2xl font-bold text-gray-900 mt-1">{value}</p>
          </div>
        </div>
        {trend && (
          <div className="flex items-center text-xs text-gray-500">
            <TrendingUp className="w-3 h-3 mr-1 text-green-500" />
            <span>{trend}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}