import { useState, useEffect } from 'react';

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
}

export function useBlockchainLogs(): UseBlockchainLogsReturn {
  const [logs, setLogs] = useState<BlockchainRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/blockchain-logs', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        // Include credentials to send cookies
        credentials: 'include',
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication failed. Please log in again.');
        }
        throw new Error(`Failed to fetch logs: ${response.statusText}`);
      }

      const data = await response.json();
      setLogs(data);
    } catch (err) {
      console.error('Error fetching blockchain logs:', err);
      setError(
        err instanceof Error ? err.message : 'Failed to fetch blockchain logs'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return {
    logs,
    loading,
    error,
    refetch: fetchLogs,
  };
}
