import { useState, useEffect, useRef, useCallback } from 'react';

interface PrivacyMetric {
  value: number;
  trend: number;
  status: 'good' | 'warning' | 'critical';
  description: string;
}

interface OrganizationBreakdown {
  name: string;
  count: number;
}

interface PrivacyAnalytics {
  dataAccessCompliance: PrivacyMetric;
  consentRate: PrivacyMetric;
  privacyScore: PrivacyMetric;
  dataBreachRisk: PrivacyMetric;
  organizationBreakdown: OrganizationBreakdown[];
}

interface UsePrivacyAnalyticsReturn {
  analytics: PrivacyAnalytics | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
  lastUpdated: Date | null;
  isStale: boolean;
}

// Cache for analytics data
let analyticsCache: PrivacyAnalytics | null = null;
let cacheTimestamp: number | null = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Rate limiting
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 2000; // 2 seconds between requests

// Fallback data when blockchain is unavailable
const fallbackAnalytics: PrivacyAnalytics = {
  dataAccessCompliance: {
    value: 85.2,
    trend: 2.1,
    status: 'good',
    description:
      'Percentage of data access requests that comply with privacy regulations',
  },
  consentRate: {
    value: 92.8,
    trend: 1.5,
    status: 'good',
    description:
      'Percentage of data access requests with explicit user consent',
  },
  privacyScore: {
    value: 87.3,
    trend: -1.2,
    status: 'good',
    description:
      'Overall privacy protection score based on differential privacy metrics',
  },
  dataBreachRisk: {
    value: 12.7,
    trend: 1.2,
    status: 'warning',
    description: 'Risk assessment score for potential data breaches',
  },
  organizationBreakdown: [
    { name: 'RBI', count: 15 },
    { name: 'TestBank', count: 12 },
    { name: 'DemoCorp', count: 8 },
    { name: 'BankX', count: 6 },
    { name: 'Paytm Banks', count: 4 },
  ],
};

export function usePrivacyAnalytics(): UsePrivacyAnalyticsReturn {
  const [analytics, setAnalytics] = useState<PrivacyAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isStale, setIsStale] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Check if cache is valid
  const isCacheValid = useCallback(() => {
    return (
      analyticsCache &&
      cacheTimestamp &&
      Date.now() - cacheTimestamp < CACHE_DURATION
    );
  }, []);

  // Add delay between requests
  const delay = useCallback(
    (ms: number) => new Promise((resolve) => setTimeout(resolve, ms)),
    []
  );

  const fetchAnalytics = useCallback(
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
          console.log('✅ Using cached analytics data');
          setAnalytics(analyticsCache);
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

        console.log('🔗 Fetching analytics from blockchain...');
        const response = await fetch('/api/privacy-analytics', {
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
        analyticsCache = data;
        cacheTimestamp = Date.now();

        setAnalytics(data);
        setLastUpdated(new Date());
        setIsStale(false);

        console.log('✅ Analytics data fetched successfully');
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
          console.log('🔄 Request was cancelled');
          return;
        }

        console.error('❌ Error fetching analytics:', err);

        // If we have stale cache, use it with warning
        if (analyticsCache && !forceRefresh) {
          console.log('⚠️ Using stale cached data due to fetch error');
          setAnalytics(analyticsCache);
          setLastUpdated(new Date(cacheTimestamp!));
          setIsStale(true);
          setError(err instanceof Error ? err.message : 'An error occurred');
        } else {
          // Use fallback data
          console.log('🔄 Using fallback analytics data');
          setAnalytics(fallbackAnalytics);
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
    fetchAnalytics();

    // Cleanup on unmount
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchAnalytics]);

  // Auto-refresh cache when it becomes stale
  useEffect(() => {
    if (!isCacheValid() && analytics && !loading) {
      const timer = setTimeout(() => {
        setIsStale(true);
      }, CACHE_DURATION);

      return () => clearTimeout(timer);
    }
  }, [isCacheValid, analytics, loading]);

  // Periodic refresh (every 10 minutes)
  useEffect(() => {
    const interval = setInterval(() => {
      if (!loading) {
        fetchAnalytics(true);
      }
    }, 10 * 60 * 1000); // 10 minutes

    return () => clearInterval(interval);
  }, [fetchAnalytics, loading]);

  return {
    analytics,
    loading,
    error,
    refetch: () => fetchAnalytics(true),
    lastUpdated,
    isStale,
  };
}
