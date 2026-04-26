import { useState } from 'react';
import { Navigation, Coffee, Trash2, Plus, GripVertical as GripIcon, Calendar as CalendarIcon, Info, MapPin } from 'lucide-react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { format, addDays, parseISO } from 'date-fns';
import { StopPickerModal } from './StopPickerModal';
import type { Day, TripLocation, Stop } from '../types';
import { cn } from '../utils/cn';

const truncateText = (text: string, limit: number = 18) => {
  if (text.length <= limit) return text;
  return text.slice(0, limit) + '...';
};

interface TripDayEditorProps {
  day: Day;
  onUpdate: (day: Day) => void;
  onRemove: () => void;
  isFirstDay: boolean;
  previousDayEndLocation?: TripLocation;
  tripStartDate?: string;
  onTripStartDateChange?: (date: string) => void;
}

const SortableStopItem = ({ stop, onEdit, onDelete, disabled }: { stop: Stop; onEdit: () => void; onDelete: () => void; disabled?: boolean }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: stop.id, disabled });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} className={cn(
        "flex items-center justify-between md:p-4 p-3 bg-white border border-gray-100 rounded-lg shadow-sm transition-all group",
        disabled ? "opacity-60 grayscale-[0.5]" : "hover:shadow-md"
    )}>
         <div className="flex items-center gap-2 md:gap-3">
             <div {...attributes} {...listeners} className={cn("text-gray-300 hover:text-gray-500", !disabled && "cursor-grab")}>
                <GripIcon className="w-4 h-4 md:w-5 md:h-5" />
             </div>
             <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 font-bold text-xs md:text-sm">
                <span className="w-1.5 h-1.5 md:w-2 md:h-2 bg-amber-500 rounded-full" />
             </div>
             <div onClick={!disabled ? onEdit : undefined} className={cn("font-medium text-gray-800 text-sm md:text-base", !disabled && "cursor-pointer hover:underline")}>
                  {truncateText(stop.name)}
             </div>
         </div>
         {!disabled && (
            <button onClick={onDelete} className="text-gray-300 hover:text-red-500 md:opacity-0 group-hover:opacity-100 transition-opacity">
                <Trash2 className="w-4 h-4" />
            </button>
         )}
    </div>
  );
};

