'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Shield,
  CheckCircle,
  XCircle,
  Clock,
  Building2,
  Eye,
  FileText,
  CreditCard,
  User,
  AlertTriangle,
  ExternalLink,
  Hash,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { getThemeClasses } from '@/hooks/use-theme';
import { useBlockchainLogs } from '@/hooks/use-blockchain-logs';

interface BlockchainLogViewerProps {
  theme: 'dark' | 'light';
}

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

export function BlockchainLogViewer({ theme }: BlockchainLogViewerProps) {
  const themeClasses = getThemeClasses(theme);
  const { logs, loading, error, refetch } = useBlockchainLogs();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dataTypeFilter, setDataTypeFilter] = useState('all');
  const [thirdPartyFilter, setThirdPartyFilter] = useState('all');
  const [selectedRecord, setSelectedRecord] = useState<BlockchainRecord | null>(
    null
  );

  const filteredData = useMemo(() => {
    return logs.filter((record) => {
      const matchesSearch =
        record.thirdParty.name
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        record.purpose.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.dataType.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === 'all' || record.status === statusFilter;
      const matchesDataType =
        dataTypeFilter === 'all' || record.dataType === dataTypeFilter;
      const matchesThirdParty =
        thirdPartyFilter === 'all' ||
        record.thirdParty.type === thirdPartyFilter;

      return (
        matchesSearch && matchesStatus && matchesDataType && matchesThirdParty
      );
    });
  }, [logs, searchTerm, statusFilter, dataTypeFilter, thirdPartyFilter]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'denied':
        return <XCircle className="w-4 h-4 text-red-400" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-400" />;
      case 'revoked':
        return <AlertTriangle className="w-4 h-4 text-orange-400" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-500/20 text-green-300';
      case 'denied':
        return 'bg-red-500/20 text-red-300';
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-300';
      case 'revoked':
        return 'bg-orange-500/20 text-orange-300';
      default:
        return 'bg-gray-500/20 text-gray-300';
    }
  };

  const getDataTypeIcon = (dataType: string) => {
    switch (dataType) {
      case 'transaction_history':
        return <CreditCard className="w-4 h-4" />;
      case 'account_balance':
        return <Eye className="w-4 h-4" />;
      case 'personal_info':
        return <User className="w-4 h-4" />;
      case 'credit_score':
        return <FileText className="w-4 h-4" />;
      case 'kyc_documents':
        return <Shield className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const formatDataType = (dataType: string) => {
    return dataType
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short',
    });
  };

  const getThirdPartyTypeColor = (type: string) => {
    switch (type) {
      case 'bank':
        return 'bg-blue-500/20 text-blue-300';
      case 'fintech':
        return 'bg-purple-500/20 text-purple-300';
      case 'insurance':
        return 'bg-cyan-500/20 text-cyan-300';
      case 'credit_bureau':
        return 'bg-orange-500/20 text-orange-300';
      case 'government':
        return 'bg-red-500/20 text-red-300';
      default:
        return 'bg-gray-500/20 text-gray-300';
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="space-y-8">
        <Card
          className={`${themeClasses.cardBg} backdrop-blur-sm border ${themeClasses.cardBorder} transition-colors duration-300`}
        >
          <CardHeader>
            <CardTitle
              className={`text-2xl font-bold ${themeClasses.text} flex items-center gap-2`}
            >
              <Hash className="w-6 h-6 text-green-400" />
              Blockchain Access Log
            </CardTitle>
            <CardDescription className={themeClasses.mutedText}>
              Loading your blockchain audit records...
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="w-8 h-8 animate-spin text-green-400" />
              <span className={`ml-3 ${themeClasses.text}`}>
                Loading blockchain data...
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-8">
        <Card
          className={`${themeClasses.cardBg} backdrop-blur-sm border ${themeClasses.cardBorder} transition-colors duration-300`}
        >
          <CardHeader>
            <CardTitle
              className={`text-2xl font-bold ${themeClasses.text} flex items-center gap-2`}
            >
              <Hash className="w-6 h-6 text-red-400" />
              Blockchain Access Log
            </CardTitle>
            <CardDescription className={themeClasses.mutedText}>
              Error loading blockchain audit records
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center py-12">
              <AlertCircle className="w-8 h-8 text-red-400" />
              <div className="ml-3">
                <p className={`${themeClasses.text} font-medium`}>
                  Failed to load blockchain data
                </p>
                <p className={`${themeClasses.mutedText} text-sm`}>{error}</p>
                <Button onClick={refetch} className="mt-2" variant="outline">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Filters and Search */}
      <Card
        className={`${themeClasses.cardBg} backdrop-blur-sm border ${themeClasses.cardBorder} transition-colors duration-300`}
      >
        <CardHeader>
          <CardTitle
            className={`text-2xl font-bold ${themeClasses.text} flex items-center gap-2`}
          >
            <Hash className="w-6 h-6 text-green-400" />
            Blockchain Access Log
          </CardTitle>
          <CardDescription className={themeClasses.mutedText}>
            Immutable record of all data access requests and their outcomes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="lg:col-span-2">
              <div className="relative">
                <Search
                  className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${themeClasses.mutedText}`}
                />
                <Input
                  placeholder="Search by company, purpose, or data type..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`pl-10 ${
                    theme === 'light'
                      ? 'bg-white border-gray-200'
                      : 'bg-gray-800 border-gray-700'
                  } transition-colors duration-300`}
                />
              </div>
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger
                className={
                  theme === 'light'
                    ? 'bg-white border-gray-200'
                    : 'bg-gray-800 border-gray-700'
                }
              >
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="denied">Denied</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="revoked">Revoked</SelectItem>
              </SelectContent>
            </Select>

            <Select value={dataTypeFilter} onValueChange={setDataTypeFilter}>
              <SelectTrigger
                className={
                  theme === 'light'
                    ? 'bg-white border-gray-200'
                    : 'bg-gray-800 border-gray-700'
                }
              >
                <SelectValue placeholder="Data Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Data Types</SelectItem>
                <SelectItem value="transaction_history">
                  Transaction History
                </SelectItem>
                <SelectItem value="account_balance">Account Balance</SelectItem>
                <SelectItem value="personal_info">Personal Info</SelectItem>
                <SelectItem value="credit_score">Credit Score</SelectItem>
                <SelectItem value="kyc_documents">KYC Documents</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={thirdPartyFilter}
              onValueChange={setThirdPartyFilter}
            >
              <SelectTrigger
                className={
                  theme === 'light'
                    ? 'bg-white border-gray-200'
                    : 'bg-gray-800 border-gray-700'
                }
              >
                <SelectValue placeholder="Third Party" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="bank">Banks</SelectItem>
                <SelectItem value="fintech">Fintech</SelectItem>
                <SelectItem value="insurance">Insurance</SelectItem>
                <SelectItem value="credit_bureau">Credit Bureaus</SelectItem>
                <SelectItem value="government">Government</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card
          className={`${themeClasses.cardBg} backdrop-blur-sm border ${themeClasses.cardBorder} transition-colors duration-300`}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${themeClasses.mutedText}`}>
                  Total Requests
                </p>
                <p className={`text-2xl font-bold ${themeClasses.text}`}>
                  {filteredData.length}
                </p>
              </div>
              <Building2 className="w-8 h-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card
          className={`${themeClasses.cardBg} backdrop-blur-sm border ${themeClasses.cardBorder} transition-colors duration-300`}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${themeClasses.mutedText}`}>Approved</p>
                <p className={`text-2xl font-bold text-green-400`}>
                  {filteredData.filter((r) => r.status === 'approved').length}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card
          className={`${themeClasses.cardBg} backdrop-blur-sm border ${themeClasses.cardBorder} transition-colors duration-300`}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${themeClasses.mutedText}`}>
                  ZK Proofs Used
                </p>
                <p className={`text-2xl font-bold text-purple-400`}>
                  {filteredData.filter((r) => r.zkProofUsed).length}
                </p>
              </div>
              <Shield className="w-8 h-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>

        <Card
          className={`${themeClasses.cardBg} backdrop-blur-sm border ${themeClasses.cardBorder} transition-colors duration-300`}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${themeClasses.mutedText}`}>
                  Data Minimized
                </p>
                <p className={`text-2xl font-bold text-cyan-400`}>
                  {filteredData.filter((r) => r.dataMinimization).length}
                </p>
              </div>
              <Eye className="w-8 h-8 text-cyan-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Blockchain Records Table */}
      <Card
        className={`${themeClasses.cardBg} backdrop-blur-sm border ${themeClasses.cardBorder} transition-colors duration-300`}
      >
        <CardHeader>
          <CardTitle className={`text-xl font-bold ${themeClasses.text}`}>
            Access Records
          </CardTitle>
          <CardDescription className={themeClasses.mutedText}>
            Click on any record to view detailed blockchain information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <AnimatePresence>
              {filteredData.map((record, index) => (
                <motion.div
                  key={record.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05 }}
                  className={`p-4 rounded-lg border ${
                    theme === 'light'
                      ? 'border-gray-200 hover:border-gray-300 bg-gray-50 hover:bg-gray-100'
                      : 'border-gray-700 hover:border-gray-600 bg-gray-800/50 hover:bg-gray-800/70'
                  } transition-all duration-200 cursor-pointer`}
                  onClick={() => setSelectedRecord(record)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="text-2xl">{record.thirdParty.logo}</div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h3
                            className={`font-semibold ${themeClasses.text} truncate`}
                          >
                            {record.thirdParty.name}
                          </h3>
                          <Badge
                            className={getThirdPartyTypeColor(
                              record.thirdParty.type
                            )}
                          >
                            {record.thirdParty.type.replace('_', ' ')}
                          </Badge>
                          <Badge className={getStatusColor(record.status)}>
                            {getStatusIcon(record.status)}
                            <span className="ml-1 capitalize">
                              {record.status}
                            </span>
                          </Badge>
                        </div>

                        <div className="flex items-center gap-2 mb-2">
                          {getDataTypeIcon(record.dataType)}
                          <span className={`text-sm ${themeClasses.text}`}>
                            {formatDataType(record.dataType)}
                          </span>
                          <span className={`text-sm ${themeClasses.mutedText}`}>
                            •
                          </span>
                          <span className={`text-sm ${themeClasses.mutedText}`}>
                            {record.purpose}
                          </span>
                        </div>

                        <div className="flex items-center gap-4 text-xs">
                          <span className={themeClasses.mutedText}>
                            Block #{record.blockNumber.toLocaleString()}
                          </span>
                          <span className={themeClasses.mutedText}>
                            {formatTimestamp(record.timestamp)}
                          </span>
                          {record.zkProofUsed && (
                            <Badge className="bg-purple-500/20 text-purple-300 text-xs">
                              ZK Proof
                            </Badge>
                          )}
                          {record.dataMinimization && (
                            <Badge className="bg-cyan-500/20 text-cyan-300 text-xs">
                              Minimized
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className={`text-xs ${themeClasses.text}`}
                      >
                        {record.accessLevel}
                      </Badge>
                      <ExternalLink
                        className={`w-4 h-4 ${themeClasses.mutedText}`}
                      />
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {filteredData.length === 0 && (
              <div className={`text-center py-12 ${themeClasses.mutedText}`}>
                <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No records found matching your filters.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Detailed Record Modal */}
      <AnimatePresence>
        {selectedRecord && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedRecord(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className={`${themeClasses.cardBg} border ${themeClasses.cardBorder} rounded-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="text-3xl">
                    {selectedRecord.thirdParty.logo}
                  </div>
                  <div>
                    <h2 className={`text-2xl font-bold ${themeClasses.text}`}>
                      {selectedRecord.thirdParty.name}
                    </h2>
                    <p className={`${themeClasses.mutedText}`}>
                      Block #{selectedRecord.blockNumber.toLocaleString()}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedRecord(null)}
                  className={themeClasses.text}
                >
                  ✕
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className={`font-semibold ${themeClasses.text} mb-2`}>
                      Request Details
                    </h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className={themeClasses.mutedText}>
                          Data Type:
                        </span>
                        <span className={themeClasses.text}>
                          {formatDataType(selectedRecord.dataType)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className={themeClasses.mutedText}>Purpose:</span>
                        <span
                          className={`${themeClasses.text} text-right max-w-48`}
                        >
                          {selectedRecord.purpose}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className={themeClasses.mutedText}>
                          Access Level:
                        </span>
                        <Badge variant="outline" className="capitalize">
                          {selectedRecord.accessLevel}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className={themeClasses.mutedText}>Status:</span>
                        <Badge
                          className={getStatusColor(selectedRecord.status)}
                        >
                          {getStatusIcon(selectedRecord.status)}
                          <span className="ml-1 capitalize">
                            {selectedRecord.status}
                          </span>
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className={`font-semibold ${themeClasses.text} mb-2`}>
                      Privacy Features
                    </h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className={themeClasses.mutedText}>
                          User Consent:
                        </span>
                        <Badge
                          className={
                            selectedRecord.userConsent
                              ? 'bg-green-500/20 text-green-300'
                              : 'bg-red-500/20 text-red-300'
                          }
                        >
                          {selectedRecord.userConsent ? '✓ Given' : '✗ Denied'}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className={themeClasses.mutedText}>
                          Data Minimization:
                        </span>
                        <Badge
                          className={
                            selectedRecord.dataMinimization
                              ? 'bg-cyan-500/20 text-cyan-300'
                              : 'bg-gray-500/20 text-gray-300'
                          }
                        >
                          {selectedRecord.dataMinimization
                            ? '✓ Applied'
                            : '✗ Not Applied'}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className={themeClasses.mutedText}>
                          ZK Proof Used:
                        </span>
                        <Badge
                          className={
                            selectedRecord.zkProofUsed
                              ? 'bg-purple-500/20 text-purple-300'
                              : 'bg-gray-500/20 text-gray-300'
                          }
                        >
                          {selectedRecord.zkProofUsed ? '✓ Yes' : '✗ No'}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className={themeClasses.mutedText}>
                          Retention Period:
                        </span>
                        <span className={themeClasses.text}>
                          {selectedRecord.retentionPeriod > 0
                            ? `${selectedRecord.retentionPeriod} days`
                            : 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className={`font-semibold ${themeClasses.text} mb-2`}>
                      Blockchain Details
                    </h3>
                    <div className="space-y-2">
                      <div>
                        <span className={`${themeClasses.mutedText} text-sm`}>
                          Transaction Hash:
                        </span>
                        <div
                          className={`${themeClasses.text} text-xs font-mono bg-gray-700/50 p-2 rounded mt-1 break-all`}
                        >
                          {selectedRecord.transactionHash}
                        </div>
                      </div>
                      <div className="flex justify-between">
                        <span className={themeClasses.mutedText}>
                          Gas Used:
                        </span>
                        <span className={themeClasses.text}>
                          {selectedRecord.gasUsed.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className={themeClasses.mutedText}>
                          Timestamp:
                        </span>
                        <span className={themeClasses.text}>
                          {formatTimestamp(selectedRecord.timestamp)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className={`font-semibold ${themeClasses.text} mb-2`}>
                      Third Party Info
                    </h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className={themeClasses.mutedText}>
                          Organization:
                        </span>
                        <span className={themeClasses.text}>
                          {selectedRecord.thirdParty.name}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className={themeClasses.mutedText}>Type:</span>
                        <Badge
                          className={getThirdPartyTypeColor(
                            selectedRecord.thirdParty.type
                          )}
                        >
                          {selectedRecord.thirdParty.type.replace('_', ' ')}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
