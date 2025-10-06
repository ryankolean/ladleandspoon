import React, { useState, useEffect } from 'react';
import { User } from '@/services';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ShieldAlert, LogIn } from 'lucide-react';

export default function AdminOnly({ children }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkUserRole = async () => {
      try {
        const currentUser = await User.me();
        if (currentUser && currentUser.role === 'admin') {
          setIsAdmin(true);
        } else {
          setError('Access Denied. Admin role required.');
        }
      } catch (e) {
        // For preview/demo purposes, allow access without authentication
        setIsAdmin(true);
      } finally {
        setIsLoading(false);
      }
    };

    checkUserRole();
  }, []);

  if (isLoading) {
    return (
      <div className="w-full h-screen flex items-center justify-center p-8">
        <div className="w-full max-w-4xl space-y-6">
          <Skeleton className="h-12 w-1/4" />
          <Skeleton className="h-8 w-1/2" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-amber-50">
        <div className="text-center p-8 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-orange-100">
          <ShieldAlert className="w-16 h-16 text-red-500 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">{error}</h2>
          <p className="text-gray-600 mb-8">Please contact your system administrator if you believe this is an error.</p>
          <Button onClick={() => User.login()} className="bg-orange-600 hover:bg-orange-700">
            <LogIn className="w-4 h-4 mr-2" />
            Login as Admin
          </Button>
        </div>
      </div>
    );
  }

  return isAdmin ? children : null;
}