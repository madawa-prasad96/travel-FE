/// <reference types="google.maps" />
import React, { useState, useEffect, useRef } from 'react';
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
  const [predictions, setPredictions] = useState<google.maps.places.AutocompletePrediction[]>([]);
  const [hasSelectedPrediction, setHasSelectedPrediction] = useState(false);
  const map = useMap();
  const placesLib = useMapsLibrary('places');
  const geocodingLib = useMapsLibrary('geocoding');
  const [placesService, setPlacesService] = useState<google.maps.places.PlacesService | null>(null);
  const [autocompleteService, setAutocompleteService] = useState<google.maps.places.AutocompleteService | null>(null);
  const [geocoder, setGeocoder] = useState<google.maps.Geocoder | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  // Initialize Services
  useEffect(() => {
    if (placesLib && map) {
      setPlacesService(new placesLib.PlacesService(map));
      setAutocompleteService(new placesLib.AutocompleteService());
    }
    if (geocodingLib) {
      setGeocoder(new geocodingLib.Geocoder());
    }
  }, [placesLib, geocodingLib, map]);

  // Reset state when opening and focus search input
  useEffect(() => {
    if (isOpen) {
      setSelectedLocation(initialLocation || null);
      setSearchQuery('');
      setPredictions([]);
      searchInputRef.current?.focus();
    }
  }, [isOpen, initialLocation]);

  const handleMapClick = (e: MapMouseEvent) => {
    if (!e.detail.latLng || !geocoder) return;

    const lat = e.detail.latLng.lat;
    const lng = e.detail.latLng.lng;

    geocoder.geocode({ location: { lat, lng } }, (results, status) => {
      if (status === 'OK' && results && results[0]) {
        const name = results[0].formatted_address;
        setSelectedLocation({
          name,
          lat,
          lng
        });
      }
    });
  };

  const fetchPredictions = (query: string) => {
    if (!query || !autocompleteService) {
      setPredictions([]);
      return;
    }

    setIsSearching(true);
    // Restrict results to Sri Lanka only
    const request = {
      input: query,
      componentRestrictions: { country: 'lk' }
    };

    autocompleteService.getPlacePredictions(request, (results, status) => {
      setIsSearching(false);
      if (status === 'OK' && results) {
        setPredictions(results);
      } else {
        setPredictions([]);
      }
    });
  };

  const selectPrediction = (prediction: google.maps.places.AutocompletePrediction) => {
    if (!placesService || !prediction.place_id) return;

    setIsSearching(true);
    placesService.getDetails(
      { placeId: prediction.place_id, fields: ['name', 'geometry', 'formatted_address'] },
      (place, status) => {
        setIsSearching(false);
        setPredictions([]);

            if (status === 'OK' && place && place.geometry?.location) {
          const location = place.geometry.location;
          const name = place.name || prediction.structured_formatting.main_text || prediction.description || searchQuery;
          const newLoc = {
            name,
            lat: location.lat(),
            lng: location.lng()
          };
          setSelectedLocation(newLoc);
          setSearchQuery(name);
          setPredictions([]);
          setHasSelectedPrediction(true);

          if (map) {
            map.panTo(location);
            map.setZoom(14);
          }
        }
      }
    );
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (predictions.length > 0) {
      selectPrediction(predictions[0]);
      return;
    }

    if (searchQuery.trim().length >= 2) {
      setHasSelectedPrediction(false);
      fetchPredictions(searchQuery.trim());
    }
  };

  useEffect(() => {
    const normalized = searchQuery.trim();
    if (!normalized || normalized.length < 2 || !autocompleteService) {
      setPredictions([]);
      return;
    }

    if (hasSelectedPrediction) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      fetchPredictions(normalized);
    }, 400);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [searchQuery, autocompleteService]);

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
                   <Loader2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-500 animate-spin" />
                ) : (
                   <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                )}
                <input 
                  ref={searchInputRef}
                  type="text" 
                  placeholder="Search places..." 
                  className="w-full pl-9 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all"
                  value={searchQuery}
                  onChange={e => {
                    setHasSelectedPrediction(false);
                    setSearchQuery(e.target.value);
                  }}
                />

                {predictions.length > 0 && (
                  <div className="absolute left-0 right-0 mt-1 z-20 max-h-72 overflow-y-auto rounded-2xl border border-gray-200 bg-white shadow-xl">
                    {predictions.map((prediction, index) => (
                      <button
                        key={`${prediction.place_id || index}-${index}`}
                        type="button"
                        onClick={() => selectPrediction(prediction)}
                        className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
                      >
                        <div className="font-medium text-gray-800">{prediction.structured_formatting?.main_text || prediction.description}</div>
                        {prediction.structured_formatting?.secondary_text && (
                          <div className="text-xs text-gray-500 mt-1">{prediction.structured_formatting.secondary_text}</div>
                        )}
                      </button>
                    ))}
                  </div>
                )}

                {searchQuery.trim().length >= 2 && !isSearching && predictions.length === 0 && (
                  <div className="absolute left-0 right-0 mt-1 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-500">
                    No suggestions found.
                  </div>
                )}
             </form>

             {selectedLocation && (
               <div className="bg-amber-50 border border-amber-100 p-3 rounded-lg animate-in fade-in slide-in-from-top-2">
                  <div className="text-xs text-amber-500 font-semibold mb-1 uppercase">Selected</div>
                  <div className="font-medium text-gray-800">{selectedLocation.name}</div>
                  <div className="text-xs text-gray-500 mt-1">{selectedLocation.lat.toFixed(4)}, {selectedLocation.lng.toFixed(4)}</div>
                  
                  <button 
                    onClick={handleConfirm}
                    className="mt-3 w-full flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
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
