import { RouteMap } from './RouteMap';
import type { RouteSegment, Trip } from '../types';

interface TripRouteSummaryProps {
  segments: RouteSegment[];
  trip: Trip;
}

export const TripRouteSummary = ({ segments, trip }: TripRouteSummaryProps) => {
  return (
    <div className="bg-white rounded-3xl shadow-2xl border border-amber-100 overflow-hidden">
      <div className="p-6 bg-gradient-to-r from-amber-500 to-orange-500 text-white">
        <h3 className="text-xl font-bold">Your Travel Route</h3>
        <p className="text-amber-100 text-sm">Interactive map of your planned itinerary</p>
      </div>

      <div className="h-[500px] w-full relative">
        <RouteMap segments={segments} />
      </div>
    </div>
  );
};
