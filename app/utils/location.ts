import { PermissionsAndroid, Platform } from 'react-native';
import Geolocation from '@react-native-community/geolocation';

export interface GeocodedAddress {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: string;
  addressDetails?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    fullAddress?: string;
  };
}

/**
 * Prompts user for native Android location permissions.
 */
export async function requestLocationPermission(): Promise<boolean> {
  if (Platform.OS === 'ios') {
    Geolocation.requestAuthorization();
    return true;
  }

  try {
    const granted = await PermissionsAndroid.requestMultiple([
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
    ]);

    return (
      granted['android.permission.ACCESS_FINE_LOCATION'] === PermissionsAndroid.RESULTS.GRANTED ||
      granted['android.permission.ACCESS_COARSE_LOCATION'] === PermissionsAndroid.RESULTS.GRANTED
    );
  } catch (err) {
    console.warn('Error requesting location permission:', err);
    return false;
  }
}

// Configure Geolocation module
Geolocation.setRNConfiguration({
  skipPermissionRequests: false,
  authorizationLevel: 'whenInUse',
  locationProvider: 'auto',
});

function getPositionAsync(options: {
  enableHighAccuracy: boolean;
  timeout: number;
  maximumAge: number;
}): Promise<{ latitude: number; longitude: number; accuracy: number; timestamp: number }> {
  return new Promise((resolve, reject) => {
    Geolocation.getCurrentPosition(
      (pos) => {
        resolve({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: pos.coords.accuracy || 15,
          timestamp: pos.timestamp,
        });
      },
      (err) => {
        reject(err);
      },
      options
    );
  });
}

/**
 * Captures live GPS coordinates using @react-native-community/geolocation,
 * with high accuracy priority and automatic network fallback,
 * and reverse geocodes the coordinates via OpenStreetMap Nominatim.
 */
export async function getCurrentGPSPosition(): Promise<GeocodedAddress> {
  const hasPermission = await requestLocationPermission();
  if (!hasPermission) {
    throw new Error('Location permission denied. Please enable location permissions in app settings.');
  }

  let coords: { latitude: number; longitude: number; accuracy: number; timestamp: number };

  try {
    // 1. Try GPS Provider (high accuracy) first
    coords = await getPositionAsync({
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 10000,
    });
  } catch (gpsErr: any) {
    console.warn('High accuracy GPS timed out/failed, falling back to network provider...', gpsErr?.message);
    try {
      // 2. Fallback to Network Provider (Wi-Fi / Cell tower)
      coords = await getPositionAsync({
        enableHighAccuracy: false,
        timeout: 15000,
        maximumAge: 60000,
      });
    } catch (networkErr: any) {
      console.warn('Network location also failed:', networkErr?.message);
      throw new Error(
        'Could not retrieve live GPS coordinates. Please ensure Location / GPS is turned ON in your phone settings.'
      );
    }
  }

  const { latitude, longitude, accuracy, timestamp } = coords;
  let addressDetails = {
    street: 'Current Location',
    city: '',
    state: '',
    country: 'India',
    fullAddress: `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`,
  };

  try {
    // Free OpenStreetMap reverse geocode
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
      {
        headers: {
          'User-Agent': 'FieldOpsCS/1.0',
          'Accept-Language': 'en',
        },
      }
    );
    if (response.ok) {
      const data = await response.json();
      const addr = data.address || {};
      const streetName =
        addr.road ||
        addr.suburb ||
        addr.neighbourhood ||
        addr.residential ||
        addr.amenity ||
        addr.commercial ||
        'Current Location';
      const cityName =
        addr.city || addr.town || addr.village || addr.county || addr.state_district || '';
      const stateName = addr.state || '';

      addressDetails = {
        street: streetName,
        city: cityName,
        state: stateName,
        country: addr.country || 'India',
        fullAddress:
          data.display_name || (cityName ? `${streetName}, ${cityName}` : streetName),
      };
    }
  } catch (e) {
    console.warn('Reverse geocoding error:', e);
  }

  return {
    latitude,
    longitude,
    accuracy,
    timestamp: new Date(timestamp).toISOString(),
    addressDetails,
  };
}

/**
/**
 * Safely parses coordinate values, handling numbers, strings, and degree notation (e.g. "17.4432° N", "78.3662° E").
 */
export function parseCoordinate(val: any): number | null {
  if (val === null || val === undefined || val === '') return null;
  if (typeof val === 'number') return isNaN(val) ? null : val;
  const str = String(val).trim();
  const cleaned = str.replace(/[^0-9.-]/g, '').trim();
  const num = parseFloat(cleaned);
  if (isNaN(num)) return null;
  if (str.toUpperCase().includes('S') || str.toUpperCase().includes('W')) {
    return -Math.abs(num);
  }
  return num;
}

/**
 * Calculates straight-line distance in meters between two coordinates using the Haversine formula.
 */
export function calculateDistanceInMeters(
  lat1?: number | string | null,
  lon1?: number | string | null,
  lat2?: number | string | null,
  lon2?: number | string | null
): number | null {
  const nLat1 = parseCoordinate(lat1);
  const nLon1 = parseCoordinate(lon1);
  const nLat2 = parseCoordinate(lat2);
  const nLon2 = parseCoordinate(lon2);

  if (nLat1 == null || nLon1 == null || nLat2 == null || nLon2 == null) {
    return null;
  }

  const R = 6371000; // Earth radius in meters
  const dLat = ((nLat2 - nLat1) * Math.PI) / 180;
  const dLon = ((nLon2 - nLon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((nLat1 * Math.PI) / 180) *
      Math.cos((nLat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

/**
 * Attempts to fetch road driving distance in meters (OSRM / OpenStreetMap routing),
 * falling back to Haversine straight-line distance in meters.
 */
export async function getRoadDistanceInMeters(
  lat1?: number | string | null,
  lon1?: number | string | null,
  lat2?: number | string | null,
  lon2?: number | string | null
): Promise<number | null> {
  const straightMeters = calculateDistanceInMeters(lat1, lon1, lat2, lon2);
  if (straightMeters == null) return null;

  try {
    const res = await fetch(
      `https://router.project-osrm.org/route/v1/driving/${lon1},${lat1};${lon2},${lat2}?overview=false`,
      {
        headers: {
          'User-Agent': 'FieldOpsCS/1.0',
        },
      }
    );
    if (res.ok) {
      const data = await res.json();
      const roadDistance = data?.routes?.[0]?.distance;
      if (typeof roadDistance === 'number') {
        return Math.round(roadDistance);
      }
    }
  } catch (e) {
    console.warn('Road routing distance fallback to straight-line:', e);
  }

  return straightMeters;
}

/**
 * Formats distance in meters into a clean, human-readable string:
 * - If distance < 1,000m: displays as "X m" (e.g., "170 m", "850 m")
 * - If distance >= 1,000m: displays as "X.X km" (e.g., "2.8 km", "3.1 km")
 */
export function formatDistance(meters?: number | string | null): string {
  if (meters == null || meters === '') return '';
  const num = typeof meters === 'number' ? meters : parseFloat(String(meters));
  if (isNaN(num)) return '';
  if (num < 1000) {
    return `${Math.round(num)} m`;
  }
  return `${(num / 1000).toFixed(1)} km`;
}

/**
 * Formats distance in meters to clean human-readable strings (e.g., "450 m" or "2.5 km")
 */
export function formatDistanceDisplay(meters?: number | string | null): string {
  return formatDistance(meters) || '—';
}


