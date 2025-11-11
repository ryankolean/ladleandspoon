export function createPageUrl(pageName) {
  const routes = {
    'Dashboard': '/dashboard',
    'Menu': '/menu',
    'Orders': '/orders',
    'DeliveryRoute': '/deliveryroute',
    'Reports': '/reports',
    'OrderingSettings': '/settings',
    'CustomerOrder': '/',
    'Profile': '/profile',
    'CustomerSettings': '/customer-settings'
  };

  return routes[pageName] || '/';
}
