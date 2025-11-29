'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import GPSButton from '@/components/ui/GPSButton';
import type { HelperFormData, Location, Language } from '@/types';

interface HelperFormProps {
  lang?: Language;
  onSubmit: (data: HelperFormData) => Promise<void>;
}

const OFFERINGS = [
  { value: 'food', label: 'Food' },
  { value: 'water', label: 'Water' },
  { value: 'temporary-shelter', label: 'Temporary Shelter' },
  { value: 'transport', label: 'Transport' },
  { value: 'dry-rations', label: 'Dry Rations' },
  { value: 'cleanup-support', label: 'Cleanup Support' },
  { value: 'medicine-pickup', label: 'Medicine Pickup' },
  { value: 'charging-support', label: 'Charging Support' },
] as const;

export default function HelperForm({ lang = 'en', onSubmit }: HelperFormProps) {
  const [submitting, setSubmitting] = useState(false);
  const [location, setLocation] = useState<Location | null>(null);

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<HelperFormData>({
    defaultValues: {
      capacity: 1,
      radius_km: 5,
      available_times: {
        start: '08:00',
        end: '18:00',
        days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
      },
      offerings: [],
      location: null,
    },
  });

  const handleLocationCapture = (loc: Location) => {
    setLocation(loc);
    setValue('location', loc);
  };

  const handleOfferingsChange = (offering: string, checked: boolean) => {
    const currentOfferings = watch('offerings') || [];
    if (checked) {
      setValue('offerings', [...currentOfferings, offering as any]);
    } else {
      setValue('offerings', currentOfferings.filter((o) => o !== offering));
    }
  };

  const onFormSubmit = async (data: HelperFormData) => {
    setSubmitting(true);
    try {
      await onSubmit(data);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="max-w-2xl mx-auto">
      <div className="bg-white rounded-xl shadow-lg p-8 space-y-6">
        <h2 className="text-2xl font-bold mb-6">Register as a Helper</h2>

        {/* Basic Info */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Full Name *
          </label>
          <input
            {...register('name', { required: true })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter your full name"
          />
          {errors.name && <p className="text-red-600 text-sm mt-1">Name is required</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Phone Number *
          </label>
          <input
            {...register('phone', { required: true, pattern: /^[0-9]{10}$/ })}
            type="tel"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="07XXXXXXXX"
          />
          {errors.phone && <p className="text-red-600 text-sm mt-1">Valid phone number required</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email (Optional)
          </label>
          <input
            {...register('email')}
            type="email"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="your@email.com"
          />
        </div>

        {/* Offerings */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            What can you offer? *
          </label>
          <div className="grid grid-cols-2 gap-3">
            {OFFERINGS.map((offering) => (
              <label
                key={offering.value}
                className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
              >
                <input
                  type="checkbox"
                  value={offering.value}
                  onChange={(e) => handleOfferingsChange(offering.value, e.target.checked)}
                  className="w-5 h-5 text-blue-600 rounded"
                />
                <span className="text-sm font-medium text-gray-700">{offering.label}</span>
              </label>
            ))}
          </div>
          {watch('offerings')?.length === 0 && (
            <p className="text-red-600 text-sm mt-1">Please select at least one offering</p>
          )}
        </div>

        {/* Capacity */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Capacity (number of people or quantity) *
          </label>
          <input
            {...register('capacity', { required: true, min: 1, valueAsNumber: true })}
            type="number"
            min="1"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Radius */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            How far can you travel? (km) *
          </label>
          <input
            {...register('radius_km', { required: true, min: 1, valueAsNumber: true })}
            type="number"
            min="1"
            max="50"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p className="text-sm text-gray-500 mt-1">Maximum distance you can travel to help</p>
        </div>

        {/* Available Times */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Available Times
          </label>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-600 mb-1">Start Time</label>
              <input
                {...register('available_times.start')}
                type="time"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">End Time</label>
              <input
                {...register('available_times.end')}
                type="time"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Location */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Your Location *
          </label>
          <GPSButton onLocationCaptured={handleLocationCapture} />
          {location && (
            <p className="text-sm text-green-600 mt-2">
              ✓ Location captured: {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
            </p>
          )}
          {!location && (
            <p className="text-sm text-red-600 mt-2">Please capture your location</p>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={submitting || !location || (watch('offerings')?.length || 0) === 0}
          className="w-full px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? 'Submitting...' : 'Register as Helper'}
        </button>
      </div>
    </form>
  );
}

