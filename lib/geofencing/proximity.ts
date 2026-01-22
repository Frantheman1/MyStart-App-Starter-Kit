/**
 * Proximity Detection (Pokestop-like)
 * 
 * Detect when user is close to a location and trigger actions.
 * 
 * Usage:
 *   import { useProximity } from '@/lib/geofencing';
 *   const { checkProximity, nearbyLocations } = useProximity();
 *   const nearby = await checkProximity(locations, 50); // 50 meters
 */

import { useState, useCallback } from 'react';
import { logger } from '@/lib/logging/logger';
import { locationService } from '@/lib/location';

export interface ProximityLocation {
  id: string;
  name?: string;
  latitude: number;
  longitude: number;
  radius?: number; // meters, default 50
  onReach?: () => void;
  data?: any;
}

export interface NearbyLocation extends ProximityLocation {
  distance: number; // in meters
  isReached: boolean;
}

export interface UseProximityReturn {
  nearbyLocations: NearbyLocation[];
  checkProximity: (
    locations: ProximityLocation[],
    defaultRadius?: number
  ) => Promise<NearbyLocation[]>;
  isNearLocation: (location: ProximityLocation, currentLocation: { latitude: number; longitude: number }) => boolean;
  getDistanceToLocation: (location: ProximityLocation, currentLocation: { latitude: number; longitude: number }) => number;
}

/**
 * React hook for proximity detection
 */
export function useProximity(): UseProximityReturn {
  const [nearbyLocations, setNearbyLocations] = useState<NearbyLocation[]>([]);

  const getDistanceToLocation = useCallback(
    (
      location: ProximityLocation,
      currentLocation: { latitude: number; longitude: number }
    ): number => {
      const distance = locationService.getDistance(
        currentLocation,
        { latitude: location.latitude, longitude: location.longitude }
      );
      return distance * 1000; // Convert km to meters
    },
    []
  );

  const isNearLocation = useCallback(
    (
      location: ProximityLocation,
      currentLocation: { latitude: number; longitude: number }
    ): boolean => {
      const distance = getDistanceToLocation(location, currentLocation);
      const radius = location.radius || 50; // Default 50 meters
      return distance <= radius;
    },
    [getDistanceToLocation]
  );

  const checkProximity = useCallback(
    async (
      locations: ProximityLocation[],
      defaultRadius: number = 50
    ): Promise<NearbyLocation[]> => {
      try {
        const currentLocation = await locationService.getCurrentLocation();
        if (!currentLocation) {
          logger.warn('Could not get current location for proximity check');
          return [];
        }

        const nearby: NearbyLocation[] = locations.map((location) => {
          const distance = getDistanceToLocation(location, currentLocation.coords);
          const radius = location.radius || defaultRadius;
          const isReached = distance <= radius;

          // Trigger onReach callback if just reached
          if (isReached && location.onReach) {
            location.onReach();
            logger.info('Reached proximity location', { id: location.id, distance });
          }

          return {
            ...location,
            distance: Math.round(distance),
            isReached,
          };
        });

        // Sort by distance (closest first)
        nearby.sort((a, b) => a.distance - b.distance);

        setNearbyLocations(nearby);
        logger.debug('Proximity check completed', {
          total: locations.length,
          nearby: nearby.filter((l) => l.isReached).length,
        });

        return nearby;
      } catch (error) {
        logger.error('Proximity check failed', { error });
        return [];
      }
    },
    [getDistanceToLocation]
  );

  return {
    nearbyLocations,
    checkProximity,
    isNearLocation,
    getDistanceToLocation,
  };
}

/**
 * Watch for proximity changes (continuous monitoring)
 */
export function useProximityWatcher(
  locations: ProximityLocation[],
  checkInterval: number = 5000, // Check every 5 seconds
  defaultRadius: number = 50
) {
  const { checkProximity } = useProximity();
  const [isWatching, setIsWatching] = useState(false);

  const startWatching = useCallback(() => {
    setIsWatching(true);
    const intervalId = setInterval(() => {
      checkProximity(locations, defaultRadius);
    }, checkInterval);

    // Initial check
    checkProximity(locations, defaultRadius);

    return () => {
      clearInterval(intervalId);
      setIsWatching(false);
    };
  }, [checkProximity, locations, checkInterval, defaultRadius]);

  const stopWatching = useCallback(() => {
    setIsWatching(false);
  }, []);

  return {
    startWatching,
    stopWatching,
    isWatching,
  };
}
