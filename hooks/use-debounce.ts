/**
 * Debounce Hook
 * 
 * Delays updating a value until after a specified time has passed.
 * 
 * Usage:
 *   const [searchQuery, setSearchQuery] = useState('');
 *   const debouncedQuery = useDebounce(searchQuery, 500);
 *   
 *   useEffect(() => {
 *     // This runs 500ms after the user stops typing
 *     if (debouncedQuery) {
 *       searchAPI(debouncedQuery);
 *     }
 *   }, [debouncedQuery]);
 */

import { useState, useEffect } from 'react';

export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}
