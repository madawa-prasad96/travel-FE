/// <reference types="google.maps" />
import { useEffect, useState } from 'react';
import { Map, useMap, useMapsLibrary, AdvancedMarker, Pin } from '@vis.gl/react-google-maps';
import type { RouteSegment, MappedPoint } from '../types';

interface RouteMapProps {
  segments: RouteSegment[];
}

// Single Segment Renderer
const SegmentRenderer = ({ segment }: { segment: RouteSegment }) => {
  const map = useMap();
  const routesLibrary = useMapsLibrary('routes');
  const [directionsService, setDirectionsService] = useState<google.maps.DirectionsService | null>(null);
  const [directionsRenderer, setDirectionsRenderer] = useState<google.maps.DirectionsRenderer | null>(null);

  useEffect(() => {
    if (!routesLibrary || !map) return;
    
    setDirectionsService(new routesLibrary.DirectionsService());
    setDirectionsRenderer(new routesLibrary.DirectionsRenderer({
        map,
        suppressMarkers: true,
        polylineOptions: {
            strokeColor: segment.color,
            strokeWeight: 5,
            strokeOpacity: 0.8
        }
    }));
  }, [routesLibrary, map, segment.color]);

  useEffect(() => {
    if (!directionsService || !directionsRenderer || segment.points.length < 2) return;

    const origin = segment.points[0].location;
    const destination = segment.points[segment.points.length - 1].location;
    const waypoints = segment.points.slice(1, -1).map(p => ({
        location: { lat: p.location.lat, lng: p.location.lng },
        stopover: true
    }));

    directionsService.route({
        origin: { lat: origin.lat, lng: origin.lng },
        destination: { lat: destination.lat, lng: destination.lng },
        waypoints: waypoints,
        travelMode: google.maps.TravelMode.DRIVING,
    }).then(response => {
        directionsRenderer.setDirections(response);
    }).catch(e => {
        console.error("Directions request failed for segment", e);
    });

    return () => {
        directionsRenderer.setDirections({ routes: [] } as any);
    };
  }, [directionsService, directionsRenderer, segment]);

  return null;
};

export const RouteMap = ({ segments }: RouteMapProps) => {
  const getPinColor = (type: MappedPoint['type']) => {
      switch (type) {
          case 'START': return { bg: '#10B981', border: '#059669' }; // Green
          case 'END': return { bg: '#EF4444', border: '#B91C1C' };   // Red
          default: return { bg: '#F59E0B', border: '#D97706' };      // Yellow
      }
  };

  // Flatten points for markers
  const allPoints = segments.flatMap((s, sIdx) => 
      s.points.map((p, pIdx) => ({ ...p, key: `${sIdx}-${pIdx}-${p.location.lat}` }))
  );

  return (
    <Map
      mapId="DEMO_MAP_ID"
      defaultZoom={7}
      defaultCenter={{ lat: 7.8731, lng: 80.7718 }}
      gestureHandling={'greedy'}
      disableDefaultUI={false}
      className="w-full h-full"
    >
      {segments.map((segment, index) => (
          <SegmentRenderer key={index} segment={segment} />
      ))}
      
      {allPoints.map((pt) => {
         const colors = getPinColor(pt.type);
         return (
             <AdvancedMarker key={pt.key} position={pt.location}>
                <Pin background={colors.bg} borderColor={colors.border} glyphColor={'#FFF'} />
             </AdvancedMarker>
         );
      })}
    </Map>
  );
};
