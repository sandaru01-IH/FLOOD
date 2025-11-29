'use client';

import { useState } from 'react';
import type { LayerType } from '@/types';

const LAYER_TYPES: { value: LayerType; label: string }[] = [
  { value: 'rainfall', label: 'Rainfall Data' },
  { value: 'river_level', label: 'River Water Levels' },
  { value: 'flood_extent', label: 'Flood Extent' },
  { value: 'road_closure', label: 'Road Closures' },
  { value: 'evacuation_center', label: 'Evacuation Centers' },
];

export default function ImportPage() {
  const [file, setFile] = useState<File | null>(null);
  const [layerType, setLayerType] = useState<LayerType>('flood_extent');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type === 'application/json' || selectedFile.name.endsWith('.geojson')) {
        setFile(selectedFile);
        setError('');
      } else {
        setError('Please select a GeoJSON file (.geojson or .json)');
        setFile(null);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    if (!file || !name) {
      setError('File and name are required');
      setLoading(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('layer_type', layerType);
      formData.append('name', name);
      if (description) {
        formData.append('description', description);
      }

      const response = await fetch('/api/import-data', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        setFile(null);
        setName('');
        setDescription('');
        // Reset file input
        const fileInput = document.getElementById('file-input') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
      } else {
        setError(data.error || 'Failed to import data');
      }
    } catch (error) {
      setError('Failed to import data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Import Context Data</h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-8 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Layer Type *
          </label>
          <select
            value={layerType}
            onChange={(e) => setLayerType(e.target.value as LayerType)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {LAYER_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Name *
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g., Colombo Flood Extent 2024"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Optional description of this dataset"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            GeoJSON File *
          </label>
          <input
            id="file-input"
            type="file"
            accept=".geojson,.json"
            onChange={handleFileChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
          <p className="text-sm text-gray-500 mt-2">
            Upload a GeoJSON file containing the geographic data
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
            Data imported successfully! It will appear on the map once activated.
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !file || !name}
          className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Importing...' : 'Import Data'}
        </button>
      </form>

      <div className="mt-8 bg-blue-50 rounded-xl p-6">
        <h3 className="font-semibold text-gray-900 mb-2">About GeoJSON Import</h3>
        <p className="text-sm text-gray-700 mb-2">
          You can import geographic datasets in GeoJSON format. Common sources include:
        </p>
        <ul className="text-sm text-gray-700 list-disc list-inside space-y-1">
          <li>Flood extent polygons from satellite imagery</li>
          <li>Rainfall measurement points</li>
          <li>River gauge locations and levels</li>
          <li>Evacuation center locations</li>
          <li>Road closure segments</li>
        </ul>
      </div>
    </div>
  );
}

