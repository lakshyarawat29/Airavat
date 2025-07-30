import { useState, useEffect, useRef, useCallback } from 'react';

interface DashboardStats {
  activeRequests: number;
  completedToday: number;
  teamMembers: number;
  pendingReviews: number;
}

interface UseDashboardStatsReturn {
  stats: DashboardStats | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
  lastUpdated: Date | null;
  isStale: boolean;
}

// Cache for dashboard stats
let statsCache: DashboardStats | null = null;
let cacheTimestamp: number | null = null;
const CACHE_DURATION = 2 * 60 * 1000; // 2 minutes

// Rate limiting
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 3000; // 3 seconds between requests

// Fallback data when API is unavailable
const fallbackStats: DashboardStats = {
  activeRequests: 24,
  completedToday: 8,
  teamMembers: 12,
  pendingReviews: 16,
};

export function useDashboardStats(): UseDashboardStatsReturn {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isStale, setIsStale] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Check if cache is valid
  const isCacheValid = useCallback(() => {
    return (
      statsCache &&
      cacheTimestamp &&
      Date.now() - cacheTimestamp < CACHE_DURATION
    );
  }, []);

  // Add delay between requests
  const delay = useCallback(
    (ms: number) => new Promise((resolve) => setTimeout(resolve, ms)),
    []
  );

  const fetchStats = useCallback(
    async (forceRefresh = false) => {
      try {
        // Rate limiting
        const now = Date.now();
        if (now - lastRequestTime < MIN_REQUEST_INTERVAL) {
          await delay(MIN_REQUEST_INTERVAL - (now - lastRequestTime));
        }
        lastRequestTime = Date.now();

        // Check cache first (unless forcing refresh)
        if (!forceRefresh && isCacheValid()) {
          console.log('✅ Using cached dashboard stats');
          setStats(statsCache);
          setLastUpdated(new Date(cacheTimestamp!));
          setIsStale(false);
          setLoading(false);
          return;
        }

        setLoading(true);
        setError(null);

        // Cancel previous request if still pending
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
        }
        abortControllerRef.current = new AbortController();

        console.log('🔗 Fetching dashboard stats...');
        const response = await fetch('/api/dashboard-stats', {
          signal: abortControllerRef.current.signal,
          headers: {
            'Cache-Control': 'no-cache',
          },
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.error || `HTTP ${response.status}: ${response.statusText}`
          );
        }

        const data = await response.json();

        // Update cache
        statsCache = data;
        cacheTimestamp = Date.now();

        setStats(data);
        setLastUpdated(new Date());
        setIsStale(false);

        console.log('✅ Dashboard stats fetched successfully');
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
          console.log('🔄 Request was cancelled');
          return;
        }

        console.error('❌ Error fetching dashboard stats:', err);

        // If we have stale cache, use it with warning
        if (statsCache && !forceRefresh) {
          console.log('⚠️ Using stale cached stats due to fetch error');
          setStats(statsCache);
          setLastUpdated(new Date(cacheTimestamp!));
          setIsStale(true);
          setError(err instanceof Error ? err.message : 'An error occurred');
        } else {
          // Use fallback data
          console.log('🔄 Using fallback dashboard stats');
          setStats(fallbackStats);
          setLastUpdated(new Date());
          setIsStale(true);
          setError(err instanceof Error ? err.message : 'An error occurred');
        }
      } finally {
        setLoading(false);
        abortControllerRef.current = null;
      }
    },
    [isCacheValid, delay]
  );

  // Initial fetch
  useEffect(() => {
    fetchStats();

    // Cleanup on unmount
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchStats]);

  // Auto-refresh cache when it becomes stale
  useEffect(() => {
    if (!isCacheValid() && stats && !loading) {
      const timer = setTimeout(() => {
        setIsStale(true);
      }, CACHE_DURATION);

      return () => clearTimeout(timer);
    }
  }, [isCacheValid, stats, loading]);

  // Periodic refresh (every 5 minutes)
  useEffect(() => {
    const interval = setInterval(() => {
      if (!loading) {
        fetchStats(true);
      }
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [fetchStats, loading]);

  return {
    stats,
    loading,
    error,
    refetch: () => fetchStats(true),
    lastUpdated,
    isStale,
  };
}
