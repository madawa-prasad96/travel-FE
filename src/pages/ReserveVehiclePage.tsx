import { useState, useEffect } from 'react';
import { Calendar, Users, Car, MapPin, Clock, ChevronDown, Info, X, CheckCircle, Plus, Map as MapIcon, Loader2 } from 'lucide-react';
import { differenceInCalendarDays, format } from 'date-fns';
import { cn } from '../utils/cn';
import type { Trip, Day, TripLocation, MappedPoint, RouteSegment } from '../types';
import { TripHeader } from '../components/TripHeader';
import { TripDayEditor } from '../components/TripDayEditor';
import { TripRouteSummary } from '../components/TripRouteSummary';
import { api } from '../api/mock';

type BasisMode = 'date' | 'location';

// Available vehicle options
const VEHICLE_OPTIONS = [
  { value: '', label: 'Select a Vehicle' },
  { value: 'sedan', label: 'Sedan Car' },
  { value: 'van', label: 'Van' },
];

// Estimated daily rates (USD)
const DAILY_RATE: Record<string, number> = {
  sedan: 60,
  van: 95,
};

interface TourSummary {
  startDate: string;
  endDate: string;
  days: number;
  nights: number;
  travellers: number;
  vehicleLabel: string;
  vehicleKey: string;
  estimatedCost: number;
}

