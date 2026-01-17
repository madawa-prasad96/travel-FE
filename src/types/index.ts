export interface TripLocation {
  name: string;
  lat: number;
  lng: number;
}

export interface Stop extends TripLocation {
  id: string;
}

export type DayType = 'TRAVEL' | 'STAY';

export interface Day {
  dayNo: number;
  type: DayType;
  startLocation?: TripLocation; // For Travel days (except Day 1 which might be fixed from trip start)
  endLocation?: TripLocation;   // Destination for Travel days
  stops: Stop[];
  polyline?: string; // Encoded polyline for the day's route
  distance?: number; // Estimated distance in km
  cost?: number; // Estimated cost in USD
}

export interface Trip {
  id: string;
  members: number;
  days: Day[];
  tripPolyline?: string[]; // Array of encoded polylines for the full trip
  totalDistance?: number;
  totalCost?: number;
}

export interface MappedPoint {
  location: TripLocation;
  type: 'START' | 'STOP' | 'END';
}

export interface RouteSegment {
  points: MappedPoint[];
  color: string;
}
