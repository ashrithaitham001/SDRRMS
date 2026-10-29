import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Save, Package, AlertCircle } from 'lucide-react';
import { resourceService } from '../../services/resourceService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { RESOURCE_CATEGORIES } from '../../utils/constants';

const AddEditResourcePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [formData, setFormData] = useState({
    name: '',
    category: RESOURCE_CATEGORIES[0]?.value || 'FOOD',
    quantity: '',
    unit: 'packets',
    storageLocation: '',
    minStockThreshold: '50',
    description: '',
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEditing);
  const [submitError, setSubmitError] = useState(null);

  useEffect(() => {
    if (isEditing) {
      const fetchResource = async () => {
        try {
          setFetching(true);
          const res = await resourceService.getResourceById(id);
          const data = res?.resource || res?.data || res;
          if (data) {
            setFormData({
              name: data.name || '',
              category: data.category || RESOURCE_CATEGORIES[0]?.value || 'FOOD',
              quantity: data.quantity !== undefined ? String(data.quantity) : '',
              unit: data.unit || 'packets',
              storageLocation: data.storageLocation || data.location || '',
              minStockThreshold:
                data.minStockThreshold !== undefined
                  ? String(data.minStockThreshold)
                  : '50',
              description: data.description || '',
            });
          }
        } catch (err) {
          console.error('Failed to load resource data:', err);
          setSubmitError(err?.message || 'Could not load existing resource data.');
        } finally {
          setFetching(false);
        }
      };
      fetchResource();
    }
  }, [id, isEditing]);

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = 'Resource name is required';
    }
    if (!formData.category) {
      newErrors.category = 'Category is required';
    }
    if (formData.quantity === '' || isNaN(Number(formData.quantity))) {
      newErrors.quantity = 'Valid quantity is required';
    } else if (Number(formData.quantity) < 0) {
      newErrors.quantity = 'Quantity cannot be negative';
    }
    if (!formData.unit.trim()) {
      newErrors.unit = 'Unit is required (e.g. kg, packets, liters)';
    }
    if (!formData.storageLocation.trim()) {
      newErrors.storageLocation = 'Storage location is required';
    }
    if (
      formData.minStockThreshold !== '' &&
      (isNaN(Number(formData.minStockThreshold)) || Number(formData.minStockThreshold) < 0)
    ) {
      newErrors.minStockThreshold = 'Threshold must be a non-negative number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setLoading(true);
      setSubmitError(null);

      const payload = {
        name: formData.name.trim(),
        category: formData.category,
        quantity: Number(formData.quantity),
        unit: formData.unit.trim(),
        storageLocation: formData.storageLocation.trim(),
        minStockThreshold:
          formData.minStockThreshold !== ''
            ? Number(formData.minStockThreshold)
            : 50,
        description: formData.description.trim(),
      };

      if (isEditing) {
        await resourceService.updateResource(id, payload);
      } else {
        await resourceService.createResource(payload);
      }

      navigate('/resources');
    } catch (err) {
      console.error('Failed to save resource:', err);
      setSubmitError(err?.message || 'Failed to save resource. Please verify your inputs.');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return <LoadingSpinner message="Loading resource details..." />;
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Back button and page title */}
      <div>
        <Link
          to="/resources"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-900 transition mb-3"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Resource Inventory
        </Link>
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-teal-100 p-2.5 text-teal-700">
            <Package className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              {isEditing ? 'Edit Emergency Resource' : 'Add Emergency Resource'}
            </h1>
            <p className="text-sm text-slate-500">
              {isEditing
                ? 'Update inventory quantity, storage warehouse, and notification thresholds'
                : 'Register new humanitarian aid, food packages, or rescue equipment'}
            </p>
          </div>
        </div>
      </div>

      {submitError && (
        <div className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-800">
          <AlertCircle className="h-5 w-5 shrink-0 text-rose-600 mt-0.5" />
          <div className="text-sm">
            <p className="font-semibold">Error saving resource</p>
            <p>{submitError}</p>
          </div>
        </div>
      )}

      {/* Form Card */}
      <form
        onSubmit={handleSubmit}
        className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8 space-y-6"
      >
        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Resource Name <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g. Bottled Drinking Water 1L, Medical First-Aid Kit"
            className={`w-full rounded-lg border px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 ${
              errors.name
                ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500'
                : 'border-slate-200 focus:border-teal-700 focus:ring-teal-700'
            }`}
          />
          {errors.name && (
            <p className="mt-1 text-xs text-rose-600">{errors.name}</p>
          )}
        </div>

        {/* Category & Unit */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Category <span className="text-rose-500">*</span>
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className={`w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-1 ${
                errors.category
                  ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500'
                  : 'border-slate-200 focus:border-teal-700 focus:ring-teal-700'
              }`}
            >
              {RESOURCE_CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
            {errors.category && (
              <p className="mt-1 text-xs text-rose-600">{errors.category}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Unit of Measure <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              name="unit"
              value={formData.unit}
              onChange={handleChange}
              placeholder="e.g. packets, kg, liters, boxes, units"
              className={`w-full rounded-lg border px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 ${
                errors.unit
                  ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500'
                  : 'border-slate-200 focus:border-teal-700 focus:ring-teal-700'
              }`}
            />
            {errors.unit && (
              <p className="mt-1 text-xs text-rose-600">{errors.unit}</p>
            )}
          </div>
        </div>

        {/* Quantity & Min Stock Threshold */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Initial / Available Quantity <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              name="quantity"
              min="0"
              step="1"
              value={formData.quantity}
              onChange={handleChange}
              placeholder="e.g. 500"
              className={`w-full rounded-lg border px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 ${
                errors.quantity
                  ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500'
                  : 'border-slate-200 focus:border-teal-700 focus:ring-teal-700'
              }`}
            />
            {errors.quantity && (
              <p className="mt-1 text-xs text-rose-600">{errors.quantity}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Minimum Stock Threshold
            </label>
            <input
              type="number"
              name="minStockThreshold"
              min="0"
              step="1"
              value={formData.minStockThreshold}
              onChange={handleChange}
              placeholder="e.g. 50"
              className={`w-full rounded-lg border px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 ${
                errors.minStockThreshold
                  ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500'
                  : 'border-slate-200 focus:border-teal-700 focus:ring-teal-700'
              }`}
            />
            <p className="mt-1 text-xs text-slate-500">
              Triggers low-stock warnings when inventory drops below this number.
            </p>
            {errors.minStockThreshold && (
              <p className="mt-1 text-xs text-rose-600">
                {errors.minStockThreshold}
              </p>
            )}
          </div>
        </div>

        {/* Storage Location */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Storage Location / Warehouse <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            name="storageLocation"
            value={formData.storageLocation}
            onChange={handleChange}
            placeholder="e.g. Central Warehouse Hub #3, Sector 4 Relief Depot"
            className={`w-full rounded-lg border px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 ${
              errors.storageLocation
                ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500'
                : 'border-slate-200 focus:border-teal-700 focus:ring-teal-700'
            }`}
          />
          {errors.storageLocation && (
            <p className="mt-1 text-xs text-rose-600">{errors.storageLocation}</p>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Description & Notes
          </label>
          <textarea
            name="description"
            rows="3"
            value={formData.description}
            onChange={handleChange}
            placeholder="Provide specifications, donor notes, or perishable expiration details..."
            className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-teal-700 focus:outline-none focus:ring-1 focus:ring-teal-700"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={() => navigate('/resources')}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg bg-teal-700 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-teal-800 disabled:opacity-50 transition"
          >
            <Save className="h-4 w-4" />
            {loading ? 'Saving...' : isEditing ? 'Update Resource' : 'Create Resource'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddEditResourcePage;
