# Delivery Distance Verification Feature

## Overview
Added automatic distance calculation and verification during checkout to ensure customers are within the 10-mile delivery radius from the store location.

## Store Location
**1247 Bielby Waterford, MI 48328**
- Latitude: 42.6725
- Longitude: -83.3799

## Features Implemented

### 1. Automatic Distance Calculation
- Uses the Haversine formula to calculate straight-line distance
- Calculates distance in real-time when customer enters or selects an address
- Displays "Calculating distance..." while processing

### 2. Distance Display
- Shows distance in miles with 1 decimal precision
- Displays above the "I am within the delivery area" checkbox
- Color-coded display:
  - **Green text**: Address is within 10 miles (valid)
  - **Red text**: Address is beyond 10 miles (invalid)
- Shows warning message for out-of-range addresses

### 3. Validation Rules
- Maximum delivery distance: **10 miles**
- Checkbox is automatically disabled if address is beyond range
- Alert shown if user tries to check the box for out-of-range address
- Order submission blocked if address is too far

### 4. User Experience
Works for all user types:
- **Guest users**: Distance calculated when entering address via autocomplete
- **Logged-in users (new address)**: Distance calculated for new addresses
- **Logged-in users (saved address)**: Distance calculated when selecting saved address

### 5. Visual Feedback
```
✓ Within range (≤ 10 miles):
  "Distance from 1247 Bielby Waterford, MI 48328: 7.3 miles" (green)
  [✓] I am within the delivery area (enabled)

✗ Out of range (> 10 miles):
  "Distance from 1247 Bielby Waterford, MI 48328: 15.2 miles" (red)
  "(Maximum delivery distance is 10 miles)"
  [ ] I am within the delivery area (disabled, grayed out)
```

## Technical Details

### Distance Calculation Method
Uses the Haversine formula for calculating great-circle distance between two points on a sphere:
- More accurate than simple Euclidean distance
- Accounts for Earth's curvature
- Returns distance in miles

### State Management
New state variables added:
- `deliveryDistance` - Stores calculated distance in miles (null if not calculated)
- `isCalculatingDistance` - Boolean flag for loading state
- `STORE_ADDRESS` - Constant for store address string
- `MAX_DELIVERY_DISTANCE_MILES` - Constant set to 10

### Error Handling
- Gracefully handles missing coordinates
- Falls back to manual verification if calculation fails
- Displays appropriate error messages to users

## Future Enhancements (Optional)

1. **Google Distance Matrix API**: Could replace Haversine with actual driving distance
2. **Custom Delivery Zones**: Support for non-circular delivery areas (polygons)
3. **Dynamic Distance Limit**: Allow admin to configure max distance in settings
4. **Delivery Fee Tiers**: Variable delivery fees based on distance
5. **Estimated Delivery Time**: Show time based on distance

## Testing Checklist

✅ Distance calculates for guest users entering new address
✅ Distance calculates for logged-in users entering new address
✅ Distance calculates for logged-in users selecting saved address
✅ Green display for addresses within 10 miles
✅ Red display with warning for addresses beyond 10 miles
✅ Checkbox disabled when address is out of range
✅ Alert shown when trying to check disabled checkbox
✅ Order submission blocked for out-of-range addresses
✅ Loading state shows while calculating
✅ Works correctly when switching between addresses

## Notes
- Distance calculation is client-side using coordinates from Google Places API
- No additional API calls needed beyond existing address autocomplete
- Coordinates are already captured as part of the address selection process
