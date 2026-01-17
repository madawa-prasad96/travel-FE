import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { GoogleMapsProvider } from './context/GoogleMapsContext';
import type { Trip, Day, TripLocation, MappedPoint, RouteSegment } from './types';
import { TripHeader } from './components/TripHeader';
import { TripDayEditor } from './components/TripDayEditor';
import { TripRouteSummary } from './components/TripRouteSummary';
import { Navbar } from './components/Navbar';
import { LandingPage } from './pages/LandingPage';
import { api } from './api/mock';
import { Plus, Map as MapIcon, Loader2 } from 'lucide-react';

// Extract TripPlanner Logic into its own component
const TripPlanner = () => {
  const [trip, setTrip] = useState<Trip>({
    id: crypto.randomUUID(),
    members: 2,
    days: [
      {
        dayNo: 1,
        type: 'TRAVEL',
        stops: []
      }
    ]
  });
  const [isCalculating, setIsCalculating] = useState(false);

  const handleDayUpdate = (dayIndex: number, updatedDay: Day) => {
    const newDays = [...trip.days];
    newDays[dayIndex] = updatedDay;
    setTrip({ ...trip, days: newDays });
  };

  const addDay = () => {
    const lastDay = trip.days[trip.days.length - 1];
    const newDayNo = lastDay.dayNo + 1;
    
    let startLocation: TripLocation | undefined;
    
    if (lastDay.type === 'TRAVEL') {
        startLocation = lastDay.endLocation;
    } else {
        startLocation = lastDay.startLocation; 
    }

    setTrip({
      ...trip,
      days: [
        ...trip.days,
        {
          dayNo: newDayNo,
          type: 'TRAVEL',
          startLocation: startLocation,
          stops: []
        }
      ]
    });
  };

  const removeDay = (indexToRemove: number) => {
    const newDays = trip.days
        .filter((_, index) => index !== indexToRemove)
        .map((day, index) => ({
            ...day,
            dayNo: index + 1 // Re-index days
        }));

    // Fix connection logic: ensure start locations align after removal
    // (This is a simplified fix, complex cases might need more manual adjustment)
    if (indexToRemove < newDays.length) {
       // logic to potentially auto-fix the now-shifted day's start location could go here
       // For now, we just re-index.
    }

    setTrip({ ...trip, days: newDays });
  };


  const getTripSegments = (): RouteSegment[] => {
      const segments: RouteSegment[] = [];
      const colors = ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#F43F5E', '#06B6D4']; // Palette

      trip.days.forEach((day, index) => {
          const points: MappedPoint[] = [];
          const isFirstDay = index === 0;
          const isLastDay = index === trip.days.length - 1;

          if (day.startLocation) {
              points.push({ 
                  location: day.startLocation, 
                  type: isFirstDay ? 'START' : 'STOP'
              });
          }

          day.stops.forEach(stop => {
              points.push({ location: stop, type: 'STOP' });
          });

          if (day.endLocation && day.type === 'TRAVEL') {
               // Mark end location as END only if it's the very last day? 
               // User asked: "each day destination should show in red marker"
               // So every day's endLocation is type 'END'.
               points.push({ 
                   location: day.endLocation, 
                   type: 'END' 
               });
          }

          if (points.length > 0) {
              segments.push({
                  points,
                  color: colors[index % colors.length]
              });
          }
      });

      return segments;
  };



  const calculateRoute = async () => {
    setIsCalculating(true);
    try {
      const result = await api.calculateTrip(trip);
      setTrip({
        ...trip,
        days: result.days,
        tripPolyline: result.tripPolyline,
        totalDistance: result.totalDistance,
        totalCost: result.totalCost
      } as Trip);
    } catch (error) {
      console.error("Calculation failed", error);
      alert("Failed to calculate route");
    } finally {
      setIsCalculating(false);
    }
  };

  const getPreviousDayEnd = (index: number): TripLocation | undefined => {
    if (index === 0) return undefined;
    const prevDay = trip.days[index - 1];
    if (prevDay.type === 'TRAVEL') return prevDay.endLocation;
    return prevDay.startLocation;
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <TripHeader 
        members={trip.members} 
        onMembersChange={(count) => setTrip({ ...trip, members: count })} 
      />

      <div className="space-y-6 mt-6">
        {trip.days.map((day, index) =>              <TripDayEditor
                key={day.dayNo} 
                day={day}
                onUpdate={(updated) => handleDayUpdate(index, updated)}
                onRemove={() => removeDay(index)}
                isFirstDay={index === 0}
                previousDayEndLocation={getPreviousDayEnd(index)}
              />
        )}
      </div>

      <div className="mt-6 flex justify-center">
        <button
          onClick={addDay}
          className="flex items-center gap-2 px-6 py-3 bg-white border border-dashed border-gray-300 rounded-lg text-gray-600 font-medium hover:border-blue-500 hover:text-blue-600 transition-all shadow-sm"
        >
          <Plus className="w-5 h-5" /> Add Day {trip.days.length + 1}
        </button>
      </div>

      <div className="mt-8 pt-8 border-t flex flex-col items-center pb-20">
          <button
            onClick={calculateRoute}
            disabled={isCalculating}
            className="flex items-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-full font-bold shadow-lg hover:bg-blue-700 disabled:opacity-70 disabled:cursor-not-allowed transition-all transform hover:scale-105"
          >
            {isCalculating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" /> Calculating Route...
              </>
            ) : (
              <>
                <MapIcon className="w-5 h-5" /> Preview Full Trip
              </>
            )}
          </button>
                    {getTripSegments().some(s => s.points.length > 0) && (
                <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
                  <TripRouteSummary segments={getTripSegments()} trip={trip} />
                </div>
             )}
          </div>
        </div>
  );
};

function App() {
  return (
    <GoogleMapsProvider>
      <Router>
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-900">
           <Navbar />
           <div className="flex-1">
             <Routes>
               <Route path="/" element={<LandingPage />} />
               <Route path="/plan" element={<TripPlanner />} />
               <Route path="*" element={<Navigate to="/" replace />} />
             </Routes>
           </div>
        </div>
      </Router>
    </GoogleMapsProvider>
  );
}

export default App;
