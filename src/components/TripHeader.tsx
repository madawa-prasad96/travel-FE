import React from 'react';
import { Users } from 'lucide-react';

interface TripHeaderProps {
  members: number;
  onMembersChange: (count: number) => void;
  tripName?: string; // Optional for now
}

export const TripHeader: React.FC<TripHeaderProps> = ({ members, onMembersChange, tripName = "New Trip" }) => {
  return (
    <div className="bg-white p-4 shadow-sm border-b sticky top-0 z-10">
      <div className="max-w-3xl mx-auto flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-800">{tripName}</h1>
        
        <div className="flex items-center space-x-2 bg-gray-50 px-3 py-1.5 rounded-full border">
          <Users className="w-4 h-4 text-gray-500" />
          <span className="text-sm text-gray-600 font-medium">Travelers:</span>
          <input
            type="number"
            min={1}
            max={50}
            value={members}
            onChange={(e) => onMembersChange(Math.max(1, parseInt(e.target.value) || 1))}
            className="w-12 bg-transparent text-center font-semibold focus:outline-none"
          />
        </div>
      </div>
    </div>
  );
};
