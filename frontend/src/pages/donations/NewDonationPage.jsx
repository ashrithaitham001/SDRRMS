import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Heart, 
  DollarSign, 
  Package, 
  CheckCircle2, 
  ArrowLeft, 
  ShieldCheck, 
  AlertCircle,
  Sparkles,
  Info
} from 'lucide-react';
import { donationService } from '../../services/donationService';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { formatCurrency } from '../../utils/formatters';

const PRESET_AMOUNTS = [500, 1000, 2500, 5000, 10000];

export const NewDonationPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [donationType, setDonationType] = useState('MONETARY'); // MONETARY or MATERIAL
  const [amount, setAmount] = useState('');
  const [itemDescription, setItemDescription] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('boxes');
  const [purpose, setPurpose] = useState('');
  const [donorName, setDonorName] = useState(user?.name || '');
  const [donorEmail, setDonorEmail] = useState(user?.email || '');
  const [donorPhone, setDonorPhone] = useState(user?.phone || '');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [successResult, setSuccessResult] = useState(null);

  const handleSelectPreset = (val) => {
    setAmount(String(val));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (donationType === 'MONETARY') {
      const numAmount = parseFloat(amount);
      if (isNaN(numAmount) || numAmount <= 0) {
        setError('Please enter a valid donation amount.');
        return;
      }
    } else {
      if (!itemDescription.trim()) {
        setError('Please provide an item description for material aid.');
        return;
      }
      const numQty = parseInt(quantity, 10);
      if (isNaN(numQty) || numQty <= 0) {
        setError('Please enter a valid quantity.');
        return;
      }
    }

    setSubmitting(true);

    const payload = {
      type: donationType,
      purpose: purpose.trim() || 'General Relief Assistance',
      donorName: donorName.trim() || user?.name || 'Anonymous Donor',
      donorEmail: donorEmail.trim() || user?.email,
      donorPhone: donorPhone.trim() || user?.phone,
      ...(donationType === 'MONETARY'
        ? { amount: parseFloat(amount) }
        : {
            itemDescription: itemDescription.trim(),
            quantity: parseInt(quantity, 10),
            unit: unit.trim() || 'units',
          }),
    };

    try {
      const res = await donationService.createDonation(payload);
      const donationData = res?.donation || res?.data || res || {};
      const refNumber =
        donationData.referenceNumber ||
        donationData.reference ||
        donationData.id ||
        `DON-${Math.floor(100000 + Math.random() * 900000)}`;

      setSuccessResult({
        referenceNumber: refNumber,
        type: donationType,
        amount: donationType === 'MONETARY' ? parseFloat(amount) : null,
        itemDescription: itemDescription.trim(),
        quantity: quantity,
      });
    } catch (err) {
      setError(err?.message || 'Failed to submit donation. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setSuccessResult(null);
    setAmount('');
    setItemDescription('');
    setQuantity('');
    setPurpose('');
    setError(null);
  };

  if (successResult) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-xl rounded-2xl border border-[#E2E8F0] bg-white p-8 shadow-sm text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
            <CheckCircle2 className="h-10 w-10" />
          </div>
          <h2 className="mt-4 text-2xl font-bold text-[#0F172A]">Thank You for Your Generosity!</h2>
          <p className="mt-2 text-sm text-[#64748B]">
            Your donation pledge has been recorded and will immediately support emergency operations on the ground.
          </p>

          <div className="mt-6 rounded-xl border border-dashed border-teal-300 bg-teal-50/50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-teal-800">Donation Reference</p>
            <p className="mt-1 font-mono text-xl font-bold text-teal-700">
              {successResult.referenceNumber}
            </p>
            <p className="mt-1 text-xs text-[#64748B]">
              Please retain this reference number for verification and tax exemption receipts.
            </p>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              to="/donations"
              className="inline-flex items-center justify-center rounded-lg border border-[#E2E8F0] px-5 py-2.5 text-sm font-semibold text-[#0F172A] hover:bg-slate-50 transition"
            >
              View My Donations
            </Link>
            <button
              onClick={handleReset}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-teal-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-teal-800 transition"
            >
              <Heart className="h-4 w-4" />
              Make Another Donation
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        {/* Back Link */}
        <Link
          to="/donations"
          className="inline-flex items-center gap-2 text-sm font-medium text-[#64748B] hover:text-teal-700 transition"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Donations
        </Link>

        {/* Header */}
        <div className="mt-4">
          <div className="inline-flex items-center gap-2 rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700">
            <Sparkles className="h-3.5 w-3.5" />
            Direct Impact Relief Fund
          </div>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-[#0F172A] sm:text-3xl">
            Make a Relief Donation
          </h1>
          <p className="mt-1 text-sm text-[#64748B]">
            Provide emergency funding or material resources to people displaced by ongoing crises.
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div className="mt-6 flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
            <AlertCircle className="h-4 w-4 flex-shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        {/* Form Card */}
        <div className="mt-6 rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-sm sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Donation Type Selector */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#64748B] mb-2">
                Select Donation Type *
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setDonationType('MONETARY')}
                  className={`flex flex-col items-center justify-center gap-2 rounded-xl border p-4 text-center transition ${
                    donationType === 'MONETARY'
                      ? 'border-teal-700 bg-teal-50/50 text-teal-800 shadow-sm'
                      : 'border-[#E2E8F0] bg-white text-[#64748B] hover:border-slate-300'
                  }`}
                >
                  <DollarSign className={`h-6 w-6 ${donationType === 'MONETARY' ? 'text-teal-700' : 'text-slate-400'}`} />
                  <span className="text-sm font-semibold">Financial Contribution</span>
                  <span className="text-xs text-slate-500">Fund emergency food, medical supplies & logistics</span>
                </button>

                <button
                  type="button"
                  onClick={() => setDonationType('MATERIAL')}
                  className={`flex flex-col items-center justify-center gap-2 rounded-xl border p-4 text-center transition ${
                    donationType === 'MATERIAL'
                      ? 'border-teal-700 bg-teal-50/50 text-teal-800 shadow-sm'
                      : 'border-[#E2E8F0] bg-white text-[#64748B] hover:border-slate-300'
                  }`}
                >
                  <Package className={`h-6 w-6 ${donationType === 'MATERIAL' ? 'text-teal-700' : 'text-slate-400'}`} />
                  <span className="text-sm font-semibold">Material Aid Supplies</span>
                  <span className="text-xs text-slate-500">Tents, blankets, dry rations, first-aid kits</span>
                </button>
              </div>
            </div>

            {/* Type Specific Fields */}
            {donationType === 'MONETARY' ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#64748B]">
                    Donation Amount (INR ₹) *
                  </label>
                  <div className="relative mt-1">
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-semibold">
                      ₹
                    </span>
                    <input
                      type="number"
                      min="1"
                      step="any"
                      required
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="e.g. 2500"
                      className="w-full rounded-lg border border-[#E2E8F0] py-2.5 pl-8 pr-4 text-base font-semibold text-[#0F172A] placeholder-slate-400 focus:border-teal-700 focus:outline-none focus:ring-1 focus:ring-teal-700"
                    />
                  </div>
                </div>

                {/* Quick Presets */}
                <div>
                  <p className="text-xs text-[#64748B] mb-2 font-medium">Quick Amount Presets:</p>
                  <div className="flex flex-wrap gap-2">
                    {PRESET_AMOUNTS.map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => handleSelectPreset(preset)}
                        className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${
                          amount === String(preset)
                            ? 'border-teal-700 bg-teal-700 text-white'
                            : 'border-[#E2E8F0] bg-white text-[#0F172A] hover:bg-slate-50'
                        }`}
                      >
                        {formatCurrency(preset)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#64748B]">
                    Item Description / Goods *
                  </label>
                  <input
                    type="text"
                    required
                    value={itemDescription}
                    onChange={(e) => setItemDescription(e.target.value)}
                    placeholder="e.g. High-density tarpaulins, bottled drinking water 1L, warm fleece blankets"
                    className="mt-1 w-full rounded-lg border border-[#E2E8F0] px-3 py-2 text-sm text-[#0F172A] focus:border-teal-700 focus:outline-none focus:ring-1 focus:ring-teal-700"
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#64748B]">
                      Quantity *
                    </label>
                    <input
                      type="number"
                      min="1"
                      required
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      placeholder="e.g. 50"
                      className="mt-1 w-full rounded-lg border border-[#E2E8F0] px-3 py-2 text-sm text-[#0F172A] focus:border-teal-700 focus:outline-none focus:ring-1 focus:ring-teal-700"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#64748B]">
                      Packaging Unit
                    </label>
                    <select
                      value={unit}
                      onChange={(e) => setUnit(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-[#E2E8F0] bg-white px-3 py-2 text-sm text-[#0F172A] focus:border-teal-700 focus:outline-none focus:ring-1 focus:ring-teal-700"
                    >
                      <option value="boxes">Boxes / Cartons</option>
                      <option value="pieces">Pieces / Units</option>
                      <option value="kg">Kilograms (kg)</option>
                      <option value="liters">Liters (L)</option>
                      <option value="kits">Emergency Kits</option>
                      <option value="pallets">Pallets</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Purpose / Specific Target */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#64748B]">
                Purpose / Target Area / Relief Notes (Optional)
              </label>
              <textarea
                rows={3}
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                placeholder="e.g. Dedicated for cyclone shelter victims or medical outreach camp in Balasore"
                className="mt-1 w-full rounded-lg border border-[#E2E8F0] px-3 py-2 text-sm text-[#0F172A] focus:border-teal-700 focus:outline-none focus:ring-1 focus:ring-teal-700"
              />
            </div>

            {/* Donor Information */}
            <div className="border-t border-[#E2E8F0] pt-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[#64748B] mb-3">
                Donor Contact Details
              </h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <label className="block text-xs font-medium text-[#64748B]">Full Name</label>
                  <input
                    type="text"
                    value={donorName}
                    onChange={(e) => setDonorName(e.target.value)}
                    placeholder="Anonymous or Name"
                    className="mt-1 w-full rounded-lg border border-[#E2E8F0] px-3 py-2 text-sm text-[#0F172A] focus:border-teal-700 focus:outline-none focus:ring-1 focus:ring-teal-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#64748B]">Email Address</label>
                  <input
                    type="email"
                    value={donorEmail}
                    onChange={(e) => setDonorEmail(e.target.value)}
                    placeholder="donor@example.com"
                    className="mt-1 w-full rounded-lg border border-[#E2E8F0] px-3 py-2 text-sm text-[#0F172A] focus:border-teal-700 focus:outline-none focus:ring-1 focus:ring-teal-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#64748B]">Phone Number</label>
                  <input
                    type="tel"
                    value={donorPhone}
                    onChange={(e) => setDonorPhone(e.target.value)}
                    placeholder="+91 9876543210"
                    className="mt-1 w-full rounded-lg border border-[#E2E8F0] px-3 py-2 text-sm text-[#0F172A] focus:border-teal-700 focus:outline-none focus:ring-1 focus:ring-teal-700"
                  />
                </div>
              </div>
            </div>

            {/* Trust Banner */}
            <div className="flex items-start gap-3 rounded-xl border border-teal-100 bg-teal-50/50 p-4 text-xs text-teal-800">
              <ShieldCheck className="h-5 w-5 flex-shrink-0 text-teal-700 mt-0.5" />
              <div>
                <span className="font-semibold">Audited & Transparent:</span> All donations are monitored by state disaster management authorities. Receipts and allocations are logged in public audit records.
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => navigate('/donations')}
                className="rounded-lg border border-[#E2E8F0] px-4 py-2.5 text-sm font-medium text-[#64748B] hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-2 rounded-lg bg-teal-700 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-teal-800 disabled:opacity-50 transition"
              >
                {submitting && <LoadingSpinner size="sm" />}
                Confirm Donation Pledge
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default NewDonationPage;
