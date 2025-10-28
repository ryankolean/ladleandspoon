import { useState, useEffect } from 'react';
import {
  FileText,
  Download,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  Clock,
  XCircle
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import { Badge } from '../components/ui/badge';
import { Card } from '../components/ui/card';
import {
  getAuditLogs,
  getAuditStatistics,
  getOptOutHistory,
  exportAuditToCSV
} from '../services/sms';
import { format } from 'date-fns';

export default function SMSAudit() {
  const [records, setRecords] = useState([]);
  const [optOuts, setOptOuts] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    direction: 'all',
    dateFrom: '',
    dateTo: ''
  });

  const [showOptOuts, setShowOptOuts] = useState(false);

  useEffect(() => {
    loadData();
  }, [page, filters]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [auditData, statsData, optOutData] = await Promise.all([
        getAuditLogs({
          page,
          limit: 50,
          search: filters.search,
          status: filters.status,
          direction: filters.direction,
          dateFrom: filters.dateFrom || null,
          dateTo: filters.dateTo || null
        }),
        getAuditStatistics(),
        getOptOutHistory()
      ]);

      setRecords(auditData.records);
      setTotalPages(auditData.totalPages);
      setTotalRecords(auditData.total);
      setStats(statsData);
      setOptOuts(optOutData);
    } catch (error) {
      console.error('Error loading audit data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    exportAuditToCSV(records);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    loadData();
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      delivered: { variant: 'default', icon: CheckCircle2, className: 'bg-green-500' },
      sent: { variant: 'default', icon: CheckCircle2, className: 'bg-blue-500' },
      queued: { variant: 'default', icon: Clock, className: 'bg-yellow-500' },
      failed: { variant: 'destructive', icon: XCircle, className: 'bg-red-500' },
      undelivered: { variant: 'destructive', icon: AlertCircle, className: 'bg-orange-500' },
      received: { variant: 'default', icon: CheckCircle2, className: 'bg-green-500' }
    };

    const config = statusConfig[status] || { variant: 'default', icon: AlertCircle, className: 'bg-gray-500' };
    const Icon = config.icon;

    return (
      <Badge className={`${config.className} text-white`}>
        <Icon className="w-3 h-3 mr-1" />
        {status}
      </Badge>
    );
  };

  const getDirectionBadge = (direction) => {
    return direction === 'outbound' ? (
      <Badge variant="outline" className="border-blue-300 text-blue-700">
        Outbound
      </Badge>
    ) : (
      <Badge variant="outline" className="border-green-300 text-green-700">
        Inbound
      </Badge>
    );
  };

  if (loading && !records.length) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B4513]"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#654321]">SMS Audit Log</h1>
          <p className="text-[#8B4513]/60 mt-1">
            Compliance and message history tracking
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setShowOptOuts(!showOptOuts)}
            variant="outline"
            className="border-[#E6B85C]"
          >
            <AlertCircle className="w-4 h-4 mr-2" />
            {showOptOuts ? 'View Messages' : `Opt-Outs (${optOuts.length})`}
          </Button>
          <Button
            onClick={handleExport}
            disabled={records.length === 0}
            className="bg-[#8B4513] hover:bg-[#654321] text-white"
          >
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {stats && (
        <div className="grid grid-cols-5 gap-4">
          <Card className="p-4 border-[#E6B85C]/30">
            <div className="text-sm text-[#8B4513]/60 mb-1">Total Sent</div>
            <div className="text-2xl font-bold text-[#654321]">{stats.totalSent}</div>
          </Card>
          <Card className="p-4 border-[#E6B85C]/30">
            <div className="text-sm text-[#8B4513]/60 mb-1">Delivered</div>
            <div className="text-2xl font-bold text-green-600">{stats.totalDelivered}</div>
          </Card>
          <Card className="p-4 border-[#E6B85C]/30">
            <div className="text-sm text-[#8B4513]/60 mb-1">Failed</div>
            <div className="text-2xl font-bold text-red-600">{stats.totalFailed}</div>
          </Card>
          <Card className="p-4 border-[#E6B85C]/30">
            <div className="text-sm text-[#8B4513]/60 mb-1">Delivery Rate</div>
            <div className="text-2xl font-bold text-[#654321]">{stats.deliveryRate}%</div>
          </Card>
          <Card className="p-4 border-[#E6B85C]/30">
            <div className="text-sm text-[#8B4513]/60 mb-1">Opt-Outs</div>
            <div className="text-2xl font-bold text-orange-600">{stats.totalOptedOut}</div>
          </Card>
        </div>
      )}

      {showOptOuts ? (
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-[#654321] mb-4">Opt-Out History</h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Phone Number</TableHead>
                <TableHead>Date Opted Out</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {optOuts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-[#8B4513]/60">
                    No opt-outs recorded
                  </TableCell>
                </TableRow>
              ) : (
                optOuts.map((optOut) => (
                  <TableRow key={optOut.id}>
                    <TableCell className="font-medium">{optOut.phone_number}</TableCell>
                    <TableCell>
                      {format(new Date(optOut.opted_out_at), 'MMM d, yyyy h:mm a')}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{optOut.method}</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-[#8B4513]/60">
                      {optOut.notes || 'N/A'}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>
      ) : (
        <>
          <Card className="p-6">
            <form onSubmit={handleSearch} className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-[300px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8B4513]/50" />
                  <Input
                    type="text"
                    placeholder="Search by name, phone, or message content..."
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>

              <Select value={filters.status} onValueChange={(value) => handleFilterChange('status', value)}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="queued">Queued</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="received">Received</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filters.direction} onValueChange={(value) => handleFilterChange('direction', value)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Direction" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Directions</SelectItem>
                  <SelectItem value="outbound">Outbound</SelectItem>
                  <SelectItem value="inbound">Inbound</SelectItem>
                </SelectContent>
              </Select>

              <Input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                className="w-[160px]"
                placeholder="From Date"
              />

              <Input
                type="date"
                value={filters.dateTo}
                onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                className="w-[160px]"
                placeholder="To Date"
              />

              <Button type="submit" className="bg-[#8B4513] hover:bg-[#654321] text-white">
                Apply Filters
              </Button>
            </form>
          </Card>

          <Card className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <div className="text-sm text-[#8B4513]/60">
                Showing {records.length} of {totalRecords} messages
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="text-sm">
                  Page {page} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date/Time</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Direction</TableHead>
                    <TableHead>Recipient</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Message</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Sent By</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {records.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center text-[#8B4513]/60 py-8">
                        <FileText className="w-12 h-12 mx-auto mb-2 text-[#8B4513]/30" />
                        No messages found matching your filters
                      </TableCell>
                    </TableRow>
                  ) : (
                    records.map((record) => (
                      <TableRow key={record.id} className="hover:bg-[#FFF8E1]/30">
                        <TableCell className="whitespace-nowrap">
                          {format(new Date(record.sentAt), 'MMM d, yyyy')}
                          <br />
                          <span className="text-xs text-[#8B4513]/60">
                            {format(new Date(record.sentAt), 'h:mm a')}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {record.type}
                          </Badge>
                        </TableCell>
                        <TableCell>{getDirectionBadge(record.direction)}</TableCell>
                        <TableCell>
                          <div className="font-medium">{record.recipient}</div>
                          {record.recipientEmail && (
                            <div className="text-xs text-[#8B4513]/60">{record.recipientEmail}</div>
                          )}
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {record.recipientPhone}
                        </TableCell>
                        <TableCell className="max-w-[300px]">
                          <div className="truncate" title={record.messageBody}>
                            {record.messageBody}
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(record.status)}</TableCell>
                        <TableCell className="text-sm">{record.sentBy}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
