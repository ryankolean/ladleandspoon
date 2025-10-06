
import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { User } from "@/api/entities";
import {
  LayoutDashboard,
  UtensilsCrossed,
  ShoppingCart,
  BarChart3,
  Settings,
  Coffee,
  MessageSquare,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

import ViewToggle from "./components/ViewToggle";
import CustomerOrder from "./pages/CustomerOrder";

const navigationItems = [
  {
    title: "Dashboard",
    url: createPageUrl("Dashboard"),
    icon: LayoutDashboard,
  },
  {
    title: "Orders",
    url: createPageUrl("Orders"),
    icon: ShoppingCart,
  },
  {
    title: "Menu",
    url: createPageUrl("Menu"),
    icon: UtensilsCrossed,
  },
  {
    title: "SMS Marketing",
    url: createPageUrl("SMSManagement"),
    icon: MessageSquare,
  },
  {
    title: "Reports",
    url: createPageUrl("Reports"),
    icon: BarChart3,
  },
  {
    title: "Ordering Settings",
    url: createPageUrl("OrderingSettings"),
    icon: Settings,
  },
];

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const [currentView, setCurrentView] = useState("customer");
  const [currentUser, setCurrentUser] = useState(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await User.me();
        setCurrentUser(user);
        // If user is admin, default to admin view, otherwise stay in customer view
        if (user?.role === 'admin') {
          setCurrentView("admin");
        }
      } catch (error) {
        // User not logged in, stay in customer view
        setCurrentUser(null);
        setCurrentView("customer");
      } finally {
        setIsCheckingAuth(false);
      }
    };

    checkAuth();
  }, []);

  // If still checking authentication, show loading
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center">
        <div className="text-center">
          <Coffee className="w-12 h-12 text-orange-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If user is not logged in or customer view is selected, show customer ordering interface
  if (!currentUser || currentView === "customer") {
    return (
      <div className="min-h-screen relative">
        {/* Only show view toggle if user is logged in and is admin */}
        {currentUser?.role === 'admin' && (
          <div className="absolute top-4 right-4 z-50">
            <ViewToggle currentView={currentView} onViewChange={setCurrentView} />
          </div>
        )}
        <CustomerOrder />
      </div>
    );
  }

  // Admin view - only accessible to logged-in admin users
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-orange-50 to-amber-50">
        <Sidebar className="border-r border-orange-100 bg-white/80 backdrop-blur-sm">
          <SidebarHeader className="border-b border-orange-100 p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl flex items-center justify-center shadow-lg">
                <Coffee className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-xl bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                  Ladle & Spoon
                </h2>
                <p className="text-xs text-gray-500">Point of Sale System</p>
              </div>
            </div>
          </SidebarHeader>

          <SidebarContent className="p-4">
            <SidebarGroup>
              <SidebarGroupLabel className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-2 py-2">
                Restaurant Management
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu className="space-y-1">
                  {navigationItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        className={`hover:bg-orange-50 hover:text-orange-700 transition-all duration-200 rounded-xl ${
                          location.pathname === item.url
                            ? 'bg-gradient-to-r from-orange-100 to-amber-100 text-orange-700 shadow-sm border border-orange-200'
                            : 'hover:shadow-sm'
                        }`}
                      >
                        <Link to={item.url} className="flex items-center gap-3 px-3 py-3">
                          <item.icon className="w-5 h-5" />
                          <span className="font-medium">{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="border-t border-orange-100 p-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-orange-200 to-amber-200 rounded-full flex items-center justify-center">
                <span className="text-orange-700 font-semibold text-sm">
                  {currentUser?.full_name?.charAt(0) || 'U'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 text-sm truncate">
                  {currentUser?.full_name || 'Staff User'}
                </p>
                <p className="text-xs text-gray-500 truncate">Admin Panel Active</p>
              </div>
            </div>
          </SidebarFooter>
        </Sidebar>

        <main className="flex-1 flex flex-col">
          <header className="bg-white/90 backdrop-blur-sm border-b border-orange-100 px-6 py-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <SidebarTrigger className="hover:bg-orange-50 p-2 rounded-lg transition-colors duration-200 md:hidden" />
                <h1 className="text-xl font-bold text-gray-900 hidden md:block">Ladle & Spoon POS</h1>
              </div>

              <ViewToggle currentView={currentView} onViewChange={setCurrentView} />
            </div>
          </header>

          <div className="flex-1 overflow-auto">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
