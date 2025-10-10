import Layout from "./Layout.jsx";

import Dashboard from "./Dashboard";

import Orders from "./Orders";

import DeliveryRoute from "./DeliveryRoute";

import Menu from "./Menu";

import Reports from "./Reports";

import CustomerOrder from "./CustomerOrder";

import OrderingSettings from "./OrderingSettings";

import SMSManagement from "./SMSManagement";

import CustomerSettings from "./CustomerSettings";

import Profile from "./Profile";

import Login from "./Login";

import WhimsicalLogin from "./WhimsicalLogin";

import AuthCallback from "./AuthCallback";

import ResetPassword from "./ResetPassword";

import UserManagement from "./UserManagement";

import CustomerHome from "./CustomerHome";

import CustomerMenu from "./CustomerMenu";

import WhimsicalHeader from "@/components/customer/WhimsicalHeader";

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

const PAGES = {

    Dashboard: Dashboard,

    Orders: Orders,

    DeliveryRoute: DeliveryRoute,

    Menu: Menu,

    Reports: Reports,

    CustomerOrder: CustomerOrder,

    OrderingSettings: OrderingSettings,

    SMSManagement: SMSManagement,

    CustomerSettings: CustomerSettings,

    Profile: Profile,

    UserManagement: UserManagement,

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

function PagesContent() {
    const location = useLocation();
    const currentPage = _getCurrentPage(location.pathname);

    if (location.pathname === '/login') {
        return <WhimsicalLogin />;
    }

    if (location.pathname === '/auth/callback') {
        return <AuthCallback />;
    }

    if (location.pathname === '/reset-password') {
        return <ResetPassword />;
    }

    const isCustomerRoute = location.pathname === '/' || location.pathname === '/order' || location.pathname === '/my-orders' || location.pathname === '/checkout';

    if (isCustomerRoute) {
        return (
            <>
                <WhimsicalHeader />
                <Routes>
                    <Route path="/" element={<CustomerHome />} />
                    <Route path="/order" element={<CustomerMenu />} />
                </Routes>
            </>
        );
    }

    return (
        <Layout currentPageName={currentPage}>
            <Routes>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/orders" element={<Orders />} />
                <Route path="/deliveryroute" element={<DeliveryRoute />} />
                <Route path="/menu" element={<Menu />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/settings" element={<OrderingSettings />} />
                <Route path="/sms" element={<SMSManagement />} />
                <Route path="/customer-settings" element={<CustomerSettings />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/users" element={<UserManagement />} />
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