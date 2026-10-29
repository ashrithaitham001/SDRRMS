import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowDownLeft,
  ArrowUpRight,
  Search,
  Filter,
  RefreshCw,
  History,
  Layers,
} from 'lucide-react';
import { resourceService } from '../../services/resourceService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { formatDate } from '../../utils/formatters';

const ResourceTransactionsPage = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await resourceService.getAllTransactions();
      const data =
        res?.transactions ||
        res?.data ||
        (Array.isArray(res) ? res : []);
      setTransactions(data);
    } catch (err) {
      console.error('Failed to fetch transactions:', err);
      setError(err?.message || 'Failed to load transaction history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      const type = (tx.type || '').toUpperCase();
      const matchesType =
        typeFilter === 'ALL' ||
        (typeFilter === 'IN' && (type === 'IN' || type === 'ADDITION' || type === 'RESTOCK')) ||
        (typeFilter === 'OUT' && (type === 'OUT' || type === 'DISTRIBUTE' || type === 'DISTRIBUTION'));

      const resourceName =
        typeof tx.resource === 'object'
          ? tx.resource?.name || ''
          : tx.resourceName || tx.resource || '';

      const purpose = tx.purpose || tx.remarks || tx.note || '';
      const byUser =
        typeof tx.performedBy === 'object'
          ? tx.performedBy?.name || tx.performedBy?.email || ''
          : typeof tx.user === 'object'
          ? tx.user?.name || tx.user?.email || ''
          : tx.performedBy || tx.by || tx.user || '';

      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        resourceName.toLowerCase().includes(searchLower) ||
        purpose.toLowerCase().includes(searchLower) ||
        String(byUser).toLowerCase().includes(searchLower);

      return matchesType && matchesSearch;
    });
  }, [transactions, typeFilter, searchTerm]);

  const totalIn = transactions.filter((t) => {
    const tp = (t.type || '').toUpperCase();
    return tp === 'IN' || tp === 'ADDITION' || tp === 'RESTOCK';
  }).length;

  const totalOut = transactions.filter((t) => {
    const tp = (t.type || '').toUpperCase();
    return tp === 'OUT' || tp === 'DISTRIBUTE' || tp === 'DISTRIBUTION';
  }).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link
          to="/resources"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-900 transition mb-3"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Resource Inventory
        </Link>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Resource Transactions
            </h1>
            <p className="text-sm text-slate-500">
              Audit log of supply inflows, aid dispatches, and warehouse inventory movements
            </p>
          </div>
          <button
            onClick={fetchTransactions}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 transition"
          >
            <RefreshCw className="h-4 w-4 text-slate-500" />
            Refresh Log
          </button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="rounded-lg bg-teal-50 p-3 text-teal-700">
            <History className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Total Transactions</p>
            <p className="text-2xl font-bold text-slate-900">{transactions.length}</p>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-xl border border-emerald-100 bg-white p-4 shadow-sm">
          <div className="rounded-lg bg-emerald-50 p-3 text-emerald-600">
            <ArrowDownLeft className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Inflow / Restocks (IN)</p>
            <p className="text-2xl font-bold text-emerald-600">{totalIn}</p>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-xl border border-blue-100 bg-white p-4 shadow-sm">
          <div className="rounded-lg bg-blue-50 p-3 text-blue-600">
            <ArrowUpRight className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Dispatched / Relief (OUT)</p>
            <p className="text-2xl font-bold text-blue-600">{totalOut}</p>
          </div>
        </div>
      </div>

      {/* Search & Type filter */}
      <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by resource, remarks, or actor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-slate-200 py-2 pl-9 pr-4 text-sm text-slate-900 placeholder-slate-400 focus:border-teal-700 focus:outline-none focus:ring-1 focus:ring-teal-700"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-slate-500" />
          <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-1 text-xs font-medium">
            <button
              onClick={() => setTypeFilter('ALL')}
              className={`rounded-md px-3 py-1.5 transition ${
                typeFilter === 'ALL'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Types
            </button>
            <button
              onClick={() => setTypeFilter('IN')}
              className={`rounded-md px-3 py-1.5 transition ${
                typeFilter === 'IN'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Inflow (IN)
            </button>
            <button
              onClick={() => setTypeFilter('OUT')}
              className={`rounded-md px-3 py-1.5 transition ${
                typeFilter === 'OUT'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Dispatched (OUT)
            </button>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      {loading ? (
        <LoadingSpinner message="Loading transaction history..." />
      ) : error ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-6 text-center">
          <p className="text-sm font-medium text-rose-800">{error}</p>
          <button
            onClick={fetchTransactions}
            className="mt-3 rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700"
          >
            Retry
          </button>
        </div>
      ) : filteredTransactions.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-sm">
          <Layers className="h-12 w-12 text-slate-400 mb-3" />
          <h3 className="text-base font-semibold text-slate-800">No transactions recorded</h3>
          <p className="mt-1 text-sm text-slate-500">
            {searchTerm || typeFilter !== 'ALL'
              ? 'No records match your selected criteria.'
              : 'Resource distribution and restocking entries will appear here.'}
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
              <thead className="bg-slate-50 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                <tr>
                  <th scope="col" className="px-6 py-4">Resource</th>
                  <th scope="col" className="px-6 py-4">Type</th>
                  <th scope="col" className="px-6 py-4">Quantity</th>
                  <th scope="col" className="px-6 py-4">Purpose / Remarks</th>
                  <th scope="col" className="px-6 py-4">Date</th>
                  <th scope="col" className="px-6 py-4">Recorded By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTransactions.map((tx, idx) => {
                  const id = tx.id || tx._id || idx;
                  const type = (tx.type || '').toUpperCase();
                  const isOut =
                    type === 'OUT' || type === 'DISTRIBUTE' || type === 'DISTRIBUTION';

                  const resourceName =
                    typeof tx.resource === 'object'
                      ? tx.resource?.name
                      : tx.resourceName || tx.resource || 'Item';

                  const unit =
                    typeof tx.resource === 'object'
                      ? tx.resource?.unit
                      : tx.unit || '';

                  const byUser =
                    typeof tx.performedBy === 'object'
                      ? tx.performedBy?.name || tx.performedBy?.email
                      : typeof tx.user === 'object'
                      ? tx.user?.name || tx.user?.email
                      : tx.performedBy || tx.by || tx.user || 'System';

                  const dateValue = tx.createdAt || tx.date || tx.timestamp;

                  return (
                    <tr key={id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-900">{resourceName}</div>
                      </td>
                      <td className="px-6 py-4">
                        {isOut ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700 border border-blue-200">
                            <ArrowUpRight className="h-3 w-3" />
                            OUT
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 border border-emerald-200">
                            <ArrowDownLeft className="h-3 w-3" />
                            IN
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-800">
                        {isOut ? `-${tx.quantity}` : `+${tx.quantity}`}{' '}
                        <span className="text-xs font-normal text-slate-500">{unit}</span>
                      </td>
                      <td className="px-6 py-4 text-slate-600 max-w-xs truncate">
                        {tx.purpose || tx.remarks || tx.note || '—'}
                      </td>
                      <td className="px-6 py-4 text-slate-600 whitespace-nowrap">
                        {formatDate(dateValue)}
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        <span className="inline-flex items-center rounded bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
                          {byUser}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="border-t border-slate-200 px-6 py-4 text-xs text-slate-500">
            Showing {filteredTransactions.length} of {transactions.length} recorded movements
          </div>
        </div>
      )}
    </div>
  );
};

export default ResourceTransactionsPage;
