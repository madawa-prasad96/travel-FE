// import axios from 'axios';
import type { Trip, Day, TripLocation } from '../types';

// Mock response data
const MOCK_POLYLINE = "cmpeA_~clC~@s@v@y@z@{@|@}@~@_A`@aAh@bAl@dA`@eAf@gAh@iAj@kAl@mAn@oAp@qArk@dAlB|@dCx@pCzA~C~@lD~@tD"; // Valid random polyline

export const api = {
  calculateTrip: async (trip: Trip): Promise<{ days: Day[], tripPolyline: string[], totalDistance: number, totalCost: number }> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));

    // Helper: Haversine Formula for distance (km)
    const getDist = (l1: TripLocation, l2: TripLocation) => {
        const R = 6371; // Radius of earth in km
        const dLat = (l2.lat - l1.lat) * (Math.PI / 180);
        const dLng = (l2.lng - l1.lng) * (Math.PI / 180);
        const a = 
            Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(l1.lat * (Math.PI / 180)) * Math.cos(l2.lat * (Math.PI / 180)) * 
            Math.sin(dLng/2) * Math.sin(dLng/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c; // Distance in km
    };

    let totalTripDistance = 0;
    let totalTripCost = 0;

    const updatedDays = trip.days.map((day, index) => {
      // Re-calculate start location if not explicitly set (logic from App.tsx repeated here for backend validity)
      let currentStart = day.startLocation;
      if (!currentStart && index > 0) {
          const prev = trip.days[index - 1];
          currentStart = prev.type === 'TRAVEL' ? prev.endLocation : prev.startLocation;
      }

      let dayDistance = 0;
      let dayCost = 0;

      if (day.type === 'TRAVEL') {
        const locations = [];
        if (currentStart) locations.push(currentStart);
        day.stops.forEach(s => locations.push(s));
        if (day.endLocation) locations.push(day.endLocation);

        // Calculate simple path distance
        for (let i = 0; i < locations.length - 1; i++) {
            dayDistance += getDist(locations[i], locations[i+1]);
        }
        
        // Add "Road Factor" of 1.3 to estimate driving distance vs air distance
        dayDistance = Math.round(dayDistance * 1.3);

        // Mock Cost: Base $50 + $0.5 per km * members
        dayCost = 50 + (dayDistance * 0.5 * trip.members);
      } else {
        // STAY day cost: Base $100 accommodation estimate
        dayCost = 100 * trip.members; 
      }
      
      totalTripDistance += dayDistance;
      totalTripCost += dayCost;

      return {
        ...day,
        distance: dayDistance,
        cost: Math.round(dayCost),
        polyline: day.type === 'TRAVEL' ? MOCK_POLYLINE : undefined
      };
    });

    return {
      days: updatedDays,
      tripPolyline: trip.days.filter(d => d.type === 'TRAVEL').map(() => MOCK_POLYLINE),
      totalDistance: Math.round(totalTripDistance),
      totalCost: Math.round(totalTripCost)
    };
  },

  saveTrip: async (trip: Trip): Promise<Trip> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    console.log('Trip saved:', trip);
    return trip;
  }
};
