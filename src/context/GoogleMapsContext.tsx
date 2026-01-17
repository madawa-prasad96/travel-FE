import React, { createContext, useContext, type ReactNode } from 'react';
import { APIProvider } from '@vis.gl/react-google-maps';

// This would typically come from environment variables
// For this demo, we might need to ask the user for a key or just leave it empty/mocked if they want to test UI only without map loads first.
// However, the prompt implies "Google Maps JavaScript SDK" is a requirement.
// I will start by using a placeholder, and if it fails, I'll ask the user.
// But for "Google Maps logic", we often need a key.
// I will check if there is an env file later, for now I'll create the structure.

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

interface GoogleMapsContextType {
  isLoaded: boolean;
}

const GoogleMapsContext = createContext<GoogleMapsContextType>({ isLoaded: false });

export const useGoogleMaps = () => useContext(GoogleMapsContext);

export const GoogleMapsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <APIProvider apiKey={GOOGLE_MAPS_API_KEY} onLoad={() => console.log('Maps API Loaded')}>
      {children}
    </APIProvider>
  );
};