export const ReserveVehiclePage = () => {
  const [basis, setBasis] = useState<BasisMode>('date');
  const [travellers, setTravellers] = useState('');
  const [vehicle, setVehicle] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [startLocation, setStartLocation] = useState('');
  const [endLocation, setEndLocation] = useState('');
  const [summary, setSummary] = useState<TourSummary | null>(null);
  const [booked, setBooked] = useState(false);

  // Location basis states
  const [showPlanner, setShowPlanner] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [tripStartDate, setTripStartDate] = useState<string>('');
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

  // Derived: force Van when travellers > 3
  const travellersNum = parseInt(travellers, 10);
  const isVanForced = !isNaN(travellersNum) && travellersNum > 3;

  // Auto-select Van when forced; reset when condition is no longer met
  useEffect(() => {
    if (isVanForced) {
      setVehicle('van');
    } else if (vehicle === 'van' && travellersNum <= 3) {
      setVehicle('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isVanForced, travellersNum]);

  useEffect(() => {
    if (!isNaN(travellersNum)) {
      setTrip(prev => ({ ...prev, members: travellersNum }));
    }
  }, [travellersNum]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (basis === 'date') {
      const days = differenceInCalendarDays(new Date(endDate), new Date(startDate));
      const nights = Math.max(0, days - 1);
      const rate = DAILY_RATE[vehicle] ?? 60;
      const estimatedCost = rate * days;
      const vehicleLabel = VEHICLE_OPTIONS.find(o => o.value === vehicle)?.label ?? vehicle;
      setSummary({
        startDate,
        endDate,
        days,
        nights,
        travellers: travellersNum,
        vehicleLabel,
        vehicleKey: vehicle,
        estimatedCost,
      });
    } else {
      setShowPlanner(true);
    }
  };

  const handleBookNow = () => {
    setBooked(true);
    setTimeout(() => {
      setBooked(false);
      setSummary(null);
    }, 2500);
  };

  // Trip Management Logic (from TripPlanner.tsx)
  const handleDayUpdate = (dayIndex: number, updatedDay: Day) => {
    const newDays = [...trip.days];
    newDays[dayIndex] = updatedDay;
    setTrip({ ...trip, days: newDays });
  };

  const addDay = () => {
    const lastDay = trip.days[trip.days.length - 1];
    const newDayNo = lastDay.dayNo + 1;
    
    let startLoc: TripLocation | undefined;
    
    if (lastDay.type === 'TRAVEL') {
        startLoc = lastDay.endLocation;
    } else {
        startLoc = lastDay.startLocation; 
    }

    setTrip({
      ...trip,
      days: [
        ...trip.days,
        {
          dayNo: newDayNo,
          type: 'TRAVEL',
          startLocation: startLoc,
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
            dayNo: index + 1
        }));
    setTrip({ ...trip, days: newDays });
  };

  const getTripSegments = (): RouteSegment[] => {
      const segments: RouteSegment[] = [];
      const colors = ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#F43F5E', '#06B6D4'];

      trip.days.forEach((day, index) => {
          const points: MappedPoint[] = [];
          const isFirstDay = index === 0;

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
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">

      {/* ── Tour Summary Modal ── */}
      {summary && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">

            {/* Modal Header */}
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-8 py-6 text-center relative">
              <button
                onClick={() => setSummary(null)}
                className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
              <h2 className="text-2xl font-bold text-white tracking-wide">Tour Summary</h2>
              <p className="text-amber-100 text-sm mt-1">Review your booking details</p>
            </div>

            {/* Summary Rows */}
            <div className="px-8 py-6 space-y-0 divide-y divide-gray-100">
              {[
                {
                  label: 'Starting Date',
                  value: format(new Date(summary.startDate), 'dd MMM yyyy'),
                  icon: <Calendar className="w-4 h-4 text-amber-500" />,
                },
                {
                  label: 'Ending Date',
                  value: format(new Date(summary.endDate), 'dd MMM yyyy'),
                  icon: <Calendar className="w-4 h-4 text-amber-500" />,
                },
                {
                  label: 'Number of Days',
                  value: `${summary.days} day${summary.days !== 1 ? 's' : ''}`,
                  icon: <Clock className="w-4 h-4 text-amber-500" />,
                },
                {
                  label: 'Number of Nights',
                  value: `${summary.nights} night${summary.nights !== 1 ? 's' : ''}`,
                  icon: <Clock className="w-4 h-4 text-amber-500" />,
                },
                {
                  label: 'Number of Travellers',
                  value: summary.travellers,
                  icon: <Users className="w-4 h-4 text-amber-500" />,
                },
                {
                  label: 'Vehicle Type',
                  value: summary.vehicleLabel,
                  icon: <Car className="w-4 h-4 text-amber-500" />,
                },
                {
                  label: 'Estimated Cost (USD)',
                  value: `$${summary.estimatedCost.toLocaleString()}`,
                  icon: null,
                  highlight: true,
                },
              ].map(({ label, value, icon, highlight }) => (
                <div
                  key={label}
                  className={cn(
                    'flex items-center justify-between py-3.5',
                    highlight && 'bg-green-50 -mx-8 px-8 rounded-none'
                  )}
                >
                  <div className="flex items-center gap-2 text-gray-600 text-sm font-medium">
                    {icon}
                    {label}
                  </div>
                  <span
                    className={cn(
                      'font-semibold text-sm',
                      highlight ? 'text-green-600 text-base' : 'text-gray-800'
                    )}
                  >
                    {value}
                  </span>
                </div>
              ))}
            </div>

            {/* Rate note */}
            <p className="text-center text-xs text-gray-400 -mt-2 mb-1 px-8">
              Rate: ${DAILY_RATE[summary.vehicleKey] ?? 60}/day · {summary.days} day{summary.days !== 1 ? 's' : ''}
            </p>

            {/* Book Now Button */}
            <div className="px-8 pb-8 pt-4">
              <button
                id="bookNowBtn"
                onClick={handleBookNow}
                disabled={booked}
                className={cn(
                  'w-full py-3.5 rounded-2xl font-bold text-white text-base transition-all shadow-lg active:scale-95',
                  booked
                    ? 'bg-green-400 cursor-default'
                    : 'bg-green-500 hover:bg-green-600 hover:scale-[1.02] shadow-green-300'
                )}
              >
                {booked ? (
                  <span className="flex items-center justify-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    Booking Confirmed!
                  </span>
                ) : (
                  'Book Now'
                )}
              </button>
              <button
                onClick={() => setSummary(null)}
                className="w-full mt-3 py-2.5 text-sm text-gray-500 hover:text-gray-700 transition-colors font-medium"
              >
                ← Go Back &amp; Edit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Hero Banner ── */}
      <div className="relative overflow-hidden bg-gradient-to-r from-amber-500 to-orange-600 py-16 px-4">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-72 h-72 bg-white rounded-full translate-x-1/3 translate-y-1/3" />
        </div>
        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white text-sm font-medium px-4 py-1.5 rounded-full mb-4">
            <Car className="w-4 h-4" />
            Vehicle Reservation
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
            Reserve a Vehicle
          </h1>
          <p className="text-amber-100 text-lg max-w-xl mx-auto">
            Choose your preferred mode and book the perfect vehicle for your journey.
          </p>
        </div>
      </div>

      {/* ── Form Card ── */}
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="bg-white rounded-3xl shadow-2xl shadow-amber-100 overflow-hidden border border-amber-100">
          {/* Card Header */}
          <div className="px-8 pt-8 pb-6 border-b border-gray-100">
            <h2 className="text-2xl font-bold text-gray-800 mb-1">Reserve a Vehicle By</h2>
            <p className="text-gray-500 text-sm">Select your reservation basis below</p>

            {/* Toggle Tabs */}
            <div className="flex gap-3 mt-5">
              <button
                type="button"
                onClick={() => { setBasis('date'); setShowPlanner(false); }}
                className={cn(
                  'flex items-center gap-2 px-6 py-2.5 rounded-full font-semibold text-sm transition-all duration-200',
                  basis === 'date'
                    ? 'bg-amber-500 text-white shadow-lg shadow-amber-300'
                    : 'bg-gray-100 text-gray-500 hover:bg-amber-50 hover:text-amber-600'
                )}
              >
                <Clock className="w-4 h-4" />
                Date Basis
              </button>
              <button
                type="button"
                onClick={() => setBasis('location')}
                className={cn(
                  'flex items-center gap-2 px-6 py-2.5 rounded-full font-semibold text-sm transition-all duration-200',
                  basis === 'location'
                    ? 'bg-amber-500 text-white shadow-lg shadow-amber-300'
                    : 'bg-gray-100 text-gray-500 hover:bg-amber-50 hover:text-amber-600'
                )}
              >
                <MapPin className="w-4 h-4" />
                Location Basis
              </button>
            </div>
          </div>

          {/* Form Body */}
          <form onSubmit={handleSubmit} className="px-8 py-8">
            <div className={cn("grid grid-cols-1 gap-6", basis === 'date' ? "md:grid-cols-2" : "md:grid-cols-1 max-w-md mx-auto")}>

              {/* Left Column */}
              <div className="space-y-5">
                {/* Travellers */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                    <Users className="w-4 h-4 text-amber-500" />
                    Travellers
                    <span className="text-xs text-gray-400 font-normal ml-1">(1 – 7)</span>
                  </label>
                  <input
                    id="travellers"
                    type="number"
                    min={1}
                    max={7}
                    value={travellers}
                    onChange={e => setTravellers(e.target.value)}
                    placeholder="e.g. 3"
                    required
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all bg-gray-50 hover:bg-white"
                  />
                </div>

                {/* Vehicle */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                    <Car className="w-4 h-4 text-amber-500" />
                    Vehicle
                    <span className="text-xs text-gray-400 font-normal ml-1">(Sedan Car / Van)</span>
                  </label>

                  {/* Auto-forced Van notice */}
                  {isVanForced && (
                    <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 text-amber-700 text-xs rounded-lg px-3 py-2 mb-2">
                      <Info className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                      <span>Van is automatically selected for groups of more than 3 travellers.</span>
                    </div>
                  )}

                  <div className="relative">
                    <select
                      id="vehicle"
                      value={vehicle}
                      onChange={e => setVehicle(e.target.value)}
                      required
                      disabled={isVanForced}
                      className={cn(
                        'w-full px-4 py-3 border rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all appearance-none',
                        isVanForced
                          ? 'bg-amber-50 border-amber-200 text-amber-700 cursor-not-allowed opacity-80'
                          : 'border-gray-200 bg-gray-50 hover:bg-white cursor-pointer'
                      )}
                    >
                      {VEHICLE_OPTIONS.map(opt => (
                        <option key={opt.value} value={opt.value} disabled={opt.value === ''}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className={cn(
                      'absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none',
                      isVanForced ? 'text-amber-400' : 'text-gray-400'
                    )} />
                  </div>
                </div>
              </div>

              {/* Right Column */}
              {basis === 'date' && (
                <div className="space-y-5">
                  {/* Starting Date */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                      <Calendar className="w-4 h-4 text-amber-500" />
                      Starting Date
                    </label>
                    <input
                      id="startDate"
                      type="date"
                      value={startDate}
                      onChange={e => setStartDate(e.target.value)}
                      required
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all bg-gray-50 hover:bg-white cursor-pointer"
                    />
                  </div>

                  {/* Ending Date */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                      <Calendar className="w-4 h-4 text-amber-500" />
                      Ending Date
                    </label>
                    <input
                      id="endDate"
                      type="date"
                      value={endDate}
                      min={startDate}
                      onChange={e => setEndDate(e.target.value)}
                      required
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all bg-gray-50 hover:bg-white cursor-pointer"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Submit */}
            <div className="mt-8 flex justify-center">
              <button
                id="reserveSubmitBtn"
                type="submit"
                className="px-16 py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-base rounded-2xl shadow-lg shadow-amber-300 transition-all hover:scale-105 active:scale-95"
              >
                {basis === 'date' ? 'OK' : (showPlanner ? 'Update Reservation' : 'OK')}
              </button>
            </div>
          </form>
        </div>

        {/* ── Daily Route Planner (Location Basis) ── */}
        {basis === 'location' && showPlanner && (
          <div className="mt-12 space-y-8 animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="bg-white rounded-3xl p-8 shadow-xl border border-amber-100">
              <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <MapIcon className="w-6 h-6 text-amber-500" />
                Plan Your Daily Route
              </h3>
              
              <div className="space-y-6">
                {trip.days.map((day, index) => (
                  <TripDayEditor
                    key={day.dayNo} 
                    day={day}
                    onUpdate={(updated) => handleDayUpdate(index, updated)}
                    onRemove={() => removeDay(index)}
                    isFirstDay={index === 0}
                    previousDayEndLocation={getPreviousDayEnd(index)}
                    tripStartDate={tripStartDate}
                    onTripStartDateChange={index === 0 ? setTripStartDate : undefined}
                  />
                ))}
              </div>

              <div className="mt-6 flex justify-center">
                <button
                  onClick={addDay}
                  className="flex items-center gap-2 px-6 py-3 bg-white border border-dashed border-gray-300 rounded-xl text-gray-600 font-medium hover:border-amber-500 hover:text-amber-600 transition-all shadow-sm"
                >
                  <Plus className="w-5 h-5" /> Add Day {trip.days.length + 1}
                </button>
              </div>

              <div className="mt-10 pt-8 border-t flex flex-col items-center">
                <button
                  onClick={calculateRoute}
                  disabled={isCalculating}
                  className="flex items-center gap-2 px-10 py-4 bg-amber-500 text-white rounded-full font-bold shadow-lg shadow-amber-200 hover:bg-amber-600 disabled:opacity-70 disabled:cursor-not-allowed transition-all transform hover:scale-105"
                >
                  {isCalculating ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" /> Calculating...
                    </>
                  ) : (
                    <>
                      <MapIcon className="w-5 h-5" /> Preview Trip Route
                    </>
                  )}
                </button>

                {getTripSegments().some(s => s.points.length > 0) && (
                  <div className="w-full mt-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <TripRouteSummary segments={getTripSegments()} trip={trip} />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Info Cards */}
        {!showPlanner && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
            {[
              { icon: Car, title: 'Quality Vehicles', desc: 'Well-maintained fleet for a comfortable journey.' },
              { icon: Users, title: 'Up to 7 Travellers', desc: 'From solo trips to group adventures.' },
              { icon: CheckCircle, title: 'Easy Booking', desc: 'Quick and simple reservation process.' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-white rounded-2xl p-5 shadow-sm border border-amber-50 flex gap-4 items-start">
                <div className="bg-amber-50 p-2.5 rounded-xl shrink-0">
                  <Icon className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <p className="font-semibold text-gray-800 text-sm">{title}</p>
                  <p className="text-gray-500 text-xs mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
