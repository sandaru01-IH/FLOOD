'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import FormSteps from './FormSteps';
import GPSButton from '@/components/ui/GPSButton';
import PhotoUpload from '@/components/ui/PhotoUpload';
import { calculateSeverityScore, getSeverityColor, getSeverityLabel } from '@/lib/severity-scoring';
import { getDistrictFromLocation } from '@/lib/geolocation';
import type { AssessmentFormData, Severity, Location, Language } from '@/types';

interface AssessmentFormProps {
  lang?: Language;
  onSubmit: (data: AssessmentFormData) => Promise<void>;
}

const STEPS = ['Basic Info', 'Damage', 'Special Needs', 'Location', 'Review'];

const DAMAGED_ITEMS = [
  { id: 'food', label: 'Food (stored rice, vegetables, etc.)' },
  { id: 'furniture', label: 'Furniture (chairs, tables, beds)' },
  { id: 'documents', label: 'Important Documents (ID, certificates)' },
  { id: 'electronics', label: 'Electronics (TV, phone, etc.)' },
  { id: 'clothes', label: 'Clothes' },
  { id: 'other', label: 'Other' },
];

export default function AssessmentForm({ lang = 'en', onSubmit }: AssessmentFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [severity, setSeverity] = useState<Severity>('Low');
  const [submitting, setSubmitting] = useState(false);
  const [location, setLocation] = useState<Location | null>(null);
  const [area, setArea] = useState<string>('');

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<AssessmentFormData>({
    defaultValues: {
      family_size: 1,
      water_inside: 'no',
      can_stay_home: 'yes',
      electricity_working: 'yes',
      damaged_items: [],
      has_elderly: false,
      has_children: false,
      has_sick_person: false,
      special_notes: '',
      photos: [],
      location: null,
      area: '',
    },
  });

  const formData = watch();

  // Calculate severity when form data changes
  useEffect(() => {
    const calculatedSeverity = calculateSeverityScore(formData);
    setSeverity(calculatedSeverity);
  }, [formData]);

  const handleLocationCapture = async (loc: Location) => {
    setLocation(loc);
    setValue('location', loc);
    const dist = await getDistrictFromLocation(loc);
    setArea(dist);
    setValue('area', dist);
  };

  const handlePhotosChange = (photos: File[]) => {
    setValue('photos', photos);
  };

  const handleDamagedItemsChange = (itemId: string, checked: boolean) => {
    const current = formData.damaged_items || [];
    if (checked) {
      setValue('damaged_items', [...current, itemId]);
    } else {
      setValue('damaged_items', current.filter(id => id !== itemId));
    }
  };

  const nextStep = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const onFormSubmit = async (data: AssessmentFormData) => {
    setSubmitting(true);
    try {
      await onSubmit(data);
    } finally {
      setSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1: // Basic Info
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Your Information</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Name *
              </label>
              <input
                {...register('name', { required: true })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                placeholder="Enter your name"
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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                placeholder="07XXXXXXXX"
              />
              {errors.phone && <p className="text-red-600 text-sm mt-1">Valid phone number required</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                How many people in your family? *
              </label>
              <input
                {...register('family_size', { required: true, min: 1, valueAsNumber: true })}
                type="number"
                min="1"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
              />
            </div>
          </div>
        );

      case 2: // Damage
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">What Happened to Your Home?</h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Is there water inside your home? *
              </label>
              <div className="space-y-2">
                {(['yes', 'no', 'partially'] as const).map((option) => (
                  <label key={option} className="flex items-center space-x-3 p-4 border-2 border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      {...register('water_inside', { required: true })}
                      type="radio"
                      value={option}
                      className="w-5 h-5 text-blue-600"
                    />
                    <span className="text-lg font-medium text-gray-700 capitalize">{option}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Can you stay in your home? *
              </label>
              <div className="space-y-2">
                {(['yes', 'no', 'unsure'] as const).map((option) => (
                  <label key={option} className="flex items-center space-x-3 p-4 border-2 border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      {...register('can_stay_home', { required: true })}
                      type="radio"
                      value={option}
                      className="w-5 h-5 text-blue-600"
                    />
                    <span className="text-lg font-medium text-gray-700 capitalize">{option}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Is electricity working? *
              </label>
              <div className="space-y-2">
                {(['yes', 'no', 'sometimes'] as const).map((option) => (
                  <label key={option} className="flex items-center space-x-3 p-4 border-2 border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      {...register('electricity_working', { required: true })}
                      type="radio"
                      value={option}
                      className="w-5 h-5 text-blue-600"
                    />
                    <span className="text-lg font-medium text-gray-700 capitalize">{option}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                What got damaged? (Select all that apply)
              </label>
              <div className="space-y-2">
                {DAMAGED_ITEMS.map((item) => (
                  <label
                    key={item.id}
                    className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={(formData.damaged_items || []).includes(item.id)}
                      onChange={(e) => handleDamagedItemsChange(item.id, e.target.checked)}
                      className="w-5 h-5 text-blue-600 rounded"
                    />
                    <span className="text-lg text-gray-700">{item.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg border-2" style={{ borderColor: getSeverityColor(severity) }}>
              <p className="text-sm text-gray-600 mb-2">Current Situation:</p>
              <p className="text-xl font-bold" style={{ color: getSeverityColor(severity) }}>
                {getSeverityLabel(severity, lang)}
              </p>
            </div>
          </div>
        );

      case 3: // Special Needs
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Special Needs</h2>
            <p className="text-gray-600">Tell us if you have any special needs in your family</p>
            
            <div className="space-y-4">
              <label className="flex items-center space-x-3 p-4 border-2 border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  {...register('has_elderly')}
                  type="checkbox"
                  className="w-6 h-6 text-blue-600 rounded"
                />
                <span className="text-lg font-medium text-gray-700">Elderly person (65+ years) in family</span>
              </label>

              <label className="flex items-center space-x-3 p-4 border-2 border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  {...register('has_children')}
                  type="checkbox"
                  className="w-6 h-6 text-blue-600 rounded"
                />
                <span className="text-lg font-medium text-gray-700">Children (under 12 years) in family</span>
              </label>

              <label className="flex items-center space-x-3 p-4 border-2 border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  {...register('has_sick_person')}
                  type="checkbox"
                  className="w-6 h-6 text-blue-600 rounded"
                />
                <span className="text-lg font-medium text-gray-700">Sick person or person with medical needs</span>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Any other urgent needs? (Optional)
              </label>
              <textarea
                {...register('special_notes')}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                placeholder="Tell us anything else we should know..."
              />
            </div>
          </div>
        );

      case 4: // Location
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Your Location</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Village/Town Name *
              </label>
              <input
                {...register('area', { required: true })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                placeholder="Enter your village or town name"
              />
              {errors.area && <p className="text-red-600 text-sm mt-1">Area is required</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                GPS Location *
              </label>
              <GPSButton onLocationCaptured={handleLocationCapture} />
              {location && (
                <p className="text-sm text-green-600 mt-2">
                  ✓ Location captured
                  {area && ` (${area})`}
                </p>
              )}
              {!location && (
                <p className="text-sm text-red-600 mt-2">Please capture your location</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Photos (Optional, max 3)
              </label>
              <PhotoUpload
                photos={formData.photos || []}
                onPhotosChange={handlePhotosChange}
              />
            </div>
          </div>
        );

      case 5: // Review
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Review Your Information</h2>
            <div className="bg-gray-50 p-6 rounded-lg space-y-4 text-lg">
              <div>
                <strong>Name:</strong> {formData.name}
              </div>
              <div>
                <strong>Phone:</strong> {formData.phone}
              </div>
              <div>
                <strong>Family Size:</strong> {formData.family_size} people
              </div>
              <div>
                <strong>Situation:</strong>{' '}
                <span style={{ color: getSeverityColor(severity), fontWeight: 'bold' }}>
                  {getSeverityLabel(severity, lang)}
                </span>
              </div>
              {location && (
                <div>
                  <strong>Location:</strong> {formData.area || 'Captured'}
                </div>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="max-w-2xl mx-auto">
      <FormSteps currentStep={currentStep} totalSteps={STEPS.length} steps={STEPS} />
      
      <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
        {renderStep()}
      </div>

      <div className="flex justify-between">
        <button
          type="button"
          onClick={prevStep}
          disabled={currentStep === 1}
          className="px-8 py-4 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed text-lg"
        >
          Back
        </button>
        {currentStep < STEPS.length ? (
          <button
            type="button"
            onClick={nextStep}
            className="px-8 py-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 text-lg"
          >
            Next
          </button>
        ) : (
          <button
            type="submit"
            disabled={submitting || !location}
            className="px-8 py-4 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-lg"
          >
            {submitting ? 'Submitting...' : 'Submit Report'}
          </button>
        )}
      </div>
    </form>
  );
}
