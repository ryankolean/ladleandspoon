# Ladle & Spoon Restaurant Management System

A full-featured restaurant ordering and management system built with React, Vite, and Supabase.

## Features

- **Customer Ordering Interface**: Browse menu, place orders, manage delivery addresses
- **Admin Dashboard**: Real-time order management and analytics
- **Menu Management**: Add, edit, and track inventory
- **SMS Marketing**: Manage campaigns and subscriber lists
- **Reports & Analytics**: Sales tracking and performance metrics
- **Ordering Windows**: Control when orders can be placed

## Accessing the Application

### Customer View
Navigate to `/` to see the customer ordering interface.

### Admin Panel
Access the admin panel by navigating to any of these URLs:
- `/dashboard` - Main dashboard with today's stats
- `/orders` - Order management
- `/menu` - Menu and inventory management
- `/reports` - Sales reports and analytics
- `/sms` - SMS marketing campaigns
- `/settings` - Ordering window configuration

You can also toggle between Customer and Admin views using the view switcher in the top right corner.

**Note**: In preview mode, admin access is enabled without authentication for demonstration purposes.

## Running the app

```bash
npm install
npm run dev
```

## Building the app

```bash
npm run build
```

## Environment Variables

The application requires the following environment variables in `.env`:

```
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_GOOGLE_MAPS_API_KEY=your-google-maps-api-key
```

### Google Maps API
- Required for address autocomplete functionality
- Current key: `AIzaSyBAdrGqraTnDzwmYabx44snhbyyTsnuIRA`
- See `GOOGLE_MAPS_API.md` for detailed configuration and troubleshooting

## Database

This application uses Supabase for data persistence with proper Row Level Security (RLS) policies.

## Key Features in Detail

### Delivery Distance Validation
- Automatically calculates distance from store location (1247 Bielby Waterford, MI 48328)
- Maximum delivery radius: 10 miles
- Real-time distance display during checkout
- Prevents orders from out-of-range addresses
- See `DELIVERY_DISTANCE_FEATURE.md` for technical details