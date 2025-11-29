'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import GPSButton from '@/components/ui/GPSButton';
import { getGigTypeColor } from '@/lib/colors';
import type { GigFormData, Location, Language, SupplyType, GigType, UserType } from '@/types';

interface GigFormProps {
  lang?: Language;
  onSubmit: (data: GigFormData) => Promise<void>;
  defaultType?: GigType;
}

const SUPPLY_OPTIONS: { value: SupplyType; label: string; icon: string }[] = [
  { value: 'food', label: 'Food', icon: '🍚' },
  { value: 'water', label: 'Water', icon: '💧' },
  { value: 'clothes', label: 'Clothes', icon: '👕' },
  { value: 'medicine', label: 'Medicine', icon: '💊' },
  { value: 'blankets', label: 'Blankets', icon: '🛏️' },
  { value: 'toiletries', label: 'Toiletries', icon: '🧴' },
  { value: 'baby-items', label: 'Baby Items', icon: '👶' },
  { value: 'cooking-items', label: 'Cooking Items', icon: '🍳' },
  { value: 'cleaning-supplies', label: 'Cleaning Supplies', icon: '🧹' },
  { value: 'other', label: 'Other', icon: '📦' },
];

export default function GigForm({ lang = 'en', onSubmit, defaultType = 'donate' }: GigFormProps) {
  const [submitting, setSubmitting] = useState(false);
  const [location, setLocation] = useState<Location | null>(null);
  const [gigType, setGigType] = useState<GigType>(defaultType);

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<GigFormData>({
    defaultValues: {
      gig_type: defaultType,
      user_type: 'individual',
      supplies: [],
      quantity_description: '',
      description: '',
      can_deliver: false,
      pickup_available: false,
      preferred_contact: 'phone',
      location: null,
      area: '',
    },
  });

  // Update form when defaultType changes
  useEffect(() => {
    setGigType(defaultType);
    setValue('gig_type', defaultType);
  }, [defaultType, setValue]);

  const formData = watch();

  const handleLocationCapture = (loc: Location) => {
    setLocation(loc);
    setValue('location', loc);
  };

  const handleSupplyToggle = (supply: SupplyType, checked: boolean) => {
    const current = formData.supplies || [];
    if (checked) {
      setValue('supplies', [...current, supply]);
    } else {
      setValue('supplies', current.filter((s) => s !== supply));
    }
  };

  const onFormSubmit = async (data: GigFormData) => {
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
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {gigType === 'donate' ? 'I Want to Donate' : 'I Need Supplies'}
          </h2>
          
          {/* Gig Type Selection */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <button
              type="button"
              onClick={() => {
                setGigType('donate');
                setValue('gig_type', 'donate');
              }}
              className={`p-6 rounded-xl border-2 transition-all ${
                gigType === 'donate'
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-4xl mb-2">🎁</div>
              <div className="font-bold text-lg">I Want to Donate</div>
              <div className="text-sm text-gray-600">I have things to give</div>
            </button>
            
            <button
              type="button"
              onClick={() => {
                setGigType('collect');
                setValue('gig_type', 'collect');
              }}
              className={`p-6 rounded-xl border-2 transition-all ${
                gigType === 'collect'
                  ? 'border-orange-600 bg-orange-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-4xl mb-2">📋</div>
              <div className="font-bold text-lg">I Need Supplies</div>
              <div className="text-sm text-gray-600">I'm collecting for others</div>
            </button>
          </div>
        </div>

        {/* User Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Who are you? *
          </label>
          <div className="space-y-2">
            {(['individual', 'ngo', 'organization'] as UserType[]).map((type) => (
              <label
                key={type}
                className="flex items-center space-x-3 p-4 border-2 border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
              >
                <input
                  {...register('user_type', { required: true })}
                  type="radio"
                  value={type}
                  className="w-5 h-5 text-blue-600"
                />
                <span className="text-lg font-medium text-gray-700 capitalize">
                  {type === 'ngo' ? 'NGO' : type}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Basic Info */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Your Name / Organization Name *
          </label>
          <input
            {...register('name', { required: true })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
            placeholder={formData.user_type === 'individual' ? 'Your name' : 'Organization name'}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Phone Number *
          </label>
          <input
            {...register('phone', { required: true, pattern: /^[0-9]{10}$/ })}
            type="tel"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
            placeholder="07XXXXXXXX"
          />
        </div>

        {formData.user_type !== 'individual' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Organization Name
            </label>
            <input
              {...register('organization_name')}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
              placeholder="Your organization name"
            />
          </div>
        )}

        {/* Supplies */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            {gigType === 'donate' ? 'What can you donate?' : 'What supplies do you need?'} *
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {SUPPLY_OPTIONS.map((supply) => (
              <label
                key={supply.value}
                className={`flex flex-col items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  (formData.supplies || []).includes(supply.value)
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="checkbox"
                  checked={(formData.supplies || []).includes(supply.value)}
                  onChange={(e) => handleSupplyToggle(supply.value, e.target.checked)}
                  className="hidden"
                />
                <span className="text-3xl mb-2">{supply.icon}</span>
                <span className="text-sm font-medium text-center">{supply.label}</span>
              </label>
            ))}
          </div>
          {(formData.supplies || []).length === 0 && (
            <p className="text-red-600 text-sm mt-2">Please select at least one supply</p>
          )}
        </div>

        {/* Quantity */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {gigType === 'donate' ? 'How much can you give?' : 'How much do you need?'} *
          </label>
          <input
            {...register('quantity_description', { required: true })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
            placeholder="e.g., 50 packets of rice, 20 blankets, etc."
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Additional Details
          </label>
          <textarea
            {...register('description')}
            rows={3}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
            placeholder="Any other information..."
          />
        </div>

        {/* Location */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Your Location *
          </label>
          <input
            {...register('area', { required: true })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg mb-3"
            placeholder="Village/Town name"
          />
          <GPSButton onLocationCaptured={handleLocationCapture} />
          {location && (
            <p className="text-sm text-green-600 mt-2">✓ Location captured</p>
          )}
        </div>

        {/* Delivery/Pickup Options */}
        {gigType === 'donate' ? (
          <div>
            <label className="flex items-center space-x-3 p-4 border-2 border-gray-200 rounded-lg cursor-pointer">
              <input
                {...register('can_deliver')}
                type="checkbox"
                className="w-5 h-5 text-blue-600 rounded"
              />
              <span className="text-lg font-medium text-gray-700">I can deliver</span>
            </label>
            {formData.can_deliver && (
              <div className="mt-3">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  How far can you deliver? (km)
                </label>
                <input
                  {...register('delivery_radius', { valueAsNumber: true })}
                  type="number"
                  min="1"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            )}
          </div>
        ) : (
          <div>
            <label className="flex items-center space-x-3 p-4 border-2 border-gray-200 rounded-lg cursor-pointer">
              <input
                {...register('pickup_available')}
                type="checkbox"
                className="w-5 h-5 text-blue-600 rounded"
              />
              <span className="text-lg font-medium text-gray-700">People can come to pick up</span>
            </label>
          </div>
        )}

        {/* Contact Preference */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            How should people contact you? *
          </label>
          <select
            {...register('preferred_contact', { required: true })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
          >
            <option value="phone">Phone</option>
            <option value="email">Email</option>
            <option value="both">Both</option>
          </select>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={submitting || !location || (formData.supplies || []).length === 0}
          className="w-full px-6 py-4 text-white rounded-lg font-medium text-lg disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            backgroundColor: getGigTypeColor(gigType),
          }}
        >
          {submitting ? 'Submitting...' : gigType === 'donate' ? 'Post Donation' : 'Post Collection Request'}
        </button>
      </div>
    </form>
  );
}

