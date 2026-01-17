/// <reference types="google.maps" />
import React, { useState, useEffect } from 'react';
import { Map, useMap, useMapsLibrary, AdvancedMarker } from '@vis.gl/react-google-maps';
import type { MapMouseEvent } from '@vis.gl/react-google-maps';
import { X, Search, Check, Loader2 } from 'lucide-react';
import type { Location } from '../types';

interface StopPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (location: Location) => void;
  initialLocation?: Location;
}

export const StopPickerModal: React.FC<StopPickerModalProps> = ({ isOpen, onClose, onSelect, initialLocation }) => {
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(initialLocation || null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const map = useMap();
  const placesLib = useMapsLibrary('places');
  const geocodingLib = useMapsLibrary('geocoding');
  const [placesService, setPlacesService] = useState<google.maps.places.PlacesService | null>(null);
  const [geocoder, setGeocoder] = useState<google.maps.Geocoder | null>(null);

  // Initialize Services
  useEffect(() => {
    if (placesLib && map) {
      setPlacesService(new placesLib.PlacesService(map));
    }
    if (geocodingLib) {
      setGeocoder(new geocodingLib.Geocoder());
    }
  }, [placesLib, geocodingLib, map]);

  // Reset state when opening
  useEffect(() => {
    if (isOpen) {
      setSelectedLocation(initialLocation || null);
      setSearchQuery('');
    }
  }, [isOpen, initialLocation]);

  const handleMapClick = (e: MapMouseEvent) => {
    if (!e.detail.latLng || !geocoder) return;

    const lat = e.detail.latLng.lat;
    const lng = e.detail.latLng.lng;

    geocoder.geocode({ location: { lat, lng } }, (results, status) => {
      if (status === 'OK' && results && results[0]) {
        const name = results[0].formatted_address; // Or simplified name
        // Try to find a better name component if possible, e.g. locality or point of interest
        
        setSelectedLocation({
          name: name,
          lat,
          lng
        });
      }
    });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery || !placesService) return;

    setIsSearching(true);
    const request = {
      query: searchQuery,
      fields: ['name', 'geometry', 'formatted_address']
    };

    placesService.findPlaceFromQuery(request, (results, status) => {
      setIsSearching(false);
      if (status === 'OK' && results && results[0] && results[0].geometry && results[0].geometry.location) {
        const place = results[0];
        const location = place.geometry!.location!; 
        const newLoc = {
            name: place.name || place.formatted_address || searchQuery,
            lat: location.lat(),
            lng: location.lng()
        };
        setSelectedLocation(newLoc);
        
        if (map) {
            map.panTo(location);
            map.setZoom(14);
        }
      } else {
        alert('Location not found');
      }
    });
  };

  const handleConfirm = () => {
    if (selectedLocation) {
      onSelect(selectedLocation);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl h-[80vh] flex flex-col overflow-hidden relative">
        {/* Header */}
        <div className="p-4 border-b flex items-center justify-between bg-gray-50">
          <h2 className="text-lg font-bold text-gray-800">Select Location</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 relative flex flex-col md:flex-row">
          {/* Sidebar / Top bar for Search */}
          <div className="w-full md:w-80 bg-white z-10 p-4 border-r flex-shrink-0 flex flex-col gap-4">
             <form onSubmit={handleSearchSubmit} className="relative">
                {isSearching ? (
                   <Loader2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-500 animate-spin" />
                ) : (
                   <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                )}
                <input 
                  type="text" 
                  placeholder="Search places..." 
                  className="w-full pl-9 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
             </form>

             {selectedLocation && (
               <div className="bg-blue-50 border border-blue-100 p-3 rounded-lg animate-in fade-in slide-in-from-top-2">
                  <div className="text-xs text-blue-500 font-semibold mb-1 uppercase">Selected</div>
                  <div className="font-medium text-gray-800">{selectedLocation.name}</div>
                  <div className="text-xs text-gray-500 mt-1">{selectedLocation.lat.toFixed(4)}, {selectedLocation.lng.toFixed(4)}</div>
                  
                  <button 
                    onClick={handleConfirm}
                    className="mt-3 w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                  >
                    <Check className="w-4 h-4" />
                    Confirm Selection
                  </button>
               </div>
             )}

             <div className="mt-auto text-xs text-gray-400 p-2 hidden md:block">
                Click on the map or search to select a stop.
             </div>
          </div>

          {/* Map Container */}
          <div className="flex-1 bg-gray-100 relative h-full min-h-[300px]">
             {/* Note: In a real app we'd need a valid API key for the map to render properly. 
                 If key is invalid, it shows a warning but might still work for dev with watermark. */}
             <Map
                mapId="DEMO_MAP_ID" // Required for AdvancedMarker
                defaultCenter={{ lat: 6.9271, lng: 79.8612 }} // Colombo
                defaultZoom={12}
                gestureHandling={'greedy'}
                onClick={handleMapClick}
                disableDefaultUI={true}
                className="w-full h-full"
             >
                {selectedLocation && (
                   <AdvancedMarker 
                     position={{ lat: selectedLocation.lat, lng: selectedLocation.lng }} 
                   />
                )}
             </Map>
          </div>
        </div>
      </div>
    </div>
  );
};
