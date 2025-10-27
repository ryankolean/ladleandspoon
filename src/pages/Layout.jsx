
import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { User } from "@/services";
import SessionProvider from "@/components/auth/SessionProvider";
import { sessionManager } from "@/utils/sessionManager";
import {
  LayoutDashboard,
  UtensilsCrossed,
  ShoppingCart,
  BarChart3,
  Settings,
  Coffee,
  Truck,
  LogOut,
  Users,
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

import ViewToggle from "@/components/ViewToggle";
import CustomerOrder from "@/pages/CustomerOrder";

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
    title: "Delivery Route",
    url: createPageUrl("DeliveryRoute"),
    icon: Truck,
  },
  {
    title: "Menu",
    url: createPageUrl("Menu"),
    icon: UtensilsCrossed,
  },
  {
    title: "Reports",
    url: createPageUrl("Reports"),
    icon: BarChart3,
  },
  {
    title: "SMS Messaging",
    url: createPageUrl("SMSPanel"),
    icon: MessageSquare,
  },
  {
    title: "Ordering Settings",
    url: createPageUrl("OrderingSettings"),
    icon: Settings,
  },
  {
    title: "User Management",
    url: "/users",
    icon: Users,
  },
];

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [currentView, setCurrentView] = useState("customer");
  const [currentUser, setCurrentUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await User.me();
        setCurrentUser(user);

        if (user) {
          try {
            const adminStatus = await User.isAdmin();
            setIsAdmin(adminStatus);
          } catch (adminError) {
            console.error('Admin check failed:', adminError);
            setIsAdmin(false);
          }

          const path = window.location.pathname;
          if (path !== '/' && path !== '/order') {
            setCurrentView("admin");
          } else {
            setCurrentView("customer");
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        setCurrentUser(null);
        setIsAdmin(false);
      } finally {
        setIsCheckingAuth(false);
      }
    };

    checkAuth();
  }, []);

  const handleViewChange = (newView) => {
    setCurrentView(newView);
    if (newView === "admin") {
      navigate(createPageUrl("Dashboard"));
    } else {
      navigate("/");
    }
  };

  const handleLogout = async () => {
    try {
      sessionManager.stopActivityMonitoring();
      sessionManager.clearSession();
      await User.signOut();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

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
        {/* Top right controls */}
        <div className="absolute top-4 right-4 z-50 flex items-center gap-3">
          {isAdmin && (
            <ViewToggle currentView={currentView} onViewChange={handleViewChange} />
          )}
          {currentUser && (
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 text-sm font-medium text-red-600 hover:bg-red-50 border border-red-200"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          )}
        </div>
        <CustomerOrder />
      </div>
    );
  }

  // Admin view - only accessible to logged-in admin users
  // Redirect non-admins to customer view
  if (!isAdmin) {
    navigate('/');
    return null;
  }

  return (
    <SessionProvider>
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

          <SidebarFooter className="border-t border-orange-100 p-4 space-y-3">
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
                <p className="text-xs text-gray-500 truncate">
                  Admin Panel Active
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors duration-200"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </SidebarFooter>
        </Sidebar>

        <main className="flex-1 flex flex-col">
          <header className="bg-white/90 backdrop-blur-sm border-b border-orange-100 px-6 py-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <SidebarTrigger className="hover:bg-orange-50 p-2 rounded-lg transition-colors duration-200 md:hidden" />
                <h1 className="text-xl font-bold text-gray-900 hidden md:block">Ladle & Spoon POS</h1>
              </div>

              <ViewToggle currentView={currentView} onViewChange={handleViewChange} />
            </div>
          </header>

          <div className="flex-1 overflow-auto">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
    </SessionProvider>
  );
}
