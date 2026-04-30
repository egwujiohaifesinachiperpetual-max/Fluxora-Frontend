import { useState, useCallback, useRef } from 'react';

/**
 * Hook to manage polite ARIA-live announcements.
 * Follows WCAG best practices for async updates.
 */
export function useLiveAnnouncer() {
  const [announcement, setAnnouncement] = useState('');
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const announce = useCallback((message: string) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // Set the announcement
    setAnnouncement(message);

    // Clear after a delay so that if the same message is sent again,
    // the DOM change triggers a new screen reader announcement.
    timeoutRef.current = setTimeout(() => {
      setAnnouncement('');
      timeoutRef.current = null;
    }, 1000);
  }, []);

  return { announcement, announce };
}