export const TripDayEditor = ({ day, onUpdate, onRemove, isFirstDay, previousDayEndLocation, tripStartDate, onTripStartDateChange }: TripDayEditorProps) => {
  const [isStopPickerOpen, setIsStopPickerOpen] = useState(false);
  const [editingStopIndex, setEditingStopIndex] = useState<number | null>(null); 
  const [editingType, setEditingType] = useState<'START' | 'END' | 'STOP'>('STOP');

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const currentDayDate = tripStartDate ? addDays(parseISO(tripStartDate), day.dayNo - 1) : null;
  const isDateMissing = isFirstDay && !tripStartDate;

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (active.id !== over?.id) {
      const oldIndex = day.stops.findIndex((s) => s.id === active.id);
      const newIndex = day.stops.findIndex((s) => s.id === over?.id);
      
      const newStops = arrayMove(day.stops, oldIndex, newIndex);
      onUpdate({ ...day, stops: newStops });
    }
  };

  const handleLocationSelect = (location: TripLocation) => {
    if (editingType === 'START') {
      onUpdate({ ...day, startLocation: location });
    } else if (editingType === 'END') {
      onUpdate({ ...day, endLocation: location });
    } else {
      const newStop: Stop = { ...location, id: crypto.randomUUID() };
      const newStops = [...day.stops];
      
      if (editingStopIndex !== null) {
        newStops[editingStopIndex] = newStop;
      } else {
         if (newStops.length >= 10) {
            alert("Max 10 stops allowed per day.");
            return;
         }
        newStops.push(newStop);
      }
      onUpdate({ ...day, stops: newStops });
    }
  };

  const removeStop = (index: number) => {
    const newStops = [...day.stops];
    newStops.splice(index, 1);
    onUpdate({ ...day, stops: newStops });
  };

  const openPicker = (type: 'START' | 'END' | 'STOP', index: number | null = null) => {
    if (isDateMissing) return;
    setEditingType(type);
    setEditingStopIndex(index);
    setIsStopPickerOpen(true);
  };

  const displayStartLocation = isFirstDay ? day.startLocation : (previousDayEndLocation || day.startLocation);

  return (
    <div className={cn(
        "bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden transition-all",
        !isDateMissing && "hover:shadow-md"
    )}>
      {/* Header */}
      <div className="bg-gray-50 md:px-6 px-4 py-3 md:py-4 border-b border-gray-100">
        <div className="flex items-center justify-between gap-3">
          {/* Left: Day & Date */}
          <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
            <div className="flex items-center gap-2 md:gap-3">
              <div className={cn(
                  "p-1.5 md:p-2 rounded-lg shrink-0",
                  day.type === 'TRAVEL' ? 'bg-blue-100 text-blue-600' : 'bg-amber-100 text-amber-600'
              )}>
                {day.type === 'TRAVEL' ? <Navigation className="w-4 h-4 md:w-5 md:h-5" /> : <Coffee className="w-4 h-4 md:w-5 md:h-5" />}
              </div>
              <h3 className="text-base md:text-lg font-bold text-gray-800 whitespace-nowrap">Day {day.dayNo}</h3>
            </div>
            
            {isFirstDay && onTripStartDateChange ? (
              <div className="bg-amber-50 text-amber-700 px-2 md:px-4 py-0.5 md:py-1.5 rounded md:rounded-xl text-[10px] md:text-sm font-bold border border-amber-200 flex items-center gap-1.5 shadow-sm w-fit">
                <CalendarIcon className="w-3 h-3 md:w-4 md:h-4 text-amber-500" />
                <input
                  type="date"
                  value={tripStartDate || ''}
                  onChange={(e) => onTripStartDateChange(e.target.value)}
                  className="outline-none bg-transparent text-amber-700 cursor-pointer font-bold w-20 md:w-auto"
                />
              </div>
            ) : (
              currentDayDate && (
                <div className="bg-white text-gray-700 px-2 md:px-4 py-0.5 md:py-1.5 rounded md:rounded-xl text-[10px] md:text-sm font-bold border border-gray-200 flex items-center gap-1.5 shadow-sm w-fit">
                  <CalendarIcon className="w-3 h-3 md:w-4 md:h-4 text-amber-500" />
                  {format(currentDayDate, 'dd MMM yyyy')}
                </div>
              )
            )}
          </div>

          {/* Right: Toggle & Delete */}
          <div className="flex flex-col items-end gap-1.5 md:gap-2 shrink-0">
            <div className="flex bg-white rounded-lg p-0.5 md:p-1 border border-gray-200 shadow-sm">
              <button
                onClick={() => onUpdate({ ...day, type: 'TRAVEL' })}
                className={cn(
                  "px-2 md:px-3 py-0.5 md:py-1 text-xs md:text-sm font-medium rounded-md transition-colors",
                  day.type === 'TRAVEL' ? "bg-blue-50 text-blue-700" : "text-gray-500 hover:text-gray-700"
                )}
              >
                Travel
              </button>
              <button
                onClick={() => onUpdate({ ...day, type: 'STAY' })}
                disabled={isFirstDay}
                className={cn(
                  "px-2 md:px-3 py-0.5 md:py-1 text-xs md:text-sm font-medium rounded-md transition-colors",
                  day.type === 'STAY' ? "bg-amber-50 text-amber-700" : "text-gray-500 hover:text-gray-700",
                  isFirstDay && "opacity-50 cursor-not-allowed grayscale"
                )}
                title={isFirstDay ? "Day 1 must be a Travel day" : ""}
              >
                Stay
              </button>
            </div>
            {!isFirstDay && (
              <button 
                onClick={onRemove}
                className="text-gray-400 hover:text-red-500 transition-colors flex items-center gap-1 px-1.5 py-0.5 hover:bg-red-50 rounded-md"
                title="Remove Day"
              >
                <Trash2 className="w-3.5 h-3.5 md:w-4 md:h-4" />
                <span className="text-[10px] md:text-xs font-bold uppercase tracking-wider">Delete</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {isDateMissing && (
        <div className="p-8 text-center bg-amber-50/50">
          <div className="bg-amber-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
            <Info className="w-6 h-6 text-amber-600" />
          </div>
          <p className="text-amber-800 font-semibold">Start Date Required</p>
          <p className="text-sm text-amber-600 mt-1">Please select the trip starting date above to begin planning your route.</p>
        </div>
      )}

      {!isDateMissing && (
        <div className="md:p-6 p-4">
          {day.type === 'STAY' ? (
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-5 md:p-6 flex flex-col items-center justify-center text-center">
              <div className="bg-blue-100 p-3 md:p-4 rounded-full mb-3">
                <Coffee className="w-6 h-6 md:w-8 md:h-8 text-blue-600" />
              </div>
              <p className="font-bold text-blue-900 text-base md:text-lg">Stay Day at {displayStartLocation?.name || "Previous Location"}</p>
              <p className="text-xs md:text-sm text-blue-600 mt-1">Relax and enjoy your stay. No travel planned for today.</p>
              <div className="mt-4 md:mt-6 text-[10px] md:text-xs text-gray-500 uppercase tracking-wide font-bold bg-white/50 px-3 md:px-4 py-1.5 rounded-full border border-blue-100">
                Vehicle Daily Charge Applies
              </div>
            </div>
          ) : (
            <div className="md:space-y-6 space-y-4">
              {/* Start Location */}
              <div className="flex items-start gap-3 md:gap-4">
                <div className="flex flex-col items-center h-full pt-1.5">
                  <div className="w-3 h-3 md:w-4 md:h-4 rounded-full bg-green-500 ring-2 md:ring-4 ring-green-100 shrink-0" />
                  <div className="w-0.5 h-full bg-gradient-to-b from-green-500 to-gray-200 min-h-[30px] md:min-h-[40px] mt-1" />
                </div>
                <div className="flex-1">
                  <label className="text-[9px] md:text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 block">Start Location</label>
                  {isFirstDay ? (
                    <button 
                      onClick={() => openPicker('START')}
                      className="w-full text-left px-4 md:px-5 py-2.5 md:py-4 rounded-lg md:rounded-xl border-2 border-dashed border-gray-200 hover:border-amber-400 hover:bg-amber-50/30 transition-all group relative overflow-hidden"
                    >
                      {day.startLocation ? (
                        <span className="font-bold text-gray-800 text-sm md:text-base flex items-center gap-2">
                           <MapPin className="w-3.5 h-3.5 md:w-4 md:h-4 text-amber-500 shrink-0" />
                           {truncateText(day.startLocation.name)}
                        </span>
                      ) : (
                        <span className="text-xs md:text-sm text-gray-400 group-hover:text-amber-600 font-medium truncate block">Select starting point...</span>
                      )}
                    </button>
                  ) : (
                    <div className="px-4 md:px-5 py-2.5 md:py-4 rounded-lg md:rounded-xl border border-gray-100 bg-gray-50 text-gray-700 font-semibold text-sm md:text-base flex items-center gap-2">
                       <MapPin className="w-3.5 h-3.5 md:w-4 md:h-4 text-gray-400 shrink-0" />
                       {truncateText(displayStartLocation?.name || "Previous Day End")}
                    </div>
                  )}
                </div>
              </div>

              {/* Stops */}
              <div className="md:space-y-4 space-y-3"> 
                <DndContext 
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext 
                      items={day.stops.map(s => s.id)}
                      strategy={verticalListSortingStrategy}
                  >
                      {day.stops.map((stop, index) => (
                          <SortableStopItem 
                              key={stop.id} 
                              stop={stop} 
                              onEdit={() => openPicker('STOP', index)}
                              onDelete={() => removeStop(index)}
                          />
                      ))}
                  </SortableContext>
                </DndContext>

                {/* Add Stop Button */}
                <div className="flex items-start gap-3 md:gap-4">
                  <div className="flex flex-col items-center h-full pt-1.5">
                    <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-amber-400 shrink-0" />
                    <div className="w-0.5 h-full bg-gray-200 min-h-[30px] md:min-h-[40px] mt-1" />
                  </div>
                  <div className="flex-1">
                      <button 
                        onClick={() => openPicker('STOP')}
                        className="flex items-center gap-1.5 md:gap-2 text-xs md:text-sm text-amber-600 font-bold hover:text-amber-700 hover:bg-amber-50 px-3 md:px-4 py-2 md:py-2.5 rounded-lg md:rounded-xl transition-all border border-transparent hover:border-amber-200 w-fit"
                      >
                        <Plus className="w-3.5 h-3.5 md:w-4 md:h-4" /> Add Stop
                      </button>
                  </div>
                </div>
              </div>

              {/* End Location */}
              <div className="flex items-start gap-3 md:gap-4">
                <div className="pt-1.5">
                  <div className="w-3 h-3 md:w-4 md:h-4 rounded-full bg-red-500 ring-2 md:ring-4 ring-red-100 shrink-0" />
                </div>
                <div className="flex-1">
                  <label className="text-[9px] md:text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 block">Destination</label>
                  <button 
                      onClick={() => openPicker('END')}
                      className="w-full text-left px-4 md:px-5 py-2.5 md:py-4 rounded-lg md:rounded-xl border-2 border-dashed border-gray-200 hover:border-amber-400 hover:bg-amber-50/30 transition-all group"
                    >
                      {day.endLocation ? (
                        <span className="font-bold text-gray-800 text-sm md:text-base flex items-center gap-2">
                           <MapPin className="w-3.5 h-3.5 md:w-4 md:h-4 text-red-500 shrink-0" />
                           {truncateText(day.endLocation.name)}
                        </span>
                      ) : (
                        <span className="text-xs md:text-sm text-gray-400 group-hover:text-amber-600 font-medium truncate block">Select destination...</span>
                      )}
                    </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      <StopPickerModal 
        isOpen={isStopPickerOpen}
        onClose={() => setIsStopPickerOpen(false)}
        onSelect={handleLocationSelect}
        initialLocation={editingStopIndex !== null ? day.stops[editingStopIndex] : undefined}
      />
    </div>
  );
};
