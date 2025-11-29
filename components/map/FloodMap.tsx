'use client';

import { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { supabase } from '@/lib/supabase';
import { getSeverityColor, getSeverityLabel } from '@/lib/severity-scoring';
import { blurLocation } from '@/lib/geolocation';
import type { Assessment, Helper, ContextLayer, Location, Severity } from '@/types';

// Fix for default marker icons in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

interface FloodMapProps {
  isAdmin?: boolean;
  filters?: {
    severity?: Severity[];
    needs?: string[];
    verified?: boolean;
    district?: string;
  };
  onMarkerClick?: (assessment: Assessment) => void;
}

// Component to handle map updates
function MapUpdater({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

export default function FloodMap({ isAdmin = false, filters, onMarkerClick }: FloodMapProps) {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [helpers, setHelpers] = useState<Helper[]>([]);
  const [contextLayers, setContextLayers] = useState<ContextLayer[]>([]);
  const [loading, setLoading] = useState(true);
  const [center, setCenter] = useState<[number, number]>([7.8731, 80.7718]); // Sri Lanka center
  const [zoom, setZoom] = useState(8);

  // Separate effect for initial load and subscriptions
  useEffect(() => {
    loadData();

    // Set up real-time subscription
    const assessmentsChannel = supabase
      .channel('assessments-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'assessments',
        },
        () => {
          console.log('🔄 Assessment data changed, reloading...');
          loadData();
        }
      )
      .subscribe();

    const helpersChannel = supabase
      .channel('helpers-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'helpers',
        },
        () => {
          console.log('🔄 Helper data changed, reloading...');
          loadData();
        }
      )
      .subscribe();

    const gigsChannel = supabase
      .channel('gigs-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'gigs',
        },
        () => {
          console.log('🔄 Gig data changed, reloading...');
          loadData();
        }
      )
      .subscribe();

    return () => {
      assessmentsChannel.unsubscribe();
      helpersChannel.unsubscribe();
      gigsChannel.unsubscribe();
    };
  }, []); // Empty dependency array for subscriptions

  // Separate effect for filters - reload data when filters change
  useEffect(() => {
    if (filters) {
      console.log('🔄 Filters changed, reloading data...');
      loadData();
    }
  }, [
    filters?.severity?.join(','),
    filters?.needs?.join(','),
    filters?.verified,
    filters?.district,
  ]); // Use specific filter properties instead of the whole object

  const loadData = async () => {
    try {
      setLoading(true);
      console.log('🗺️ Loading map data...');
      
      // Load assessments
      let assessmentsQuery = supabase
        .from('assessments')
        .select('*')
        .order('created_at', { ascending: false });

      if (filters?.severity && filters.severity.length > 0) {
        assessmentsQuery = assessmentsQuery.in('severity_score', filters.severity);
      }
      if (filters?.verified !== undefined) {
        assessmentsQuery = assessmentsQuery.eq('verified', filters.verified);
      }
      if (filters?.district) {
        assessmentsQuery = assessmentsQuery.eq('area', filters.district);
      }

      const { data: assessmentsData, error: assessmentsError } = await assessmentsQuery;

      if (assessmentsError) {
        console.error('❌ Error loading assessments:', assessmentsError);
        throw assessmentsError;
      }

      console.log(`✅ Loaded ${assessmentsData?.length || 0} assessments`);

      // Load helpers
      const { data: helpersData, error: helpersError } = await supabase
        .from('helpers')
        .select('*')
        .eq('active', true);

      if (helpersError) {
        console.error('❌ Error loading helpers:', helpersError);
        throw helpersError;
      }

      console.log(`✅ Loaded ${helpersData?.length || 0} helpers`);

      // Load gigs (new system)
      const { data: gigsData, error: gigsError } = await supabase
        .from('gigs')
        .select('*')
        .eq('status', 'active');

      if (gigsError) {
        console.warn('⚠️ Error loading gigs (may not exist yet):', gigsError);
      } else {
        console.log(`✅ Loaded ${gigsData?.length || 0} gigs`);
      }

      // Load context layers
      const { data: layersData, error: layersError } = await supabase
        .from('context_layers')
        .select('*')
        .eq('active', true);

      if (layersError) {
        console.warn('⚠️ Error loading context layers:', layersError);
      }

      // Parse locations
      const parsedAssessments = (assessmentsData || []).map((a: any) => {
        const location = parsePostGISPoint(isAdmin ? a.location : a.approximate_location || a.location);
        if (!location) {
          console.warn('⚠️ Assessment has no valid location:', a.id, a.location, a.approximate_location);
        }
        return {
          ...a,
          location,
        };
      }).filter((a: any) => a.location !== null); // Filter out assessments without locations

      const parsedHelpers = (helpersData || []).map((h: any) => {
        const location = parsePostGISPoint(h.location);
        if (!location) {
          console.warn('⚠️ Helper has no valid location:', h.id, h.location);
        }
        return {
          ...h,
          location,
        };
      }).filter((h: any) => h.location !== null); // Filter out helpers without locations

      console.log(`📍 Parsed ${parsedAssessments.length} assessments with locations`);
      console.log(`📍 Parsed ${parsedHelpers.length} helpers with locations`);

      setAssessments(parsedAssessments as Assessment[]);
      setHelpers(parsedHelpers as Helper[]);
      setContextLayers((layersData || []) as ContextLayer[]);
    } catch (error) {
      console.error('❌ Error loading map data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter assessments by needs (using damaged_items)
  const filteredAssessments = assessments.filter((assessment) => {
    if (!filters?.needs || filters.needs.length === 0) return true;
    // Check if any filter need matches damaged items or special needs
    const damagedItems = assessment.damaged_items || [];
    const hasMatchingItem = filters.needs.some((need) => 
      damagedItems.includes(need) ||
      (need === 'elderly' && assessment.has_elderly) ||
      (need === 'children' && assessment.has_children) ||
      (need === 'sick' && assessment.has_sick_person)
    );
    return hasMatchingItem;
  });

  const createMarkerIcon = (color: string) => {
    return L.divIcon({
      className: 'custom-marker',
      html: `<div style="background-color: ${color}; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
      iconSize: [20, 20],
      iconAnchor: [10, 10],
    });
  };

  const createHelperIcon = () => {
    return L.divIcon({
      className: 'custom-marker',
      html: `<div style="background-color: #3b82f6; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">🤝</div>`,
      iconSize: [20, 20],
      iconAnchor: [10, 10],
    });
  };

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative">
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        className="z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Assessment Markers */}
        {filteredAssessments.map((assessment) => {
          if (!assessment.location) return null;
          const color = getSeverityColor(assessment.severity_score);

          return (
            <Marker
              key={assessment.id}
              position={[assessment.location.lat, assessment.location.lng]}
              icon={createMarkerIcon(color)}
              eventHandlers={{
                click: () => {
                  if (onMarkerClick) {
                    onMarkerClick(assessment);
                  }
                },
              }}
            >
              <Popup>
                <div className="p-2 min-w-[200px]">
                  <h3 className="font-bold text-lg mb-2">{assessment.name}</h3>
                  <p className="text-sm text-gray-600 mb-2">
                    <span
                      className="px-2 py-1 rounded text-xs font-semibold text-white"
                      style={{ backgroundColor: color }}
                    >
                      {getSeverityLabel(assessment.severity_score, 'en')}
                    </span>
                  </p>
                  <p className="text-sm mb-2">Family: {assessment.family_size} people</p>
                  <p className="text-sm mb-2">
                    Water: {assessment.water_inside || 'N/A'} • Can stay: {assessment.can_stay_home || 'N/A'}
                  </p>
                  {assessment.damaged_items && assessment.damaged_items.length > 0 && (
                    <div className="mb-2">
                      <p className="text-xs font-semibold mb-1">Damaged:</p>
                      <div className="flex flex-wrap gap-1">
                        {assessment.damaged_items.slice(0, 3).map((item) => (
                          <span
                            key={item}
                            className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded"
                          >
                            {item.replace('_', ' ')}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {(assessment.has_elderly || assessment.has_children || assessment.has_sick_person) && (
                    <div className="mb-2">
                      <p className="text-xs font-semibold mb-1">Special Needs:</p>
                      <div className="flex flex-wrap gap-1">
                        {assessment.has_elderly && (
                          <span className="px-2 py-0.5 bg-orange-100 text-orange-800 text-xs rounded">
                            Elderly
                          </span>
                        )}
                        {assessment.has_children && (
                          <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs rounded">
                            Children
                          </span>
                        )}
                        {assessment.has_sick_person && (
                          <span className="px-2 py-0.5 bg-red-100 text-red-800 text-xs rounded">
                            Sick
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                  {assessment.area && (
                    <p className="text-xs text-gray-500 mb-1">📍 {assessment.area}</p>
                  )}
                  {assessment.photos && assessment.photos.length > 0 && (
                    <img
                      src={assessment.photos[0]}
                      alt="Damage photo"
                      className="w-full h-32 object-cover rounded mt-2"
                    />
                  )}
                  <p className="text-xs text-gray-500 mt-2">
                    {new Date(assessment.created_at).toLocaleString()}
                  </p>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Helper Markers */}
        {helpers.map((helper) => {
          if (!helper.location) return null;

          return (
            <Marker
              key={helper.id}
              position={[helper.location.lat, helper.location.lng]}
              icon={createHelperIcon()}
            >
              <Popup>
                <div className="p-2 min-w-[200px]">
                  <h3 className="font-bold text-lg mb-2">{helper.name}</h3>
                  <p className="text-sm mb-2">Can help: {helper.capacity} people</p>
                  <p className="text-sm mb-2">Radius: {helper.radius_km} km</p>
                  {helper.offerings.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold mb-1">Offers:</p>
                      <div className="flex flex-wrap gap-1">
                        {helper.offerings.map((offering) => (
                          <span
                            key={offering}
                            className="px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded"
                          >
                            {offering.replace('-', ' ')}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </Popup>
              <Circle
                center={[helper.location.lat, helper.location.lng]}
                radius={helper.radius_km * 1000}
                pathOptions={{ color: '#3b82f6', fillOpacity: 0.1 }}
              />
            </Marker>
          );
        })}

        {/* Context Layers */}
        {contextLayers.map((layer) => {
          if (!layer.geojson_data) return null;
          // Render GeoJSON layers (simplified - would need proper GeoJSON rendering)
          return null;
        })}

        <MapUpdater center={center} zoom={zoom} />
      </MapContainer>

      {/* Legend */}
      <div className="absolute bottom-4 right-4 bg-white rounded-lg shadow-lg p-4 z-[1000]">
        <h4 className="font-semibold mb-2 text-sm">Legend</h4>
        <div className="space-y-1 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-red-600"></div>
            <span>Critical</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-orange-600"></div>
            <span>High</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-yellow-600"></div>
            <span>Moderate</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-green-600"></div>
            <span>Low</span>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <div className="w-4 h-4 rounded-full bg-blue-600">🤝</div>
            <span>Helper</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function parsePostGISPoint(point: string | any): Location | null {
  if (!point) return null;
  if (typeof point === 'object' && point.lat && point.lng) {
    return point;
  }
  if (typeof point === 'string') {
    const match = point.match(/POINT\(([\d.]+)\s+([\d.]+)\)/);
    if (match) {
      return {
        lng: parseFloat(match[1]),
        lat: parseFloat(match[2]),
      };
    }
  }
  return null;
}

