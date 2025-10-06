import Layout from "./Layout.jsx";

import Dashboard from "./Dashboard";

import Orders from "./Orders";

import Menu from "./Menu";

import Reports from "./Reports";

import CustomerOrder from "./CustomerOrder";

import OrderingSettings from "./OrderingSettings";

import SMSManagement from "./SMSManagement";

import CustomerSettings from "./CustomerSettings";

import Profile from "./Profile";

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

const PAGES = {
    
    Dashboard: Dashboard,
    
    Orders: Orders,
    
    Menu: Menu,
    
    Reports: Reports,
    
    CustomerOrder: CustomerOrder,
    
    OrderingSettings: OrderingSettings,
    
    SMSManagement: SMSManagement,
    
    CustomerSettings: CustomerSettings,
    
    Profile: Profile,
    
}

function _getCurrentPage(url) {
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    let urlLastPart = url.split('/').pop();
    if (urlLastPart.includes('?')) {
        urlLastPart = urlLastPart.split('?')[0];
    }

    const pageName = Object.keys(PAGES).find(page => page.toLowerCase() === urlLastPart.toLowerCase());
    return pageName || Object.keys(PAGES)[0];
}

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
    const location = useLocation();
    const currentPage = _getCurrentPage(location.pathname);
    
    return (
        <Layout currentPageName={currentPage}>
            <Routes>            
                
                    <Route path="/" element={<Dashboard />} />
                
                
                <Route path="/Dashboard" element={<Dashboard />} />
                
                <Route path="/Orders" element={<Orders />} />
                
                <Route path="/Menu" element={<Menu />} />
                
                <Route path="/Reports" element={<Reports />} />
                
                <Route path="/CustomerOrder" element={<CustomerOrder />} />
                
                <Route path="/OrderingSettings" element={<OrderingSettings />} />
                
                <Route path="/SMSManagement" element={<SMSManagement />} />
                
                <Route path="/CustomerSettings" element={<CustomerSettings />} />
                
                <Route path="/Profile" element={<Profile />} />
                
            </Routes>
        </Layout>
    );
}

export default function Pages() {
    return (
        <Router>
            <PagesContent />
        </Router>
    );
}