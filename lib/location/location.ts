/**
 * Location Services
 * 
 * GPS, geocoding, and location utilities.
 * Requires: npx expo install expo-location
 * 
 * Usage:
 *   import { useLocation } from '@/lib/location';
 *   const { getCurrentLocation, reverseGeocode } = useLocation();
 *   const location = await getCurrentLocation();
 */

import { logger } from '@/lib/logging/logger';

export interface LocationCoordinates {
  latitude: number;
  longitude: number;
  altitude?: number | null;
  accuracy?: number | null;
  altitudeAccuracy?: number | null;
  heading?: number | null;
  speed?: number | null;
}

export interface LocationResult {
  coords: LocationCoordinates;
  timestamp: number;
}

export interface GeocodeResult {
  latitude: number;
  longitude: number;
  address?: string;
  city?: string;
  region?: string;
  country?: string;
  postalCode?: string;
  street?: string;
  name?: string;
}

export interface UseLocationReturn {
  getCurrentLocation: (options?: LocationOptions) => Promise<LocationResult | null>;
  watchPosition: (callback: (location: LocationResult) => void) => Promise<() => void>;
  reverseGeocode: (coords: LocationCoordinates) => Promise<GeocodeResult | null>;
  geocode: (address: string) => Promise<GeocodeResult[]>;
  getDistance: (from: LocationCoordinates, to: LocationCoordinates) => number;
}

export interface LocationOptions {
  accuracy?: 'lowest' | 'low' | 'balanced' | 'high' | 'highest' | 'bestForNavigation';
  timeout?: number;
  maximumAge?: number;
}

class LocationService {
  /**
   * Get current location
   */
  async getCurrentLocation(options: LocationOptions = {}): Promise<LocationResult | null> {
    try {
      // @ts-ignore - Optional dependency
      const Location = await import('expo-location');

      // Request permission
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        logger.warn('Location permission not granted');
        return null;
      }

      const accuracyMap: Record<string, any> = {
        lowest: Location.Accuracy.Lowest,
        low: Location.Accuracy.Low,
        balanced: Location.Accuracy.Balanced,
        high: Location.Accuracy.High,
        highest: Location.Accuracy.Highest,
        bestForNavigation: Location.Accuracy.BestForNavigation,
      };

      const location = await Location.getCurrentPositionAsync({
        accuracy: accuracyMap[options.accuracy || 'balanced'],
      });

      logger.info('Location retrieved', {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      return {
        coords: {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          altitude: location.coords.altitude,
          accuracy: location.coords.accuracy,
          altitudeAccuracy: location.coords.altitudeAccuracy,
          heading: location.coords.heading,
          speed: location.coords.speed,
        },
        timestamp: location.timestamp,
      };
    } catch (error) {
      logger.error('Failed to get location', { error });
      return null;
    }
  }

  /**
   * Watch position changes
   */
  async watchPosition(
    callback: (location: LocationResult) => void,
    options: LocationOptions = {}
  ): Promise<() => void> {
    try {
      // @ts-ignore - Optional dependency
      const Location = await import('expo-location');

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        logger.warn('Location permission not granted');
        return () => {};
      }

      const accuracyMap: Record<string, any> = {
        lowest: Location.Accuracy.Lowest,
        low: Location.Accuracy.Low,
        balanced: Location.Accuracy.Balanced,
        high: Location.Accuracy.High,
        highest: Location.Accuracy.Highest,
        bestForNavigation: Location.Accuracy.BestForNavigation,
      };

      const subscription = await Location.watchPositionAsync(
        {
          accuracy: accuracyMap[options.accuracy || 'balanced'],
          timeInterval: 1000,
          distanceInterval: 1,
        },
        (location) => {
          callback({
            coords: {
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
              altitude: location.coords.altitude,
              accuracy: location.coords.accuracy,
              altitudeAccuracy: location.coords.altitudeAccuracy,
              heading: location.coords.heading,
              speed: location.coords.speed,
            },
            timestamp: location.timestamp,
          });
        }
      );

      return () => {
        subscription.remove();
      };
    } catch (error) {
      logger.error('Failed to watch position', { error });
      return () => {};
    }
  }

  /**
   * Reverse geocode (coordinates to address)
   */
  async reverseGeocode(coords: LocationCoordinates): Promise<GeocodeResult | null> {
    try {
      // @ts-ignore - Optional dependency
      const Location = await import('expo-location');

      const addresses = await Location.reverseGeocodeAsync({
        latitude: coords.latitude,
        longitude: coords.longitude,
      });

      if (addresses.length === 0) {
        return null;
      }

      const address = addresses[0];
      // @ts-ignore - expo-location types may vary
      return {
        latitude: coords.latitude,
        longitude: coords.longitude,
        address: [
          // @ts-ignore
          address.streetNumber,
          // @ts-ignore
          address.street,
          // @ts-ignore
          address.city,
          // @ts-ignore
          address.region,
          // @ts-ignore
          address.country,
        ]
          .filter(Boolean)
          .join(', '),
        // @ts-ignore
        city: address.city || undefined,
        // @ts-ignore
        region: address.region || undefined,
        // @ts-ignore
        country: address.country || undefined,
        // @ts-ignore
        postalCode: address.postalCode || undefined,
        // @ts-ignore
        street: address.street || undefined,
        // @ts-ignore
        name: address.name || undefined,
      };
    } catch (error) {
      logger.error('Reverse geocode failed', { error });
      return null;
    }
  }

  /**
   * Geocode (address to coordinates)
   */
  async geocode(address: string): Promise<GeocodeResult[]> {
    try {
      // @ts-ignore - Optional dependency
      const Location = await import('expo-location');

      const results = await Location.geocodeAsync(address);

      return results.map((result) => {
        // @ts-ignore - expo-location types may vary
        const street = result.street;
        // @ts-ignore
        const city = result.city;
        // @ts-ignore
        const region = result.region;
        // @ts-ignore
        const country = result.country;
        // @ts-ignore
        const postalCode = result.postalCode;
        // @ts-ignore
        const name = result.name;
        // @ts-ignore
        const streetNumber = result.streetNumber;

        return {
          latitude: result.latitude,
          longitude: result.longitude,
          address: [streetNumber, street, city, region, country]
            .filter(Boolean)
            .join(', '),
          city: city || undefined,
          region: region || undefined,
          country: country || undefined,
          postalCode: postalCode || undefined,
          street: street || undefined,
          name: name || undefined,
        };
      });
    } catch (error) {
      logger.error('Geocode failed', { error });
      return [];
    }
  }

  /**
   * Calculate distance between two coordinates (Haversine formula)
   */
  getDistance(from: LocationCoordinates, to: LocationCoordinates): number {
    const R = 6371; // Earth's radius in km
    const dLat = this.toRad(to.latitude - from.latitude);
    const dLon = this.toRad(to.longitude - from.longitude);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(from.latitude)) *
        Math.cos(this.toRad(to.latitude)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
  }

  private toRad(degrees: number): number {
    return (degrees * Math.PI) / 180;
  }
}

export const locationService = new LocationService();

/**
 * React hook for location services
 */
export function useLocation(): UseLocationReturn {
  return {
    getCurrentLocation: locationService.getCurrentLocation.bind(locationService),
    watchPosition: locationService.watchPosition.bind(locationService),
    reverseGeocode: locationService.reverseGeocode.bind(locationService),
    geocode: locationService.geocode.bind(locationService),
    getDistance: locationService.getDistance.bind(locationService),
  };
}
