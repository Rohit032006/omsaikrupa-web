import { create } from 'zustand';

export interface SearchParams {
  pickup: string;
  drop: string;
  travelDate: string;
  pickupTime: string;
  passengers: number;
  tripType: string;
  flightNumber: string;
  flightTime: string;
}

export interface BookingState extends SearchParams {
  // Selected vehicle
  selectedVehicle: any | null;
  // Created booking ID
  bookingId: string | null;
  bookingRef: string | null;

  // Selected seats
  selectedSeats: string[];

  // Passengers details
  passengerDetails: any[];

  // Computed
  searchParams: SearchParams;

  // Actions
  setSearchParams: (params: Partial<SearchParams>) => void;
  setSelectedVehicle: (vehicle: any) => void;
  toggleSeat: (seat: string) => void;
  setSelectedSeats: (seats: string[]) => void;
  setPassengerDetails: (details: any[]) => void;
  setBookingId: (id: string, ref?: string) => void;
  resetBooking: () => void;
  reset: () => void;
}

const todayStr = new Date().toISOString().split('T')[0];

const initialSearch: SearchParams = {
  pickup: 'Pune',
  drop: 'Mumbai',
  travelDate: todayStr,
  pickupTime: '09:00 AM',
  passengers: 1,
  tripType: 'LOCAL',
  flightNumber: '',
  flightTime: '',
};

const initialState = {
  ...initialSearch,
  selectedVehicle: null,
  bookingId: null,
  bookingRef: null,
  selectedSeats: [],
  passengerDetails: [],
};

export const useBookingStore = create<BookingState>((set, get) => ({
  ...initialState,

  searchParams: initialSearch,

  setSearchParams: (params) => set((state) => {
    const updatedSearch = {
      pickup: params.pickup ?? state.pickup,
      drop: params.drop ?? state.drop,
      travelDate: params.travelDate ?? state.travelDate,
      pickupTime: params.pickupTime ?? state.pickupTime,
      passengers: params.passengers ?? state.passengers,
      tripType: params.tripType ?? state.tripType,
      flightNumber: params.flightNumber ?? state.flightNumber,
      flightTime: params.flightTime ?? state.flightTime,
    };
    return {
      ...state,
      ...params,
      searchParams: updatedSearch,
    };
  }),

  setSelectedVehicle: (vehicle) => set({ selectedVehicle: vehicle, selectedSeats: [] }),

  toggleSeat: (seat) => {
    const { selectedSeats, passengers } = get();
    if (selectedSeats.includes(seat)) {
      set({ selectedSeats: selectedSeats.filter((s) => s !== seat) });
    } else {
      if (selectedSeats.length >= passengers) return;
      set({ selectedSeats: [...selectedSeats, seat] });
    }
  },

  setSelectedSeats: (seats) => set({ selectedSeats: seats }),

  setPassengerDetails: (details) => set({ passengerDetails: details }),

  setBookingId: (id: string, ref?: string) => set({ bookingId: id, bookingRef: ref || null }),

  resetBooking: () => set(initialState),

  reset: () => set(initialState),
}));
