export function createPageUrl(pageName) {
  const routes = {
    'Dashboard': '/dashboard',
    'Menu': '/menu',
    'Orders': '/orders',
    'DeliveryRoute': '/deliveryroute',
    'Reports': '/reports',
    'OrderingSettings': '/settings',
    'SMSPanel': '/smspanel',
    'SMSManagement': '/sms',
    'CustomerOrder': '/',
    'Profile': '/profile',
    'CustomerSettings': '/customer-settings'
  };

  const url = routes[pageName] || '/';
  console.log('createPageUrl:', pageName, '→', url);
  return url;
}
