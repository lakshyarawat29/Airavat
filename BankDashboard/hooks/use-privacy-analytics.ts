import { useState, useEffect } from 'react';

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
}

export function usePrivacyAnalytics(): UsePrivacyAnalyticsReturn {
  const [analytics, setAnalytics] = useState<PrivacyAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/privacy-analytics');

      if (!response.ok) {
        throw new Error('Failed to fetch privacy analytics');
      }

      const data = await response.json();
      setAnalytics(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching privacy analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  return {
    analytics,
    loading,
    error,
    refetch: fetchAnalytics,
  };
}
