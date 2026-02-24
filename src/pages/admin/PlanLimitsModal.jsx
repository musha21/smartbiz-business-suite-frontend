import React, { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Activity,
  Zap,
  Save,
  Info,
  Infinity as InfinityIcon,
  AlertTriangle
} from 'lucide-react';
import { CircularProgress, Alert, Chip } from '@mui/material';
import { toast } from 'react-toastify';
import { subscriptionService } from '../../api';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';

import { getRole } from '../../api/auth'; // ✅ adjust path if you placed auth.js elsewhere

const STANDARD_LIMITS = [
  { key: 'INVOICES_PER_MONTH', label: 'Invoices Per Month', icon: <Activity size={18} /> },
  { key: 'PRODUCTS_LIMIT', label: 'Max Products', icon: <Zap size={18} /> },
  { key: 'CUSTOMERS_LIMIT', label: 'Max Customers', icon: <Zap size={18} /> },
];

const PlanLimitsModal = ({ isOpen, onClose, plan }) => {
  const queryClient = useQueryClient();
  const [limitsData, setLimitsData] = useState([]);

  const isAdmin = useMemo(() => getRole() === "ADMIN", []);

  // ✅ Fetch existing limits (backend returns Map<String, Long>)
  const { data: existingLimits, isLoading, error } = useQuery({
    queryKey: ['plan-limits', plan?.id],
    queryFn: () => subscriptionService.fetchPlanLimits(plan.id),
    enabled: !!plan?.id && isOpen && isAdmin, // ✅ don't even call API if not admin
    retry: false
  });

  // ✅ Normalize existingLimits as a Map/object
  useEffect(() => {
    if (!isOpen) return;

    const limitsMap =
      existingLimits && typeof existingLimits === "object" && !Array.isArray(existingLimits)
        ? existingLimits
        : {};

    const mapped = STANDARD_LIMITS.map(std => ({
      limitKey: std.key,
      limitValue: limitsMap?.[std.key] ?? 0,
      label: std.label,
      icon: std.icon
    }));

    setLimitsData(mapped);
  }, [existingLimits, isOpen]);

  const mutation = useMutation({
    mutationFn: (payload) => subscriptionService.updatePlanLimits(plan.id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries(['plan-limits', plan?.id]);
      queryClient.invalidateQueries(['admin-plans']);
      toast.success('Service level limits updated successfully');
      onClose();
    },
    onError: (err) => {
      if (err?.isForbidden) {
        toast.error("Admin access required");
        return;
      }
      toast.error(err?.response?.data?.message || 'Failed to save limits');
    }
  });

  const handleValueChange = (key, value) => {
    setLimitsData(prev =>
      prev.map(item =>
        item.limitKey === key
          ? { ...item, limitValue: Number.isFinite(parseInt(value, 10)) ? parseInt(value, 10) : 0 }
          : item
      )
    );
  };

  const handleSetUnlimited = (key) => {
    setLimitsData(prev => prev.map(item =>
      item.limitKey === key ? { ...item, limitValue: -1 } : item
    ));
  };

  const handleSave = () => {
    if (!isAdmin) {
      toast.error("Admin access required");
      return;
    }

    // ✅ MUST match backend DTO: PlanLimitUpsertDto { key, value }
    const payload = limitsData.map(({ limitKey, limitValue }) => ({
      key: limitKey,
      value: Number(limitValue)
    }));

    mutation.mutate(payload);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${plan?.name} — Service Limits`}
      maxWidth="max-w-xl"
      footer={
        <div className="flex gap-4 justify-end">
          <Button variant="outline" onClick={onClose}>Discard</Button>
          <Button
            onClick={handleSave}
            loading={mutation.isLoading}
            icon={Save}
            disabled={!isAdmin} // ✅ disable for OWNER
          >
            Save Configuration
          </Button>
        </div>
      }
    >
      <div className="space-y-8">
        {!isAdmin && (
          <Alert severity="warning" className="rounded-2xl border border-amber-100 bg-amber-50/50">
            <div className="flex items-start gap-2">
              <AlertTriangle size={18} className="text-amber-600 shrink-0 mt-0.5" />
              <p className="text-xs font-medium text-amber-800 leading-relaxed">
                You are logged in as OWNER. Only ADMIN can edit plan limits.
              </p>
            </div>
          </Alert>
        )}

        <Alert severity="info" className="rounded-2xl border border-blue-100 bg-blue-50/50">
          <div className="flex items-start gap-2">
            <Info size={18} className="text-blue-600 shrink-0 mt-0.5" />
            <p className="text-xs font-medium text-blue-800 leading-relaxed">
              Set values to <span className="font-black italic">-1</span> for unlimited quota.
            </p>
          </div>
        </Alert>

        {isAdmin && isLoading ? (
          <div className="flex flex-col items-center justify-center py-10 gap-3">
            <CircularProgress size={32} />
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Loading...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {limitsData.map((limit) => (
              <div key={limit.limitKey} className="group animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-slate-50 text-slate-500 flex items-center justify-center group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                      {limit.icon}
                    </div>
                    <label className="text-sm font-black text-slate-800 tracking-tight">
                      {limit.label}
                    </label>
                  </div>
                  {limit.limitValue === -1 && (
                    <Chip
                      label="UNLIMITED QUOTA"
                      size="small"
                      icon={<InfinityIcon size={12} />}
                      className="bg-indigo-600 text-white font-black text-[9px] uppercase tracking-widest px-2"
                    />
                  )}
                </div>

                <div className="flex gap-3">
                  <div className="relative flex-1">
                    <input
                      type="number"
                      className="w-full h-14 bg-slate-50 border border-slate-100 rounded-2xl px-5 text-lg font-black text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none"
                      value={limit.limitValue}
                      onChange={(e) => handleValueChange(limit.limitKey, e.target.value)}
                      placeholder="Quota amount..."
                      disabled={!isAdmin}
                    />
                  </div>

                  <button
                    onClick={() => handleSetUnlimited(limit.limitKey)}
                    disabled={!isAdmin}
                    className={`h-14 px-6 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${
                      limit.limitValue === -1
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
                        : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                    } ${!isAdmin ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    Unlimited
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {!isAdmin && limitsData.length === 0 && (
          <div className="text-center py-10 space-y-3">
            <AlertTriangle className="mx-auto text-amber-500" size={32} />
            <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">
              Admin access required
            </p>
          </div>
        )}

        {isAdmin && !isLoading && error && (
          <Alert severity="error">
            Failed to load limits. {String(error?.message || '')}
          </Alert>
        )}
      </div>
    </Modal>
  );
};

export default PlanLimitsModal;