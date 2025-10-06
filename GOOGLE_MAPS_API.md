# Google Maps API Configuration

## API Key
The application uses the Google Maps JavaScript API for address autocomplete functionality.

**API Key**: `AIzaSyBAdrGqraTnDzwmYabx44snhbyyTsnuIRA`

## Configuration

### Environment Variable
The API key is stored in `.env` file:
```
VITE_GOOGLE_MAPS_API_KEY=AIzaSyBAdrGqraTnDzwmYabx44snhbyyTsnuIRA
```

### Usage
The API key is used in the following component:
- `src/components/customer/AddressAutocomplete.jsx` - Loads Google Maps Places API for address autocomplete

## Features Using Google Maps API

### 1. Address Autocomplete
- **Component**: `AddressAutocomplete.jsx`
- **Library**: Google Places API
- **Functionality**:
  - Provides address suggestions as user types
  - Validates addresses
  - Returns geocoded coordinates (latitude/longitude)
  - Restricted to US addresses only

### 2. Distance Calculation
- Uses coordinates from Google Places API
- Calculates straight-line distance using Haversine formula
- Validates addresses are within 10-mile delivery radius
- No additional API calls needed (uses coordinates from autocomplete)

## API Restrictions

For production use, ensure the following API restrictions are properly configured in Google Cloud Console:

### API Restrictions
- **Maps JavaScript API** - Required for the Places library
- **Places API** - Required for autocomplete functionality

### Application Restrictions
You may want to configure HTTP referrer restrictions:
- Add your production domain(s)
- Add localhost for development: `http://localhost:*`
- Add any preview/staging domains

### Example Referrer Configuration
```
https://yourdomain.com/*
https://*.yourdomain.com/*
http://localhost:*
```

## Troubleshooting

### If Address Autocomplete Fails
1. Check that the API key is correctly set in `.env`
2. Verify the API key has Maps JavaScript API enabled
3. Check HTTP referrer restrictions in Google Cloud Console
4. Ensure billing is enabled for the Google Cloud project
5. Check browser console for specific error messages

### Common Errors
- **RefererNotAllowedMapError**: Add your domain to HTTP referrer restrictions
- **ApiNotActivatedMapError**: Enable Maps JavaScript API in Google Cloud Console
- **REQUEST_DENIED**: Check API key validity and restrictions

## Cost Considerations

### Google Maps API Pricing
- Address Autocomplete: $2.83 per 1,000 requests (after free tier)
- Free tier: $200/month credit (covers ~70,000 autocomplete requests)

### Optimization
The application is optimized to minimize API calls:
- Autocomplete only triggers after user starts typing
- Distance calculation uses client-side Haversine formula
- No additional geocoding requests needed
- Session tokens could be implemented for further cost reduction

## Security Best Practices

1. **Never commit API keys to version control** - Use environment variables
2. **Configure HTTP referrer restrictions** in production
3. **Enable only required APIs** - Disable unused Google services
4. **Monitor usage** in Google Cloud Console
5. **Set up billing alerts** to prevent unexpected charges

## Future Enhancements

Potential improvements that would require additional Google Maps API usage:
1. **Distance Matrix API** - Calculate actual driving distance (vs. straight-line)
2. **Static Maps API** - Display delivery zone map dynamically
3. **Directions API** - Show delivery routes
4. **Geocoding API** - Reverse geocode coordinates to addresses (if needed)

Note: Current implementation uses only Places API which is sufficient for address validation and distance calculation.
