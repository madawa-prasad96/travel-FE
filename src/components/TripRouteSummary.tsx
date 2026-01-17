import { RouteMap } from './RouteMap';
import type { RouteSegment, Trip } from '../types';
import { Calendar, DollarSign, Map as MapIcon, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

interface TripRouteSummaryProps {
  segments: RouteSegment[];
  trip: Trip;
}

export const TripRouteSummary = ({ segments, trip }: TripRouteSummaryProps) => {
  const [isBreakdownOpen, setIsBreakdownOpen] = useState(false);

  // Fallbacks if calc not done
  const totalDist = trip.totalDistance || 0;
  const totalCost = trip.totalCost || 0;

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
      <div className="p-6 bg-gradient-to-r from-blue-50 to-amber-50 border-b border-gray-100">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Full Trip Summary</h3>
        
        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4 mb-4">
             <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center">
                 <div className="bg-blue-100 p-2 rounded-full mb-2">
                     <Calendar className="w-5 h-5 text-blue-600" />
                 </div>
                 <span className="text-2xl font-bold text-gray-800">{trip.days.length}</span>
                 <span className="text-xs text-gray-500 uppercase font-medium">Days</span>
             </div>
             <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center">
                 <div className="bg-emerald-100 p-2 rounded-full mb-2">
                     <MapIcon className="w-5 h-5 text-emerald-600" />
                 </div>
                 <span className="text-2xl font-bold text-gray-800">{totalDist} km</span>
                 <span className="text-xs text-gray-500 uppercase font-medium">Est. Distance</span>
             </div>
             <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center">
                 <div className="bg-amber-100 p-2 rounded-full mb-2">
                     <DollarSign className="w-5 h-5 text-amber-600" />
                 </div>
                 <span className="text-2xl font-bold text-gray-800">${totalCost}</span>
                 <span className="text-xs text-gray-500 uppercase font-medium">Est. Cost</span>
             </div>
        </div>

        {/* Toggle Breakdown */}
        <button 
           onClick={() => setIsBreakdownOpen(!isBreakdownOpen)}
           className="w-full flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-gray-700 py-2"
        >
            {isBreakdownOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            {isBreakdownOpen ? 'Hide Daily Breakdown' : 'Show Daily Breakdown'}
        </button>
      </div>

      {/* Daily Breakdown */}
      {isBreakdownOpen && (
          <div className="border-b border-gray-100 divide-y divide-gray-50 max-h-[300px] overflow-y-auto bg-gray-50/50">
             {trip.days.map((day, idx) => (
                 <div key={idx} className="flex items-center justify-between p-4 px-6">
                      <div className="flex items-center gap-3">
                          <span className="w-6 h-6 rounded-full bg-gray-200 text-gray-600 text-xs flex items-center justify-center font-bold">
                              {day.dayNo}
                          </span>
                          <div className="flex flex-col">
                              <span className="font-medium text-gray-800 text-sm">Day {day.dayNo}</span>
                              <span className="text-xs text-gray-500">{day.type === 'TRAVEL' ? `${day.stops.length} stops` : 'Stay Day'}</span>
                          </div>
                      </div>
                      <div className="flex gap-6 text-sm">
                          {day.distance !== undefined && (
                              <span className="text-gray-600">{day.distance} km</span>
                          )}
                          {day.cost !== undefined && (
                              <span className="font-semibold text-gray-800">${day.cost}</span>
                          )}
                      </div>
                 </div>
             ))}
          </div>
      )}

      <div className="h-[400px] w-full relative">
        <RouteMap segments={segments} />
      </div>
    </div>
  );
};
