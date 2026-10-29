import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Package,
  Plus,
  Search,
  Filter,
  AlertTriangle,
  Edit,
  Trash2,
  RefreshCw,
  Layers,
  ArrowRightLeft,
} from 'lucide-react';
import { resourceService } from '../../services/resourceService';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useAuth } from '../../contexts/AuthContext';
import { RESOURCE_CATEGORIES, ROLES } from '../../utils/constants';

const ResourcesPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [lowStockOnly, setLowStockOnly] = useState(false);

  const canManage = [
    ROLES.ADMIN,
    ROLES.GOV_OFFICIAL,
    ROLES.NGO_REPRESENTATIVE,
  ].includes(user?.role);

  const fetchResources = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await resourceService.getAllResources();
      const data = res?.resources || res?.data || (Array.isArray(res) ? res : []);
      setResources(data);
    } catch (err) {
      console.error('Failed to fetch resources:', err);
      setError(err?.message || 'Failed to load resources. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, []);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) {
      return;
    }
    try {
      setDeletingId(id);
      await resourceService.deleteResource(id);
      setResources((prev) => prev.filter((item) => (item.id || item._id) !== id));
    } catch (err) {
      alert(`Error deleting resource: ${err?.message || 'Something went wrong'}`);
    } finally {
      setDeletingId(null);
    }
  };

  const getCategoryLabel = (catValue) => {
    const found = RESOURCE_CATEGORIES.find((c) => c.value === catValue);
    return found ? found.label : catValue || 'General';
  };

  // Filtered resources
  const filteredResources = useMemo(() => {
    return resources.filter((item) => {
      const name = item.name || '';
      const category = item.category || '';
      const location = item.storageLocation || item.location || '';
      const quantity = Number(item.quantity) || 0;
      const minThreshold = item.minStockThreshold !== undefined ? Number(item.minStockThreshold) : 50;

      const matchesSearch =
        name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        location.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory =
        !selectedCategory || category === selectedCategory;

      const isLowStock = quantity < (minThreshold || 50);
      const matchesLowStock = !lowStockOnly || isLowStock;

      return matchesSearch && matchesCategory && matchesLowStock;
    });
  }, [resources, searchTerm, selectedCategory, lowStockOnly]);

  const totalItemsCount = resources.length;
  const lowStockCount = resources.filter((r) => {
    const q = Number(r.quantity) || 0;
    const thresh = r.minStockThreshold !== undefined ? Number(r.minStockThreshold) : 50;
    return q < thresh;
  }).length;

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Resource Inventory
          </h1>
          <p className="text-sm text-slate-500">
            Monitor and distribute emergency supplies, food, and rescue equipment
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/resources/transactions"
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
          >
            <ArrowRightLeft className="h-4 w-4 text-slate-500" />
            Transactions
          </Link>

          {canManage && (
            <Link
              to="/resources/new"
              className="inline-flex items-center gap-2 rounded-lg bg-teal-700 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-teal-800 transition"
            >
              <Plus className="h-4 w-4" />
              Add Resource
            </Link>
          )}
        </div>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="rounded-lg bg-teal-50 p-3 text-teal-700">
            <Package className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Total Items</p>
            <p className="text-2xl font-bold text-slate-900">{totalItemsCount}</p>
          </div>
        </div>

        <div
          onClick={() => setLowStockOnly(!lowStockOnly)}
          className={`flex items-center gap-4 rounded-xl border p-4 shadow-sm cursor-pointer transition ${
            lowStockOnly
              ? 'border-rose-400 bg-rose-50/50'
              : 'border-slate-200 bg-white hover:border-rose-200'
          }`}
        >
          <div className="rounded-lg bg-rose-50 p-3 text-rose-600">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Low Stock Alert</p>
            <div className="flex items-center gap-2">
              <p className="text-2xl font-bold text-rose-600">{lowStockCount}</p>
              <span className="text-xs text-slate-500">(Quantity &lt; 50)</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="rounded-lg bg-blue-50 p-3 text-blue-600">
            <Layers className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Categories</p>
            <p className="text-2xl font-bold text-slate-900">{RESOURCE_CATEGORIES.length}</p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by resource name or storage location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-slate-200 py-2 pl-9 pr-4 text-sm text-slate-900 placeholder-slate-400 focus:border-teal-700 focus:outline-none focus:ring-1 focus:ring-teal-700"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-slate-500" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-teal-700 focus:outline-none focus:ring-1 focus:ring-teal-700"
            >
              <option value="">All Categories</option>
              {RESOURCE_CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          <label className="flex items-center gap-2 cursor-pointer select-none rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">
            <input
              type="checkbox"
              checked={lowStockOnly}
              onChange={(e) => setLowStockOnly(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
            />
            <span className="font-medium text-slate-700">Low Stock Only</span>
          </label>

          <button
            onClick={fetchResources}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition"
            title="Refresh List"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Main Content / Table */}
      {loading ? (
        <LoadingSpinner message="Loading resource inventory..." />
      ) : error ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-6 text-center">
          <p className="text-sm font-medium text-rose-800">{error}</p>
          <button
            onClick={fetchResources}
            className="mt-3 rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700"
          >
            Try Again
          </button>
        </div>
      ) : filteredResources.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-sm">
          <Package className="h-12 w-12 text-slate-400 mb-3" />
          <h3 className="text-base font-semibold text-slate-800">No resources found</h3>
          <p className="mt-1 text-sm text-slate-500">
            {searchTerm || selectedCategory || lowStockOnly
              ? 'Try adjusting your search filters.'
              : 'Start by registering your first emergency resource.'}
          </p>
          {canManage && !searchTerm && !selectedCategory && !lowStockOnly && (
            <Link
              to="/resources/new"
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-teal-700 px-4 py-2 text-sm font-medium text-white hover:bg-teal-800"
            >
              <Plus className="h-4 w-4" />
              Add First Resource
            </Link>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
              <thead className="bg-slate-50 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                <tr>
                  <th scope="col" className="px-6 py-4">Name</th>
                  <th scope="col" className="px-6 py-4">Category</th>
                  <th scope="col" className="px-6 py-4">Quantity</th>
                  <th scope="col" className="px-6 py-4">Unit</th>
                  <th scope="col" className="px-6 py-4">Storage Location</th>
                  <th scope="col" className="px-6 py-4">Status</th>
                  <th scope="col" className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredResources.map((item) => {
                  const id = item.id || item._id;
                  const qty = Number(item.quantity) || 0;
                  const minThresh = item.minStockThreshold !== undefined ? Number(item.minStockThreshold) : 50;
                  const isLow = qty < minThresh;
                  const isDepleted = qty === 0;

                  return (
                    <tr
                      key={id}
                      className="hover:bg-slate-50/80 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-900">{item.name}</div>
                        {item.description && (
                          <div className="text-xs text-slate-500 truncate max-w-xs">
                            {item.description}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        <span className="inline-block rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                          {getCategoryLabel(item.category)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-semibold ${
                              isDepleted
                                ? 'text-rose-600'
                                : isLow
                                ? 'text-amber-600'
                                : 'text-slate-800'
                            }`}
                          >
                            {qty.toLocaleString()}
                          </span>
                          {isLow && (
                            <span className="inline-flex items-center gap-1 rounded bg-rose-100 px-1.5 py-0.5 text-[11px] font-semibold text-rose-700">
                              <AlertTriangle className="h-3 w-3" />
                              Low Stock
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {item.unit || 'units'}
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {item.storageLocation || item.location || 'Warehouse A'}
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge
                          status={
                            isDepleted
                              ? 'DEPLETED'
                              : isLow
                              ? 'LOW_STOCK'
                              : item.status || 'AVAILABLE'
                          }
                        />
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {canManage && (
                            <>
                              <button
                                onClick={() => navigate(`/resources/${id}/edit`)}
                                className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition"
                                title="Edit Resource"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(id, item.name)}
                                disabled={deletingId === id}
                                className="rounded-md p-1.5 text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition"
                                title="Delete Resource"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="border-t border-slate-200 px-6 py-4 flex items-center justify-between text-xs text-slate-500">
            <span>
              Showing {filteredResources.length} of {resources.length} items
            </span>
            <span>Threshold for low stock warning: &lt; 50 units</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResourcesPage;
