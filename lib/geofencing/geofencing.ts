/**
 * Geofencing
 * 
 * Monitor regions and detect when user enters/exits.
 * 
 * Usage:
 *   import { useGeofencing } from '@/lib/geofencing';
 *   const { addGeofence, removeGeofence } = useGeofencing();
 *   await addGeofence({
 *     id: 'location-1',
 *     latitude: 59.9139,
 *     longitude: 10.7522,
 *     radius: 100, // meters
 *   });
 */

import { useState, useEffect, useCallback } from 'react';
import { logger } from '@/lib/logging/logger';
import { locationService } from '@/lib/location';

export interface Geofence {
  id: string;
  latitude: number;
  longitude: number;
  radius: number; // in meters
  notifyOnEnter?: boolean;
  notifyOnExit?: boolean;
}

export interface GeofenceEvent {
  geofence: Geofence;
  type: 'enter' | 'exit';
  timestamp: number;
}

export interface UseGeofencingReturn {
  geofences: Geofence[];
  addGeofence: (geofence: Geofence) => Promise<void>;
  removeGeofence: (id: string) => void;
  clearGeofences: () => void;
  isInsideGeofence: (geofenceId: string, location: { latitude: number; longitude: number }) => boolean;
  getDistanceToGeofence: (geofenceId: string, location: { latitude: number; longitude: number }) => number;
}

class GeofencingService {
  private geofences: Map<string, Geofence> = new Map();
  private watchSubscription: (() => void) | null = null;
  private onEnterCallbacks: Map<string, (event: GeofenceEvent) => void> = new Map();
  private onExitCallbacks: Map<string, (event: GeofenceEvent) => void> = new Map();
  private lastKnownLocation: { latitude: number; longitude: number } | null = null;
  private isInsideMap: Map<string, boolean> = new Map();

  /**
   * Add a geofence
   */
  async addGeofence(geofence: Geofence): Promise<void> {
    this.geofences.set(geofence.id, geofence);
    this.isInsideMap.set(geofence.id, false);
    logger.info('Geofence added', { id: geofence.id, radius: geofence.radius });

    // Start watching if not already started
    if (!this.watchSubscription) {
      await this.startWatching();
    }
  }

  /**
   * Remove a geofence
   */
  removeGeofence(id: string): void {
    this.geofences.delete(id);
    this.isInsideMap.delete(id);
    this.onEnterCallbacks.delete(id);
    this.onExitCallbacks.delete(id);
    logger.info('Geofence removed', { id });

    // Stop watching if no geofences left
    if (this.geofences.size === 0 && this.watchSubscription) {
      this.stopWatching();
    }
  }

  /**
   * Clear all geofences
   */
  clearGeofences(): void {
    this.geofences.clear();
    this.isInsideMap.clear();
    this.onEnterCallbacks.clear();
    this.onExitCallbacks.clear();
    this.stopWatching();
    logger.info('All geofences cleared');
  }

  /**
   * Check if location is inside geofence
   */
  isInsideGeofence(
    geofenceId: string,
    location: { latitude: number; longitude: number }
  ): boolean {
    const geofence = this.geofences.get(geofenceId);
    if (!geofence) return false;

    const distance = locationService.getDistance(
      { latitude: location.latitude, longitude: location.longitude },
      { latitude: geofence.latitude, longitude: geofence.longitude }
    );

    return distance * 1000 <= geofence.radius; // Convert km to meters
  }

  /**
   * Get distance to geofence in meters
   */
  getDistanceToGeofence(
    geofenceId: string,
    location: { latitude: number; longitude: number }
  ): number {
    const geofence = this.geofences.get(geofenceId);
    if (!geofence) return Infinity;

    const distance = locationService.getDistance(
      { latitude: location.latitude, longitude: location.longitude },
      { latitude: geofence.latitude, longitude: geofence.longitude }
    );

    return distance * 1000; // Convert km to meters
  }

  /**
   * Start watching location
   */
  private async startWatching(): Promise<void> {
    try {
      this.watchSubscription = await locationService.watchPosition(
        (location) => {
          this.lastKnownLocation = location.coords;
          this.checkGeofences(location.coords);
        },
        { accuracy: 'balanced' }
      );
      logger.info('Started geofencing location watch');
    } catch (error) {
      logger.error('Failed to start geofencing watch', { error });
    }
  }

  /**
   * Stop watching location
   */
  private stopWatching(): void {
    if (this.watchSubscription) {
      this.watchSubscription();
      this.watchSubscription = null;
      logger.info('Stopped geofencing location watch');
    }
  }

  /**
   * Check all geofences against current location
   */
  private checkGeofences(location: { latitude: number; longitude: number }): void {
    for (const [id, geofence] of this.geofences.entries()) {
      const wasInside = this.isInsideMap.get(id) || false;
      const isInside = this.isInsideGeofence(id, location);

      if (isInside && !wasInside) {
        // Entered geofence
        this.isInsideMap.set(id, true);
        const callback = this.onEnterCallbacks.get(id);
        if (callback || geofence.notifyOnEnter) {
          const event: GeofenceEvent = {
            geofence,
            type: 'enter',
            timestamp: Date.now(),
          };
          callback?.(event);
          logger.info('Entered geofence', { id });
        }
      } else if (!isInside && wasInside) {
        // Exited geofence
        this.isInsideMap.set(id, false);
        const callback = this.onExitCallbacks.get(id);
        if (callback || geofence.notifyOnExit) {
          const event: GeofenceEvent = {
            geofence,
            type: 'exit',
            timestamp: Date.now(),
          };
          callback?.(event);
          logger.info('Exited geofence', { id });
        }
      }
    }
  }

  /**
   * Register callback for geofence enter
   */
  onEnter(geofenceId: string, callback: (event: GeofenceEvent) => void): void {
    this.onEnterCallbacks.set(geofenceId, callback);
  }

  /**
   * Register callback for geofence exit
   */
  onExit(geofenceId: string, callback: (event: GeofenceEvent) => void): void {
    this.onExitCallbacks.set(geofenceId, callback);
  }

  /**
   * Get all geofences
   */
  getGeofences(): Geofence[] {
    return Array.from(this.geofences.values());
  }

  /**
   * Get last known location
   */
  getLastKnownLocation(): { latitude: number; longitude: number } | null {
    return this.lastKnownLocation;
  }
}

export const geofencingService = new GeofencingService();

/**
 * React hook for geofencing
 */
export function useGeofencing() {
  const [geofences, setGeofences] = useState<Geofence[]>([]);

  const addGeofence = useCallback(async (geofence: Geofence) => {
    await geofencingService.addGeofence(geofence);
    setGeofences(geofencingService.getGeofences());
  }, []);

  const removeGeofence = useCallback((id: string) => {
    geofencingService.removeGeofence(id);
    setGeofences(geofencingService.getGeofences());
  }, []);

  const clearGeofences = useCallback(() => {
    geofencingService.clearGeofences();
    setGeofences([]);
  }, []);

  const isInsideGeofence = useCallback(
    (geofenceId: string, location: { latitude: number; longitude: number }) => {
      return geofencingService.isInsideGeofence(geofenceId, location);
    },
    []
  );

  const getDistanceToGeofence = useCallback(
    (geofenceId: string, location: { latitude: number; longitude: number }) => {
      return geofencingService.getDistanceToGeofence(geofenceId, location);
    },
    []
  );

  useEffect(() => {
    setGeofences(geofencingService.getGeofences());
  }, []);

  return {
    geofences,
    addGeofence,
    removeGeofence,
    clearGeofences,
    isInsideGeofence,
    getDistanceToGeofence,
  };
}
