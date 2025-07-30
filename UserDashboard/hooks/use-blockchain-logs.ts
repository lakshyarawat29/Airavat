import { useState, useEffect, useRef, useCallback } from 'react';

interface BlockchainRecord {
  id: string;
  blockNumber: number;
  timestamp: string;
  thirdParty: {
    name: string;
    type: 'bank' | 'fintech' | 'insurance' | 'credit_bureau' | 'government';
    logo: string;
  };
  dataType:
    | 'transaction_history'
    | 'account_balance'
    | 'personal_info'
    | 'credit_score'
    | 'kyc_documents';
  purpose: string;
  status: 'approved' | 'denied' | 'pending' | 'revoked';
  userConsent: boolean;
  dataMinimization: boolean;
  retentionPeriod: number;
  accessLevel: 'minimal' | 'moderate' | 'full';
  zkProofUsed: boolean;
  transactionHash: string;
  gasUsed: number;
}

interface UseBlockchainLogsReturn {
  logs: BlockchainRecord[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
  lastUpdated: Date | null;
  isStale: boolean;
}

// Cache for blockchain logs data
let logsCache: BlockchainRecord[] | null = null;
let cacheTimestamp: number | null = null;
const CACHE_DURATION = 3 * 60 * 1000; // 3 minutes

// Rate limiting
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 2500; // 2.5 seconds between requests

// Fallback data when blockchain is unavailable
const fallbackLogs: BlockchainRecord[] = [
  {
    id: '1',
    blockNumber: 12345678,
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    thirdParty: {
      name: 'RBI',
      type: 'government',
      logo: '/placeholder-logo.png',
    },
    dataType: 'personal_info',
    purpose: 'Regulatory compliance check',
    status: 'approved',
    userConsent: true,
    dataMinimization: true,
    retentionPeriod: 30,
    accessLevel: 'moderate',
    zkProofUsed: true,
    transactionHash: '0x1234567890abcdef...',
    gasUsed: 150000,
  },
  {
    id: '2',
    blockNumber: 12345679,
    timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    thirdParty: {
      name: 'TestBank',
      type: 'bank',
      logo: '/placeholder-logo.png',
    },
    dataType: 'credit_score',
    purpose: 'Loan application processing',
    status: 'approved',
    userConsent: true,
    dataMinimization: true,
    retentionPeriod: 90,
    accessLevel: 'full',
    zkProofUsed: false,
    transactionHash: '0xabcdef1234567890...',
    gasUsed: 180000,
  },
  {
    id: '3',
    blockNumber: 12345680,
    timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    thirdParty: {
      name: 'DemoCorp',
      type: 'fintech',
      logo: '/placeholder-logo.png',
    },
    dataType: 'transaction_history',
    purpose: 'Financial analysis',
    status: 'pending',
    userConsent: false,
    dataMinimization: false,
    retentionPeriod: 60,
    accessLevel: 'minimal',
    zkProofUsed: true,
    transactionHash: '0x7890abcdef123456...',
    gasUsed: 120000,
  },
];

export function useBlockchainLogs(): UseBlockchainLogsReturn {
  const [logs, setLogs] = useState<BlockchainRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isStale, setIsStale] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Check if cache is valid
  const isCacheValid = useCallback(() => {
    return (
      logsCache &&
      cacheTimestamp &&
      Date.now() - cacheTimestamp < CACHE_DURATION
    );
  }, []);

  // Add delay between requests
  const delay = useCallback(
    (ms: number) => new Promise((resolve) => setTimeout(resolve, ms)),
    []
  );

  const fetchLogs = useCallback(
    async (forceRefresh = false) => {
      try {
        // Rate limiting
        const now = Date.now();
        if (now - lastRequestTime < MIN_REQUEST_INTERVAL) {
          await delay(MIN_REQUEST_INTERVAL - (now - lastRequestTime));
        }
        lastRequestTime = Date.now();

        // Check cache first (unless forcing refresh)
        if (!forceRefresh && isCacheValid() && logsCache) {
          console.log('✅ Using cached blockchain logs');
          setLogs(logsCache);
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

        console.log('🔗 Fetching blockchain logs...');
        const response = await fetch('/api/blockchain-logs', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache',
          },
          credentials: 'include',
          signal: abortControllerRef.current.signal,
        });

        if (!response.ok) {
          if (response.status === 401) {
            throw new Error('Authentication failed. Please log in again.');
          }
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.error || `HTTP ${response.status}: ${response.statusText}`
          );
        }

        const data = await response.json();

        // Update cache
        logsCache = data;
        cacheTimestamp = Date.now();

        setLogs(data);
        setLastUpdated(new Date());
        setIsStale(false);

        console.log('✅ Blockchain logs fetched successfully');
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
          console.log('🔄 Request was cancelled');
          return;
        }

        console.error('❌ Error fetching blockchain logs:', err);

        // If we have stale cache, use it with warning
        if (logsCache && !forceRefresh) {
          console.log('⚠️ Using stale cached logs due to fetch error');
          setLogs(logsCache);
          setLastUpdated(new Date(cacheTimestamp!));
          setIsStale(true);
          setError(err instanceof Error ? err.message : 'An error occurred');
        } else {
          // Use fallback data
          console.log('🔄 Using fallback blockchain logs');
          setLogs(fallbackLogs);
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
    fetchLogs();

    // Cleanup on unmount
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchLogs]);

  // Auto-refresh cache when it becomes stale
  useEffect(() => {
    if (!isCacheValid() && logs.length > 0 && !loading) {
      const timer = setTimeout(() => {
        setIsStale(true);
      }, CACHE_DURATION);

      return () => clearTimeout(timer);
    }
  }, [isCacheValid, logs.length, loading]);

  // Periodic refresh (every 8 minutes)
  useEffect(() => {
    const interval = setInterval(() => {
      if (!loading) {
        fetchLogs(true);
      }
    }, 8 * 60 * 1000); // 8 minutes

    return () => clearInterval(interval);
  }, [fetchLogs, loading]);

  return {
    logs,
    loading,
    error,
    refetch: () => fetchLogs(true),
    lastUpdated,
    isStale,
  };
}
