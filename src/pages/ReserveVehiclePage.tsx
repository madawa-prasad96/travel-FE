import { useState, useEffect, useRef } from 'react';
import { Calendar, Users, Car, MapPin, Clock, ChevronDown, Info, X, CheckCircle, Plus, Map as MapIcon, Loader2 } from 'lucide-react';
import { differenceInCalendarDays, format, addDays, parseISO } from 'date-fns';
import { cn } from '../utils/cn';
import type { Trip, Day, TripLocation, MappedPoint, RouteSegment } from '../types';
import { TripDayEditor } from '../components/TripDayEditor';
import { TripRouteSummary } from '../components/TripRouteSummary';
import { api } from '../api/mock';

type BasisMode = 'date' | 'location';

// Available vehicle options
const VEHICLE_OPTIONS = [
  { value: '', label: 'Select a Vehicle' },
  { value: 'sedan', label: 'Sedan Car' },
  { value: 'van', label: 'Van' },
  { value: 'minibus', label: 'Minibus' },
];

// Estimated daily rates (USD)
const DAILY_RATE: Record<string, number> = {
  sedan: 60,
  van: 95,
  minibus: 120,
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
  startLocationName?: string;
  endLocationName?: string;
  totalDistance?: number;
}

export const ReserveVehiclePage = () => {
  const [basis, setBasis] = useState<BasisMode>('date');
  const [travellers, setTravellers] = useState('');
  const [vehicle, setVehicle] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [summary, setSummary] = useState<TourSummary | null>(null);
  const [booked, setBooked] = useState(false);
  const [bookingStep, setBookingStep] = useState(1);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [country, setCountry] = useState('');
  const [email, setEmail] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState<{ firstName?: string; lastName?: string; country?: string; fullName?: string; email?: string; whatsapp?: string; message?: string }>({});
  const firstNameRef = useRef<HTMLInputElement>(null);
  const lastNameRef = useRef<HTMLInputElement>(null);
  const countryRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const whatsappRef = useRef<HTMLInputElement>(null);
  const messageRef = useRef<HTMLTextAreaElement>(null);
  const today = format(new Date(), 'yyyy-MM-dd');

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

  const validateEmail = (emailStr: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(emailStr);
  };

  const handleBookNow = () => {
    if (bookingStep === 1) {
      setBookingStep(2);
      return;
    }

    // Step 2 validation
    const newErrors: { firstName?: string; lastName?: string; country?: string; email?: string; whatsapp?: string; message?: string } = {};
    let firstErrorField: string | null = null;

    // Validate First Name
    if (!firstName.trim()) {
      newErrors.firstName = 'First name is required';
      if (!firstErrorField) firstErrorField = 'firstName';
    }

    // Validate Last Name
    if (!lastName.trim()) {
      newErrors.lastName = 'Last name is required';
      if (!firstErrorField) firstErrorField = 'lastName';
    }

    // Validate Country
    if (!country.trim()) {
      newErrors.country = 'Country is required';
      if (!firstErrorField) firstErrorField = 'country';
    }

    // Validate Email
    if (!email.trim()) {
      newErrors.email = 'Email is required';
      if (!firstErrorField) firstErrorField = 'email';
    } else if (!validateEmail(email)) {
      newErrors.email = 'Please enter a valid email format';
      if (!firstErrorField) firstErrorField = 'email';
    }

    // Validate WhatsApp
    if (!whatsapp.trim()) {
      newErrors.whatsapp = 'WhatsApp number is required';
      if (!firstErrorField) firstErrorField = 'whatsapp';
    }

    // Validate Message
    if (!message.trim()) {
      newErrors.message = 'Message is required';
      if (!firstErrorField) firstErrorField = 'message';
    }

    // If there are errors, set them and scroll to first error field
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setTimeout(() => {
        let targetRef: HTMLInputElement | HTMLTextAreaElement | null = null;
        if (firstErrorField === 'firstName') targetRef = firstNameRef.current;
        else if (firstErrorField === 'lastName') targetRef = lastNameRef.current;
        else if (firstErrorField === 'country') targetRef = countryRef.current;
        else if (firstErrorField === 'email') targetRef = emailRef.current;
        else if (firstErrorField === 'whatsapp') targetRef = whatsappRef.current;
        else if (firstErrorField === 'message') targetRef = messageRef.current;

        if (targetRef) {
          targetRef.scrollIntoView({ behavior: 'smooth', block: 'center' });
          targetRef.focus();
        }
      }, 100);
      return;
    }

    // Clear errors if validation passes
    setErrors({});

    setBooked(true);
    setTimeout(() => {
      setBooked(false);
      setSummary(null);
      setBookingStep(1);
      setFirstName('');
      setLastName('');
      setCountry('');
      setEmail('');
      setWhatsapp('');
      setMessage('');
    }, 1000);
  };

  const handleReset = () => {
    setFirstName('');
    setLastName('');
    setCountry('');
    setEmail('');
    setWhatsapp('');
    setMessage('');
    setErrors({});
  };

  const getVehicleImage = (vehicleKey: string) => {
    switch (vehicleKey) {
      case 'sedan':
        return '/sedan.jpg';
      case 'van':
        return '/van.png';
      case 'minibus':
        return '/minibus.png';
      default:
        // Use a data URL placeholder to avoid infinite requests
        return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEyMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEyMCIgZmlsbD0iI2Y5ZmFmYiIvPjx0ZXh0IHg9IjEwMCIgeT0iNjAiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5YTNhZiIgdGV4dC1hbmNob3I9Im1pZGRsZSI+VmVoaWNsZSBJbWFnZTwvdGV4dD48L3N2Zz4=';
    }
  };

  const handleShowLocationSummary = () => {
    const daysCount = trip.days.length;
    const nights = Math.max(0, daysCount - 1);
    const vehicleLabel = VEHICLE_OPTIONS.find(o => o.value === vehicle)?.label ?? vehicle;

    let tripEndDate = '';
    if (tripStartDate) {
      tripEndDate = format(addDays(parseISO(tripStartDate), daysCount - 1), 'yyyy-MM-dd');
    }

    const startLoc = trip.days[0].startLocation?.name || 'N/A';
    const lastDay = trip.days[daysCount - 1];
    const endLoc = (lastDay.type === 'TRAVEL' ? lastDay.endLocation?.name : lastDay.startLocation?.name) || 'N/A';

    setSummary({
      startDate: tripStartDate,
      endDate: tripEndDate,
      days: daysCount,
      nights,
      travellers: travellersNum,
      vehicleLabel,
      vehicleKey: vehicle,
      estimatedCost: trip.totalCost || 0,
      startLocationName: startLoc,
      endLocationName: endLoc,
      totalDistance: trip.totalDistance,
    });
  };

  const getPreviousDayEnd = (index: number): TripLocation | undefined => {
    if (index === 0) return undefined;
    const prevDay = trip.days[index - 1];
    if (prevDay.type === 'TRAVEL') return prevDay.endLocation;
    return prevDay.startLocation;
  };

  // Auto-calculate route when trip changes (stabilized to avoid infinite loops)
  const tripInputKey = JSON.stringify(trip.days.map(d => ({
    type: d.type,
    start: d.startLocation,
    end: d.endLocation,
    stops: d.stops.map(s => ({ lat: s.lat, lng: s.lng }))
  }))) + tripStartDate + basis + showPlanner;

  const lastCalculatedKeyRef = useRef<string>('');

  useEffect(() => {
    if (basis === 'location' && showPlanner && tripStartDate && !isCalculating) {
      if (tripInputKey !== lastCalculatedKeyRef.current) {
        lastCalculatedKeyRef.current = tripInputKey;
        calculateRoute();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tripInputKey, isCalculating]);

  // Trip Management Logic (from TripPlanner.tsx)
  const handleDayUpdate = (dayIndex: number, updatedDay: Day) => {
    const previousDay = trip.days[dayIndex];

    // If user manually switched from STAY to TRAVEL, clear the endLocation and stops
    if (previousDay.type === 'STAY' && updatedDay.type === 'TRAVEL') {
      updatedDay.endLocation = undefined;
      updatedDay.stops = [];
    }

    // Auto-STAY logic: same start/end and no stops
    if (updatedDay.type === 'TRAVEL' && updatedDay.startLocation && updatedDay.endLocation) {
      const isSame = updatedDay.startLocation.lat === updatedDay.endLocation.lat &&
        updatedDay.startLocation.lng === updatedDay.endLocation.lng;
      if (isSame && updatedDay.stops.length === 0) {
        updatedDay.type = 'STAY';
      }
    }

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



  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">

      {/* ── Tour Summary Modal ── */}
      {summary && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">

            {/* Modal Header */}
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-8 py-6 text-center relative shrink-0">
              <button
                onClick={() => {
                  setSummary(null);
                  setBookingStep(1);
                  setFirstName('');
                  setLastName('');
                  setCountry('');
                  setEmail('');
                  setWhatsapp('');
                  setMessage('');
                  setErrors({});
                  setBooked(false);
                }}
                className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
              <h2 className="text-2xl font-bold text-white tracking-wide">
                {bookingStep === 1 ? 'Tour Summary' : 'Book a Vehicle'}
              </h2>
              <p className="text-amber-100 text-sm mt-1">
                {bookingStep === 1 ? 'Review your booking details' : 'Complete your booking information'}
              </p>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto">
              {bookingStep === 1 ? (
              <div className="px-8 py-6 space-y-0 divide-y divide-gray-100">
              {[
                {
                  label: summary.startLocationName ? 'Starting Date & Location' : 'Starting Date',
                  value: `${format(new Date(summary.startDate), 'dd MMM yyyy')}${summary.startLocationName ? ` - ${summary.startLocationName}` : ''}`,
                  icon: <Calendar className="w-4 h-4 text-amber-500" />,
                },
                {
                  label: summary.endLocationName ? 'Ending Date & Location' : 'Ending Date',
                  value: `${format(new Date(summary.endDate), 'dd MMM yyyy')}${summary.endLocationName ? ` - ${summary.endLocationName}` : ''}`,
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
                  label: 'Total Distance (km)',
                  value: summary.totalDistance ? `${summary.totalDistance.toLocaleString()} km` : 'N/A',
                  icon: <MapPin className="w-4 h-4 text-amber-500" />,
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
            ) : (
                /* Step 2: Two Column Layout */
                <div className="flex flex-col lg:flex-row min-h-0">
                  {/* Left Side: Summary + Vehicle Image */}
                  <div className="lg:w-1/2 p-6 border-r border-gray-100">
                    {/* Summary */}
                    <div className="space-y-3 mb-6">
                      <h3 className="text-lg font-bold text-gray-800 mb-4">Booking Summary</h3>
                      {[
                        {
                          label: 'Starting Date',
                          value: format(new Date(summary.startDate), 'dd MMM yyyy'),
                        },
                        {
                          label: 'Ending Date',
                          value: format(new Date(summary.endDate), 'dd MMM yyyy'),
                        },
                        {
                          label: 'Duration',
                          value: `${summary.days} day${summary.days !== 1 ? 's' : ''}`,
                        },
                        {
                          label: 'Travellers',
                          value: summary.travellers,
                        },
                        {
                          label: 'Vehicle',
                          value: summary.vehicleLabel,
                        },
                        {
                          label: 'Total Cost',
                          value: `$${summary.estimatedCost.toLocaleString()}`,
                        },
                      ].map(({ label, value }) => (
                        <div key={label} className="flex justify-between items-center py-2 border-b border-gray-100">
                          <span className="text-gray-600 text-sm">{label}</span>
                          <span className="font-semibold text-gray-800 text-sm">{value}</span>
                        </div>
                      ))}
                    </div>

                    {/* Vehicle Image */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="text-sm font-semibold text-gray-700 mb-3">Selected Vehicle</h4>
                      <div className="aspect-video bg-white rounded-lg overflow-hidden border border-gray-200">
                        <img
                          src={getVehicleImage(summary.vehicleKey)}
                          alt={summary.vehicleLabel}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = '/car-placeholder.jpg';
                          }}
                        />
                      </div>
                      <p className="text-center text-sm text-gray-600 mt-2">{summary.vehicleLabel}</p>
                    </div>
                  </div>

                  {/* Right Side: Form Fields */}
                  <div className="lg:w-1/2 p-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Contact Information</h3>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-semibold text-gray-600 uppercase">First Name *</label>
                          <input
                            ref={firstNameRef}
                            type="text"
                            value={firstName}
                            onChange={(e) => {
                              setFirstName(e.target.value);
                              if (errors.firstName) setErrors({ ...errors, firstName: undefined });
                            }}
                            placeholder="Enter first name"
                            className={cn(
                              "w-full mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:border-amber-500 outline-none text-sm transition-colors",
                              errors.firstName
                                ? "border-red-500 focus:ring-red-500 bg-red-50"
                                : "border-gray-300 focus:ring-amber-500"
                            )}
                          />
                          {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
                        </div>

                        <div>
                          <label className="text-xs font-semibold text-gray-600 uppercase">Last Name *</label>
                          <input
                            ref={lastNameRef}
                            type="text"
                            value={lastName}
                            onChange={(e) => {
                              setLastName(e.target.value);
                              if (errors.lastName) setErrors({ ...errors, lastName: undefined });
                            }}
                            placeholder="Enter last name"
                            className={cn(
                              "w-full mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:border-amber-500 outline-none text-sm transition-colors",
                              errors.lastName
                                ? "border-red-500 focus:ring-red-500 bg-red-50"
                                : "border-gray-300 focus:ring-amber-500"
                            )}
                          />
                          {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
                        </div>
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-gray-600 uppercase">Country *</label>
                        <input
                          ref={countryRef}
                          type="text"
                          value={country}
                          onChange={(e) => {
                            setCountry(e.target.value);
                            if (errors.country) setErrors({ ...errors, country: undefined });
                          }}
                          placeholder="Enter your country"
                          className={cn(
                            "w-full mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:border-amber-500 outline-none text-sm transition-colors",
                            errors.country
                              ? "border-red-500 focus:ring-red-500 bg-red-50"
                              : "border-gray-300 focus:ring-amber-500"
                          )}
                        />
                        {errors.country && <p className="text-red-500 text-xs mt-1">{errors.country}</p>}
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-gray-600 uppercase">Email *</label>
                        <input
                          ref={emailRef}
                          type="email"
                          value={email}
                          onChange={(e) => {
                            setEmail(e.target.value);
                            if (errors.email) setErrors({ ...errors, email: undefined });
                          }}
                          placeholder="Enter your email"
                          className={cn(
                            "w-full mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:border-amber-500 outline-none text-sm transition-colors",
                            errors.email
                              ? "border-red-500 focus:ring-red-500 bg-red-50"
                              : "border-gray-300 focus:ring-amber-500"
                          )}
                        />
                        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-gray-600 uppercase">WhatsApp Number *</label>
                        <input
                          ref={whatsappRef}
                          type="tel"
                          value={whatsapp}
                          onChange={(e) => {
                            setWhatsapp(e.target.value);
                            if (errors.whatsapp) setErrors({ ...errors, whatsapp: undefined });
                          }}
                          placeholder="Enter your WhatsApp number"
                          className={cn(
                            "w-full mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:border-amber-500 outline-none text-sm transition-colors",
                            errors.whatsapp
                              ? "border-red-500 focus:ring-red-500 bg-red-50"
                              : "border-gray-300 focus:ring-amber-500"
                          )}
                        />
                        {errors.whatsapp && <p className="text-red-500 text-xs mt-1">{errors.whatsapp}</p>}
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-gray-600 uppercase">Message *</label>
                        <textarea
                          ref={messageRef}
                          value={message}
                          onChange={(e) => {
                            setMessage(e.target.value);
                            if (errors.message) setErrors({ ...errors, message: undefined });
                          }}
                          placeholder="Enter your message"
                          className={cn(
                            "w-full mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:border-amber-500 outline-none text-sm resize-none h-24 transition-colors",
                            errors.message
                              ? "border-red-500 focus:ring-red-500 bg-red-50"
                              : "border-gray-300 focus:ring-amber-500"
                          )}
                        />
                        {errors.message && <p className="text-red-500 text-xs mt-1">{errors.message}</p>}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Rate note - only show in step 1 */}
              {bookingStep === 1 && (
                <p className="text-center text-xs text-gray-400 -mt-2 mb-4 px-8 pt-2">
                  Rate: ${DAILY_RATE[summary.vehicleKey] ?? 60}/day · {summary.days} day{summary.days !== 1 ? 's' : ''}
                </p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="px-8 pb-8 pt-4 shrink-0 border-t border-gray-100">
              {bookingStep === 1 ? (
                <button
                  onClick={handleBookNow}
                  className="w-full py-3.5 rounded-2xl font-bold text-white text-base transition-all bg-amber-500 hover:bg-amber-600 hover:scale-[1.02] shadow-lg shadow-amber-300"
                >
                  Next
                </button>
              ) : (
                <div className="flex gap-3">
                  <button
                    onClick={handleReset}
                    className="flex-1 py-3.5 rounded-2xl font-bold text-gray-700 text-base transition-all border border-gray-300 hover:bg-gray-50"
                  >
                    Reset
                  </button>
                  <button
                    id="bookNowBtn"
                    onClick={handleBookNow}
                    disabled={booked}
                    className={cn(
                      'flex-1 py-3.5 rounded-2xl font-bold text-white text-base transition-all shadow-lg active:scale-95',
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
                      'Submit'
                    )}
                  </button>
                </div>
              )}

              <button
                onClick={() => {
                  if (bookingStep === 2) {
                    setBookingStep(1);
                  } else {
                    setSummary(null);
                    setBookingStep(1);
                    setFirstName('');
                    setLastName('');
                    setCountry('');
                    setEmail('');
                    setWhatsapp('');
                    setMessage('');
                    setErrors({});
                    setBooked(false);
                  }
                }}
                className="w-full mt-3 py-2.5 text-sm text-gray-500 hover:text-gray-700 transition-colors font-medium"
              >
                ← {bookingStep === 2 ? 'Back' : 'Go Back & Edit'}
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
      <div className="max-w-3xl mx-auto px-1 md:px-4 py-12">
        <div className="bg-white rounded-3xl shadow-2xl shadow-amber-100 overflow-hidden border border-amber-100">
          {/* Card Header */}
          <div className="px-3 md:px-8 pt-8 pb-6 border-b border-gray-100">
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
          <form onSubmit={handleSubmit} className="px-3 md:px-8 py-8">
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
                      min={today}
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
                      min={startDate ? format(addDays(parseISO(startDate), 1), 'yyyy-MM-dd') : today}
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
            <div className="bg-white rounded-3xl p-2 md:p-8 shadow-xl border border-amber-100">
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

              <div className="mt-6 flex flex-col items-center gap-3">
                {(() => {
                  const lastDay = trip.days[trip.days.length - 1];
                  const isDay1 = trip.days.length === 1;
                  const isLastDayComplete =
                    tripStartDate && (
                      (lastDay.type === 'TRAVEL' && (isDay1 ? !!lastDay.startLocation : true) && !!lastDay.endLocation) ||
                      (lastDay.type === 'STAY')
                    );

                  return (
                    <>
                      <button
                        onClick={addDay}
                        disabled={!isLastDayComplete}
                        className={cn(
                          "flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all shadow-sm border",
                          isLastDayComplete
                            ? "bg-white border-dashed border-amber-300 text-amber-600 hover:border-amber-500 hover:bg-amber-50"
                            : "bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed"
                        )}
                      >
                        <Plus className="w-5 h-5" /> Add Day {trip.days.length + 1}
                      </button>
                      {!isLastDayComplete && (
                        <p className="text-xs text-amber-600 font-medium flex items-center gap-1">
                          <Info className="w-3.5 h-3.5" />
                          Fill Day {trip.days.length} details to add next day
                        </p>
                      )}
                    </>
                  );
                })()}
              </div>

              <div className="mt-10 flex flex-col items-center">
                {trip.totalCost !== undefined && trip.totalCost > 0 && !isCalculating && (
                  <button
                    type="button"
                    onClick={handleShowLocationSummary}
                    className="mb-8 px-10 py-4 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold rounded-2xl shadow-xl shadow-amber-200 hover:shadow-2xl hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-3 group animate-in zoom-in-95 duration-300"
                  >
                    {/* <div className="bg-white/20 p-1.5 rounded-lg group-hover:rotate-12 transition-transform">
                      <CheckCircle className="w-5 h-5" />
                    </div> */}
                    <span className="text-lg">OK</span>
                  </button>
                )}

                <div className="w-full pt-8 border-t flex flex-col items-center">
                  {isCalculating && (
                    <div className="flex items-center gap-2 text-amber-600 font-medium mb-4">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Updating route...
                    </div>
                  )}

                  {getTripSegments().some(s => s.points.length >= 2) && (
                    <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
                      <TripRouteSummary segments={getTripSegments()} trip={trip} />
                    </div>
                  )}
                </div>
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
