import React, { useMemo } from 'react';

export interface SeatSelectorProps {
  capacity: number;
  bookedSeats: string[];
  reservedSeats: string[];
  selectedSeats: string[];
  maxSelectable: number;
  onToggleSeat: (seat: string) => void;
}

type SeatStatus = 'available' | 'selected' | 'booked' | 'reserved';
type SeatType = 'seat' | 'empty' | 'driver';

interface SeatConfig {
  id: string;
  type: SeatType;
  label?: string;
}

export const SeatSelector: React.FC<SeatSelectorProps> = ({
  capacity,
  bookedSeats,
  reservedSeats,
  selectedSeats,
  maxSelectable,
  onToggleSeat,
}) => {
  
  // Generate layout based on capacity
  const layout = useMemo(() => {
    const rows: SeatConfig[][] = [];
    
    // Front row with driver
    rows.push([
      { id: 'driver', type: 'driver', label: 'D' },
      { id: 'empty-front-1', type: 'empty' },
      { id: '01', type: 'seat', label: '1' }
    ]);
    
    let currentSeat = 2;
    
    if (capacity <= 5) {
      rows.push([
        { id: '02', type: 'seat', label: '2' },
        { id: '03', type: 'seat', label: '3' },
        { id: '04', type: 'seat', label: '4' },
      ]);
    } else if (capacity <= 7) {
      rows.push([
        { id: '02', type: 'seat', label: '2' },
        { id: 'empty-mid-1', type: 'empty' },
        { id: '03', type: 'seat', label: '3' },
      ]);
      rows.push([
        { id: '04', type: 'seat', label: '4' },
        { id: '05', type: 'seat', label: '5' },
        { id: '06', type: 'seat', label: '6' },
      ]);
    } else {
      // 14+ seater minibuses (typically 2-aisle-2 or 1-aisle-2)
      // Let's do a 2-aisle-2 setup for large capacity
      while (currentSeat <= capacity) {
        const row: SeatConfig[] = [];
        
        // Left side seats (up to 2)
        row.push({ id: currentSeat.toString().padStart(2, '0'), type: 'seat', label: currentSeat.toString() });
        currentSeat++;
        
        if (currentSeat <= capacity) {
          row.push({ id: currentSeat.toString().padStart(2, '0'), type: 'seat', label: currentSeat.toString() });
          currentSeat++;
        } else {
          row.push({ id: `empty-${currentSeat}`, type: 'empty' });
        }
        
        // Aisle
        row.push({ id: `aisle-${currentSeat}`, type: 'empty' });
        
        // Right side seats (up to 2)
        if (currentSeat <= capacity) {
          row.push({ id: currentSeat.toString().padStart(2, '0'), type: 'seat', label: currentSeat.toString() });
          currentSeat++;
        } else {
          row.push({ id: `empty-${currentSeat}`, type: 'empty' });
        }
        
        if (currentSeat <= capacity) {
          row.push({ id: currentSeat.toString().padStart(2, '0'), type: 'seat', label: currentSeat.toString() });
          currentSeat++;
        } else {
          row.push({ id: `empty-${currentSeat}`, type: 'empty' });
        }
        
        rows.push(row);
      }
    }
    
    return rows;
  }, [capacity]);

  const getSeatStatus = (seatId: string): SeatStatus => {
    if (bookedSeats.includes(seatId)) return 'booked';
    if (reservedSeats.includes(seatId)) return 'reserved';
    if (selectedSeats.includes(seatId)) return 'selected';
    return 'available';
  };

  const handleSeatClick = (seatId: string) => {
    const status = getSeatStatus(seatId);
    if (status === 'booked' || status === 'reserved') return;
    
    if (status === 'available' && selectedSeats.length >= maxSelectable) {
      alert(`You can only select up to ${maxSelectable} seats.`);
      return;
    }
    
    onToggleSeat(seatId);
  };

  const renderSeat = (seat: SeatConfig) => {
    if (seat.type === 'empty') {
      return <div key={seat.id} className="w-10 h-10 m-1"></div>;
    }

    if (seat.type === 'driver') {
      return (
        <div key={seat.id} className="w-10 h-10 m-1 rounded-lg bg-gray-300 text-gray-600 flex items-center justify-center font-bold text-xs cursor-not-allowed">
          {seat.label}
        </div>
      );
    }

    const status = getSeatStatus(seat.id);
    
    let seatClasses = "w-10 h-10 m-1 rounded-lg flex items-center justify-center font-bold text-sm transition-all duration-200 border-2 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500 ";
    
    switch (status) {
      case 'available':
        seatClasses += "bg-white border-green-500 text-green-700 hover:scale-110 hover:bg-green-50 cursor-pointer shadow-sm";
        break;
      case 'selected':
        seatClasses += "bg-blue-600 border-blue-600 text-white hover:scale-110 cursor-pointer shadow-md";
        break;
      case 'booked':
        seatClasses += "bg-red-100 border-red-300 text-red-500 cursor-not-allowed opacity-70";
        break;
      case 'reserved':
        seatClasses += "bg-orange-100 border-orange-300 text-orange-500 cursor-not-allowed opacity-70";
        break;
    }

    return (
      <button
        key={seat.id}
        onClick={() => handleSeatClick(seat.id)}
        disabled={status === 'booked' || status === 'reserved'}
        className={seatClasses}
        aria-label={`Seat ${seat.label}, Status: ${status}`}
        title={`Seat ${seat.label}`}
      >
        {seat.label}
      </button>
    );
  };

  return (
    <div className="flex flex-col items-center">
      {/* Vehicle Container */}
      <div className="bg-gray-50 border-4 border-gray-300 rounded-t-3xl rounded-b-lg p-6 shadow-inner relative max-w-sm w-full mx-auto">
        {/* Windshield indicator */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-2 bg-blue-200 rounded-b-full opacity-50"></div>
        
        {/* Steering wheel indicator */}
        <div className="absolute top-8 left-8 w-6 h-6 border-2 border-gray-400 rounded-full opacity-30"></div>

        <div className="flex flex-col items-center gap-2 mt-4">
          {layout.map((row, rowIndex) => (
            <div key={`row-${rowIndex}`} className="flex justify-center w-full">
              {row.map(seat => renderSeat(seat))}
            </div>
          ))}
        </div>
      </div>

      {/* Legend & Selection Status */}
      <div className="mt-8 w-full max-w-md">
        <div className="flex justify-between items-center mb-4 text-sm font-medium text-gray-700">
          <span>Selected: {selectedSeats.length} / {maxSelectable} seats</span>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="flex items-center">
            <div className="w-5 h-5 rounded bg-white border-2 border-green-500 mr-2"></div>
            <span>Available</span>
          </div>
          <div className="flex items-center">
            <div className="w-5 h-5 rounded bg-blue-600 mr-2"></div>
            <span>Selected</span>
          </div>
          <div className="flex items-center">
            <div className="w-5 h-5 rounded bg-red-100 border-2 border-red-300 mr-2"></div>
            <span>Booked</span>
          </div>
          <div className="flex items-center">
            <div className="w-5 h-5 rounded bg-orange-100 border-2 border-orange-300 mr-2"></div>
            <span>Reserved</span>
          </div>
        </div>
      </div>
    </div>
  );
};
