import { useState } from 'react';
import { Navigation, Coffee, Trash2, Plus, GripVertical as GripIcon } from 'lucide-react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { StopPickerModal } from './StopPickerModal';
import type { Day, TripLocation, Stop } from '../types';
import { cn } from '../utils/cn';

interface TripDayEditorProps {
  day: Day;
  onUpdate: (day: Day) => void;
  onRemove: () => void;
  isFirstDay: boolean;
  previousDayEndLocation?: TripLocation;
}

const SortableStopItem = ({ stop, onEdit, onDelete }: { stop: Stop; onEdit: () => void; onDelete: () => void }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: stop.id });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-lg shadow-sm hover:shadow-md transition-all group">
         <div className="flex items-center gap-3">
             <div {...attributes} {...listeners} className="cursor-grab text-gray-300 hover:text-gray-500">
                <GripIcon className="w-5 h-5" />
             </div>
             <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 font-bold text-sm">
                {/* Dynamically numbered not easy in isolated component, use a dot or icon */}
                <span className="w-2 h-2 bg-amber-500 rounded-full" />
             </div>
             <div onClick={onEdit} className="cursor-pointer hover:underline cursor-pointer">
                 <h4 className="font-medium text-gray-800">{stop.name}</h4>
             </div>
         </div>
         <button onClick={onDelete} className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
            <Trash2 className="w-4 h-4" />
         </button>
    </div>
  );
};

export const TripDayEditor = ({ day, onUpdate, onRemove, isFirstDay, previousDayEndLocation }: TripDayEditorProps) => {
  const [isStopPickerOpen, setIsStopPickerOpen] = useState(false);
  const [editingStopIndex, setEditingStopIndex] = useState<number | null>(null); 
  const [editingType, setEditingType] = useState<'START' | 'END' | 'STOP'>('STOP');

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

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
      // STOP
      const newStop: Stop = { ...location, id: crypto.randomUUID() };
      const newStops = [...day.stops];
      
      // If we were editing an existing stop (not implemented in UI yet but good for logic)
      if (editingStopIndex !== null) {
        newStops[editingStopIndex] = newStop;
      } else {
         // Check constraint: Max 10 stops
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
    setEditingType(type);
    setEditingStopIndex(index);
    setIsStopPickerOpen(true);
  };

  // Determine effective start location
  const displayStartLocation = isFirstDay ? day.startLocation : (previousDayEndLocation || day.startLocation);

  const getHeaderIcon = () => {
        return (
            <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${day.type === 'TRAVEL' ? 'bg-blue-100 text-blue-600' : 'bg-amber-100 text-amber-600'}`}>
                    {day.type === 'TRAVEL' ? <Navigation className="w-5 h-5" /> : <Coffee className="w-5 h-5" />}
                </div>
                <h3 className="text-lg font-bold text-gray-800">Day {day.dayNo}</h3>
            </div>
        );
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden transition-all hover:shadow-md">
            {/* Header */}
            <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-b border-gray-100">
                <div className="flex items-center gap-4">
                    {getHeaderIcon()}
                    <div className="flex bg-white rounded-lg p-1 border border-gray-200 shadow-sm">
                        <button
                            onClick={() => onUpdate({ ...day, type: 'TRAVEL' })}
                            className={cn(
                                "px-3 py-1 text-sm font-medium rounded-md transition-colors",
                                day.type === 'TRAVEL' ? "bg-blue-50 text-blue-700" : "text-gray-500 hover:text-gray-700"
                            )}
                        >
                            Travel
                        </button>
                        <button
                            onClick={() => onUpdate({ ...day, type: 'STAY' })}
                            className={cn(
                                "px-3 py-1 text-sm font-medium rounded-md transition-colors",
                                day.type === 'STAY' ? "bg-amber-50 text-amber-700" : "text-gray-500 hover:text-gray-700"
                            )}
                        >
                            Stay
                        </button>
                    </div>
                </div>
                
                {!isFirstDay && (
                    <button 
                        onClick={onRemove}
                        className="text-gray-400 hover:text-red-500 transition-colors p-2 hover:bg-red-50 rounded-lg"
                        title="Remove Day"
                    >
                        <Trash2 className="w-5 h-5" />
                    </button>
                )}
            </div>
      {day.type === 'STAY' ? (
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex flex-col items-center justify-center text-center">
            <div className="bg-blue-100 p-3 rounded-full mb-3">
              <Coffee className="w-6 h-6 text-blue-600" />
            </div>
            <p className="font-medium text-blue-900">Stay Day at {displayStartLocation?.name || "Previous Location"}</p>
            <p className="text-sm text-blue-600 mt-1">Relax and enjoy your stay. No travel planned for today.</p>
            <div className="mt-4 text-xs text-gray-500 uppercase tracking-wide font-semibold">
              Standard Charge Applied
            </div>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
           {/* Start Location */}
           <div className="flex items-start gap-3">
              <div className="mt-1">
                 <div className="w-3 h-3 rounded-full bg-green-500 ring-4 ring-green-100" />
                 {/* Connector Line */}
                 <div className="w-0.5 h-full bg-gray-200 mx-auto mt-1 min-h-[40px]" />
              </div>
              <div className="flex-1">
                 <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Start Location</label>
                 {isFirstDay ? (
                   <button 
                     onClick={() => openPicker('START')}
                     className="w-full text-left p-3 rounded-lg border hover:border-blue-500 hover:bg-blue-50 transition-all group"
                   >
                     {day.startLocation ? (
                       <span className="font-medium text-gray-900">{day.startLocation.name}</span>
                     ) : (
                       <span className="text-gray-400 group-hover:text-blue-500">Select start location...</span>
                     )}
                   </button>
                 ) : (
                   <div className="p-3 rounded-lg border bg-gray-50 text-gray-600">
                      {displayStartLocation?.name || "Previous Day End"}
                   </div>
                 )}
              </div>
           </div>

           {/* Stops */}
           <div className="pl-0"> 
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
               <div className="flex items-start gap-3 mb-4">
                  <div className="mt-1 flex flex-col items-center">
                     <div className="w-2 h-2 rounded-full bg-blue-500/30" />
                     <div className="w-0.5 h-full bg-gray-200 mx-auto mt-1 min-h-[40px]" />
                  </div>
                  <div className="flex-1">
                      <button 
                        onClick={() => openPicker('STOP')}
                        className="flex items-center gap-2 text-sm text-blue-600 font-medium hover:text-blue-700 hover:bg-blue-50 px-3 py-2 rounded-lg transition-colors w-fit"
                      >
                        <Plus className="w-4 h-4" /> Add Stop
                      </button>
                  </div>
               </div>
           </div>

           {/* End Location */}
           <div className="flex items-start gap-3">
              <div className="mt-1">
                 <div className="w-3 h-3 rounded-full bg-red-500 ring-4 ring-red-100" />
              </div>
              <div className="flex-1">
                 <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Destination</label>
                 <button 
                     onClick={() => openPicker('END')}
                     className="w-full text-left p-3 rounded-lg border hover:border-blue-500 hover:bg-blue-50 transition-all group"
                   >
                     {day.endLocation ? (
                       <span className="font-medium text-gray-900">{day.endLocation.name}</span>
                     ) : (
                       <span className="text-gray-400 group-hover:text-blue-500">Select destination...</span>
                     )}
                   </button>
              </div>
           </div>
        </div>
      )}

      <StopPickerModal 
        isOpen={isStopPickerOpen}
        onClose={() => setIsStopPickerOpen(false)}
        onSelect={handleLocationSelect}
        initialLocation={day.stops[editingStopIndex as number]}
      />
    </div>
  );
};
