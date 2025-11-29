'use client';

import { useState } from 'react';
import type { Severity } from '@/types';

interface MapFiltersProps {
  onFiltersChange: (filters: {
    severity?: Severity[];
    needs?: string[];
    verified?: boolean;
    district?: string;
  }) => void;
}

const SEVERITY_OPTIONS: Severity[] = ['Critical', 'High', 'Moderate', 'Low'];
const NEED_OPTIONS = [
  { id: 'food', label: 'Food' },
  { id: 'furniture', label: 'Furniture' },
  { id: 'documents', label: 'Documents' },
  { id: 'electronics', label: 'Electronics' },
  { id: 'clothes', label: 'Clothes' },
  { id: 'elderly', label: 'Elderly' },
  { id: 'children', label: 'Children' },
  { id: 'sick', label: 'Sick Person' },
];

export default function MapFilters({ onFiltersChange }: MapFiltersProps) {
  const [severity, setSeverity] = useState<Severity[]>([]);
  const [needs, setNeeds] = useState<string[]>([]);
  const [verified, setVerified] = useState<boolean | undefined>(undefined);
  const [district, setDistrict] = useState<string>('');

  const handleSeverityToggle = (sev: Severity) => {
    const newSeverity = severity.includes(sev)
      ? severity.filter((s) => s !== sev)
      : [...severity, sev];
    setSeverity(newSeverity);
    onFiltersChange({ severity: newSeverity, needs, verified, district: district || undefined });
  };

  const handleNeedToggle = (need: string) => {
    const newNeeds = needs.includes(need)
      ? needs.filter((n) => n !== need)
      : [...needs, need];
    setNeeds(newNeeds);
    onFiltersChange({ severity, needs: newNeeds, verified, district: district || undefined });
  };

  const handleVerifiedChange = (value: boolean | undefined) => {
    setVerified(value);
    onFiltersChange({ severity, needs, verified: value, district: district || undefined });
  };

  const handleDistrictChange = (value: string) => {
    setDistrict(value);
    onFiltersChange({ severity, needs, verified, district: value || undefined });
  };

  const clearFilters = () => {
    setSeverity([]);
    setNeeds([]);
    setVerified(undefined);
    setDistrict('');
    onFiltersChange({});
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex items-center justify-between mb-2 md:mb-4">
        <h3 className="font-semibold text-base md:text-lg hidden md:block">Filters</h3>
        <button
          onClick={clearFilters}
          className="text-sm text-blue-600 hover:text-blue-800 font-medium px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors"
        >
          Clear All
        </button>
      </div>

      {/* Severity Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2 md:mb-3">Severity</label>
        <div className="flex flex-wrap gap-2">
          {SEVERITY_OPTIONS.map((sev) => (
            <button
              key={sev}
              onClick={() => handleSeverityToggle(sev)}
              className={`px-3 py-2 md:px-4 md:py-2 rounded-full text-xs md:text-sm font-medium transition-colors min-h-[44px] ${
                severity.includes(sev)
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 active:bg-gray-300'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>
      </div>

      {/* Needs Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2 md:mb-3">Damaged Items / Special Needs</label>
        <div className="flex flex-wrap gap-2">
          {NEED_OPTIONS.map((option) => (
            <button
              key={option.id}
              onClick={() => handleNeedToggle(option.id)}
              className={`px-3 py-2 md:px-4 md:py-2 rounded-full text-xs md:text-sm font-medium transition-colors min-h-[44px] ${
                needs.includes(option.id)
                  ? 'bg-green-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 active:bg-gray-300'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Verified Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2 md:mb-3">Verification</label>
        <div className="flex gap-2">
          <button
            onClick={() => handleVerifiedChange(true)}
            className={`flex-1 px-3 py-2.5 md:py-2 rounded-lg text-xs md:text-sm font-medium transition-colors min-h-[44px] ${
              verified === true
                ? 'bg-green-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 active:bg-gray-300'
            }`}
          >
            Verified
          </button>
          <button
            onClick={() => handleVerifiedChange(false)}
            className={`flex-1 px-3 py-2.5 md:py-2 rounded-lg text-xs md:text-sm font-medium transition-colors min-h-[44px] ${
              verified === false
                ? 'bg-yellow-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 active:bg-gray-300'
            }`}
          >
            Unverified
          </button>
          <button
            onClick={() => handleVerifiedChange(undefined)}
            className={`flex-1 px-3 py-2.5 md:py-2 rounded-lg text-xs md:text-sm font-medium transition-colors min-h-[44px] ${
              verified === undefined
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 active:bg-gray-300'
            }`}
          >
            All
          </button>
        </div>
      </div>

      {/* Area Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2 md:mb-3">Area / Village</label>
        <input
          type="text"
          value={district}
          onChange={(e) => handleDistrictChange(e.target.value)}
          placeholder="Enter area or village name"
          className="w-full px-4 py-3 md:py-2 border-2 border-gray-300 rounded-lg text-base md:text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors min-h-[44px]"
        />
      </div>
    </div>
  );
}

