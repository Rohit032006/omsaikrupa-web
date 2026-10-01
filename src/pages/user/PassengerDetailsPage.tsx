import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, User } from 'lucide-react';
import { useBookingStore } from '../../store/bookingStore';

const passengerSchema = z.object({
  passengers: z.array(
    z.object({
      seatNumber: z.string(),
      name: z.string().min(2, 'Name must be at least 2 characters'),
      mobile: z.string().regex(/^[0-9]{10}$/, 'Must be a valid 10-digit mobile number'),
      age: z.string().optional(),
      gender: z.enum(['Male', 'Female', 'Other']),
      specialRequirement: z.string().optional(),
    })
  )
});

type PassengerFormValues = z.infer<typeof passengerSchema>;

export const PassengerDetailsPage: React.FC = () => {
  const navigate = useNavigate();
  const { selectedSeats, selectedVehicle, setPassengerDetails } = useBookingStore();

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isValid }
  } = useForm<PassengerFormValues>({
    resolver: zodResolver(passengerSchema),
    defaultValues: {
      passengers: selectedSeats.sort().map((seat, _index) => ({
        seatNumber: seat,
        name: '',
        mobile: '',
        age: '',
        gender: 'Male' as const,
        specialRequirement: '',
      }))
    },
    mode: 'onChange'
  });

  const { fields } = useFieldArray({
    name: 'passengers',
    control
  });

  useEffect(() => {
    if (selectedSeats.length === 0 || !selectedVehicle) {
      navigate('/search-vehicles');
    }
  }, [selectedSeats, selectedVehicle, navigate]);

  const onSubmit = (data: PassengerFormValues) => {
    // Cast age to number or undefined before saving to store if needed
    const formattedData = data.passengers.map(p => ({
      ...p,
      age: p.age === '' ? undefined : Number(p.age)
    }));
    
    setPassengerDetails(formattedData);
    navigate('/book/review');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center mb-8">
        <button 
          onClick={() => navigate('/book/seats')}
          className="mr-4 p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Passenger Details</h1>
          <p className="text-gray-600">Please provide details for all passengers</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {fields.map((field, index) => (
          <div key={field.id} className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center font-semibold text-gray-800">
                <User className="w-5 h-5 mr-2 text-orange-500" />
                Passenger {index + 1}
              </div>
              <div className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-bold">
                Seat: {field.seatNumber}
              </div>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    {...register(`passengers.${index}.name`)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                    placeholder="Enter full name"
                  />
                  {errors.passengers?.[index]?.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.passengers[index]?.name?.message}</p>
                  )}
                </div>

                {/* Mobile */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mobile Number <span className="text-red-500">*</span>
                  </label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500">
                      +91
                    </span>
                    <input
                      {...register(`passengers.${index}.mobile`)}
                      className="flex-1 w-full px-4 py-2 border border-gray-300 rounded-none rounded-r-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                      placeholder="10-digit mobile number"
                      maxLength={10}
                    />
                  </div>
                  {errors.passengers?.[index]?.mobile && (
                    <p className="mt-1 text-sm text-red-600">{errors.passengers[index]?.mobile?.message}</p>
                  )}
                </div>

                {/* Age & Gender */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
                    <input
                      type="number"
                      {...register(`passengers.${index}.age`)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                      placeholder="Years"
                    />
                    {errors.passengers?.[index]?.age && (
                      <p className="mt-1 text-sm text-red-600">{errors.passengers[index]?.age?.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Gender <span className="text-red-500">*</span>
                    </label>
                    <select
                      {...register(`passengers.${index}.gender`)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors bg-white"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                {/* Special Requirements */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Special Requirements (Optional)
                  </label>
                  <input
                    {...register(`passengers.${index}.specialRequirement`)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                    placeholder="e.g. Wheelchair access, extra luggage"
                  />
                </div>
              </div>
            </div>
          </div>
        ))}

        <div className="flex justify-end pt-4 pb-12">
          <button
            type="submit"
            className="bg-orange-600 text-white px-8 py-3 rounded-lg font-bold text-lg hover:bg-orange-700 transition-all shadow-md hover:shadow-lg disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Review Booking
          </button>
        </div>
      </form>
    </div>
  );
};

export default PassengerDetailsPage;
