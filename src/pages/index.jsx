import Layout from "./Layout.jsx";

import Dashboard from "./Dashboard";

import Orders from "./Orders";

import DeliveryRoute from "./DeliveryRoute";

import Menu from "./Menu";

import Reports from "./Reports";

import CustomerOrder from "./CustomerOrder";

import OrderingSettings from "./OrderingSettings";

import CustomerSettings from "./CustomerSettings";

import Profile from "./Profile";

import Login from "./Login";

import WhimsicalLogin from "./WhimsicalLogin";

import AuthCallback from "./AuthCallback";

import ResetPassword from "./ResetPassword";

import UserManagement from "./UserManagement";

import SMSPanel from "./SMSPanel";

import CustomerHome from "./CustomerHome";

import CustomerMenu from "./CustomerMenu";

import Checkout from "./Checkout";

import OrderSuccess from "./OrderSuccess";

import MyOrders from "./MyOrders";

import SMSTerms from "./SMSTerms";

import PrivacyPolicy from "./PrivacyPolicy";

import SMSOptIn from "./SMSOptIn";

import TermsAndConditions from "./TermsAndConditions";

import CustomerProfile from "./CustomerProfile";

import WhimsicalHeader from "@/components/customer/WhimsicalHeader";

import { ComplianceFooter } from "@/components/customer/ComplianceFooter";

import AdminOnly from "@/components/auth/AdminOnly";

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

const PAGES = {

    Dashboard: Dashboard,

    Orders: Orders,

    DeliveryRoute: DeliveryRoute,

    Menu: Menu,

    Reports: Reports,

    CustomerOrder: CustomerOrder,

    OrderingSettings: OrderingSettings,

    CustomerSettings: CustomerSettings,

    Profile: Profile,

    UserManagement: UserManagement,

    SMSPanel: SMSPanel,

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

    const isCompliancePage = location.pathname === '/sms-terms' || location.pathname === '/privacy-policy' || location.pathname === '/sms-opt-in' || location.pathname === '/terms';

    if (isCompliancePage) {
        return (
            <div className="flex flex-col min-h-screen">
                <Routes>
                    <Route path="/sms-terms" element={<SMSTerms />} />
                    <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                    <Route path="/sms-opt-in" element={<SMSOptIn />} />
                    <Route path="/terms" element={<TermsAndConditions />} />
                </Routes>
                <ComplianceFooter />
            </div>
        );
    }

    const isCustomerRoute = location.pathname === '/' || location.pathname === '/order' || location.pathname === '/my-orders' || location.pathname === '/checkout' || location.pathname === '/order-success' || location.pathname === '/profile';

    if (isCustomerRoute) {
        return (
            <div className="flex flex-col min-h-screen">
                <WhimsicalHeader />
                <div className="flex-1">
                    <Routes>
                        <Route path="/" element={<CustomerHome />} />
                        <Route path="/order" element={<CustomerMenu />} />
                        <Route path="/my-orders" element={<MyOrders />} />
                        <Route path="/checkout" element={<Checkout />} />
                        <Route path="/order-success" element={<OrderSuccess />} />
                        <Route path="/profile" element={<CustomerProfile />} />
                    </Routes>
                </div>
                <ComplianceFooter />
            </div>
        );
    }

    return (
        <AdminOnly>
            <Layout currentPageName={currentPage}>
                <Routes>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/orders" element={<Orders />} />
                    <Route path="/deliveryroute" element={<DeliveryRoute />} />
                    <Route path="/menu" element={<Menu />} />
                    <Route path="/reports" element={<Reports />} />
                    <Route path="/smspanel" element={<SMSPanel />} />
                    <Route path="/settings" element={<OrderingSettings />} />
                    <Route path="/customer-settings" element={<CustomerSettings />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/users" element={<UserManagement />} />
                </Routes>
            </Layout>
        </AdminOnly>
    );
}

export default function Pages() {
    return (
        <Router>
            <PagesContent />
        </Router>
    );
}