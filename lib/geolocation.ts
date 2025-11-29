// GPS and geolocation utilities

import type { Location } from '@/types';

export async function getCurrentLocation(): Promise<Location> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (error) => {
        reject(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  });
}

// Calculate distance between two points in kilometers (Haversine formula)
export function calculateDistance(
  point1: Location,
  point2: Location
): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(point2.lat - point1.lat);
  const dLon = toRad(point2.lng - point1.lng);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(point1.lat)) *
      Math.cos(toRad(point2.lat)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

// Add random offset to location for privacy (approximately 100-500m)
export function blurLocation(location: Location, offsetMeters: number = 200): Location {
  // Convert meters to degrees (approximate)
  const offsetDegrees = offsetMeters / 111000; // 1 degree ≈ 111km
  
  // Random angle
  const angle = Math.random() * 2 * Math.PI;
  
  // Random distance within offset
  const distance = (Math.random() * offsetDegrees);
  
  return {
    lat: location.lat + Math.cos(angle) * distance,
    lng: location.lng + Math.sin(angle) * distance,
  };
}

// Get district name from coordinates (simplified - would need proper geocoding)
export async function getDistrictFromLocation(location: Location): Promise<string> {
  // This is a placeholder - in production, use a geocoding service
  // For now, return a default or use reverse geocoding API
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${location.lat}&lon=${location.lng}`,
      {
        headers: {
          'User-Agent': 'FloodRelief.lk',
        },
      }
    );
    const data = await response.json();
    // Extract district from address
    const address = data.address;
    return address?.state_district || address?.state || 'Unknown';
  } catch (error) {
    return 'Unknown';
  }
}

