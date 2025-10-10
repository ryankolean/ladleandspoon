
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin, CheckCircle, AlertTriangle } from "lucide-react";

export default function AddressAutocomplete({ onAddressChange, value, error }) {
  const inputRef = useRef(null);
  const autocompleteRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [apiLoadError, setApiLoadError] = useState(null);
  const [validationStatus, setValidationStatus] = useState(null);

  const handlePlaceSelect = useCallback(() => {
    if (!autocompleteRef.current) return;

    const place = autocompleteRef.current.getPlace();
    
    if (place.geometry && place.formatted_address) {
      const addressData = {
        formatted_address: place.formatted_address,
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng(),
        place_id: place.place_id,
        address_components: place.address_components
      };

      setValidationStatus('valid');
      onAddressChange(addressData);
    } else {
      setValidationStatus('invalid');
      onAddressChange(null);
    }
  }, [onAddressChange]);

  useEffect(() => {
    const callbackName = 'initAutocomplete';

    // This function will be called by the Google Maps script once it's loaded
    window[callbackName] = () => {
      setIsLoaded(true);
    };

    // Prevent duplicate script loading
    if (document.querySelector('script[src*="maps.googleapis.com"]')) {
      if (window.google && window.google.maps) {
        setIsLoaded(true);
      }
      return;
    }
    
    const script = document.createElement('script');
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "AIzaSyBAdrGqraTnDzwmYabx44snhbyyTsnuIRA";
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=${callbackName}`;
    script.async = true;
    script.defer = true;
    script.onerror = () => {
      setApiLoadError('Address lookup service failed to load. Please check your API key and its restrictions in Google Cloud.');
      console.error('Error loading Google Maps API script. Check API Key restrictions (HTTP referrers).');
    };
    
    document.head.appendChild(script);

    // Cleanup function
    return () => {
      if (window[callbackName]) {
        delete window[callbackName];
      }
    };
  }, []);

  useEffect(() => {
    if (!isLoaded || !inputRef.current || autocompleteRef.current) {
      return;
    }

    try {
      autocompleteRef.current = new window.google.maps.places.Autocomplete(inputRef.current, {
        types: ['address'],
        componentRestrictions: { country: 'us' },
        fields: ['formatted_address', 'geometry', 'place_id', 'address_components']
      });

      autocompleteRef.current.addListener('place_changed', handlePlaceSelect);
    } catch (error) {
      console.error('Error initializing Google Places Autocomplete:', error);
      setApiLoadError('Could not initialize address search. Please refresh.');
    }
  }, [isLoaded, handlePlaceSelect]);

  const handleInputChange = (e) => {
    const inputValue = e.target.value;
    setValidationStatus(null);

    if (inputValue.trim() === '') {
      onAddressChange(null);
    } else {
      onAddressChange({ formatted_address: inputValue, manual: true });
    }
  };

  return (
    <div className="space-y-2">
      <Label className="flex items-center gap-2">
        <MapPin className="w-4 h-4" />
        Delivery Address *
      </Label>
      <div className="relative">
        <Input
          ref={inputRef}
          value={value?.formatted_address || ''}
          onChange={handleInputChange}
          placeholder="Start typing your delivery address..."
          className={`pr-10 ${error || apiLoadError ? 'border-red-500' : ''} ${
            validationStatus === 'valid' ? 'border-green-500' : ''
          }`}
          required
          disabled={!isLoaded || !!apiLoadError}
        />
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          {validationStatus === 'valid' && (
            <CheckCircle className="w-4 h-4 text-green-500" />
          )}
          {(validationStatus === 'invalid' || apiLoadError) && (
            <AlertTriangle className="w-4 h-4 text-red-500" />
          )}
        </div>
      </div>
      {apiLoadError && (
        <p className="text-sm text-red-600">{apiLoadError}</p>
      )}
      {error && !apiLoadError && (
        <p className="text-sm text-red-600">{error}</p>
      )}
      {validationStatus === 'invalid' && !apiLoadError && (
        <p className="text-sm text-red-600">Please select a valid address from the dropdown suggestions</p>
      )}
      {validationStatus === 'valid' && !apiLoadError && (
        <p className="text-sm text-green-600">✓ Valid address selected</p>
      )}
      {!apiLoadError && (
        <p className="text-xs text-gray-500">
          Select your address from the dropdown for accurate delivery
        </p>
      )}
    </div>
  );
}
