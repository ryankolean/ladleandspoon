import React, { useState } from 'react';
import { User } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { LogOut } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import PersonalInfo from '../components/profile/PersonalInfo';
import AddressManagement from '../components/profile/AddressManagement';
import Preferences from '../components/profile/Preferences';
import OrderHistory from '../components/profile/OrderHistory';

const tabs = [
  { name: 'personal', label: 'Personal Info' },
  { name: 'addresses', label: 'Addresses' },
  { name: 'preferences', label: 'Preferences' },
  { name: 'orders', label: 'Order History' },
];

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState('personal');

  const handleLogout = async () => {
    await User.logout();
    window.location.href = createPageUrl('CustomerOrder');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
            My Account
          </h1>
          <p className="text-gray-600 mt-2">Manage your information, addresses, and preferences</p>
        </header>

        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
          <CardContent className="p-4 md:p-6">
            <div className="border-b border-gray-200 mb-6">
              <nav className="flex flex-wrap -mb-px" aria-label="Tabs">
                {tabs.map((tab) => (
                  <button
                    key={tab.name}
                    onClick={() => setActiveTab(tab.name)}
                    className={`
                      whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                      ${activeTab === tab.name
                        ? 'border-orange-500 text-orange-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }
                      mx-2 transition-all
                    `}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            <div>
              {activeTab === 'personal' && <PersonalInfo />}
              {activeTab === 'addresses' && <AddressManagement />}
              {activeTab === 'preferences' && <Preferences />}
              {activeTab === 'orders' && <OrderHistory />}
            </div>
          </CardContent>
        </Card>
        
        <div className="mt-8 flex justify-center items-center gap-4">
            <Button asChild variant="outline">
                <Link to={createPageUrl('CustomerOrder')}>Back to Ordering</Link>
            </Button>
            <Button variant="ghost" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
            </Button>
        </div>
      </div>
    </div>
  );
}