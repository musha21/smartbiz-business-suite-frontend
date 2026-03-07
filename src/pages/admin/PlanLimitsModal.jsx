import React, { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Activity,
  Zap,
  Save,
  Info,
  Infinity as InfinityIcon,
  AlertTriangle,
  Package,
  Users as UsersIcon
} from 'lucide-react';
import { CircularProgress, Chip } from '@mui/material';
import { subscriptionService } from '../../api';
import Modal from '../../components/ui/Modal';
import { getRole } from '../../api/auth';

const STANDARD_LIMITS = [
  { key: 'INVOICES_PER_MONTH', label: 'Monthly Invoice Quota', icon: <Activity size={20} /> },
  { key: 'PRODUCTS_LIMIT', label: 'Product Inventory Limit', icon: <Package size={20} /> },
  { key: 'CUSTOMERS_LIMIT', label: 'Customer Database Limit', icon: <UsersIcon size={20} /> },
  { key: 'AI_CREDITS', label: 'AI Generation Credits', icon: <Zap size={20} /> },
];

const PlanLimitsModal = ({ isOpen, onClose, plan }) => {
  const queryClient = useQueryClient();
  const [limitsData, setLimitsData] = useState([]);

  const isAdmin = useMemo(() => getRole() === "ADMIN", []);

  const { data: existingLimits, isLoading } = useQuery({
    queryKey: ['plan-limits', plan?.id],
    queryFn: () => subscriptionService.fetchPlanLimits(plan.id),
    enabled: !!plan?.id && isOpen && isAdmin,
    retry: false
  });

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
      onClose();
    },
    onError: (err) => {
      // Handled globally
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
      return;
    }

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
      title="Infrastructure Quota"
      dark
      onSubmit={handleSave}
      footer={
        <div className="flex gap-4 justify-end">
          <button
            type="button"
            className="px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest text-slate-500 hover:text-white transition-colors"
            onClick={onClose}
          >
            Discard
          </button>
          <button
            type="submit"
            disabled={!isAdmin || mutation.isPending}
            className="px-10 py-4 bg-indigo-600 text-white rounded-[20px] font-black text-xs uppercase tracking-widest hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-600/20 active:scale-95 flex items-center gap-3"
          >
            {mutation.isPending ? <CircularProgress size={16} color="inherit" /> : <Save size={18} />}
            <span>Commit Changes</span>
          </button>
        </div>
      }
    >
      <div className="space-y-10">
        <div className="flex items-center gap-5 pb-6 border-b border-white/5">
          <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center font-black text-indigo-500 text-xl">
            {plan?.name?.[0].toUpperCase() || 'P'}
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] mb-1">Target Tier</p>
            <h3 className="text-xl font-black text-white italic uppercase tracking-tight">{plan?.name}</h3>
          </div>
        </div>

        {!isAdmin && (
          <div className="bg-amber-500/5 border border-amber-500/10 rounded-[20px] p-5 flex items-start gap-4">
            <AlertTriangle size={20} className="text-amber-500 shrink-0" />
            <p className="text-[11px] font-bold text-amber-500/80 uppercase tracking-wide leading-relaxed">
              Authentication Mismatch: Only users with <span className="text-white">Admin Privileges</span> can modify infrastructure quotas.
            </p>
          </div>
        )}

        {isAdmin && isLoading ? (
          <div className="flex flex-col items-center justify-center py-12 gap-4">
            <CircularProgress size={32} sx={{ color: '#6366f1' }} />
            <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Retrieving Quota Manifest...</p>
          </div>
        ) : (
          <div className="space-y-8">
            {limitsData.map((limit) => (
              <div key={limit.limitKey} className="group transition-all">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white/5 text-slate-500 flex items-center justify-center group-hover:bg-indigo-500/10 group-hover:text-indigo-400 transition-all border border-white/5">
                      {limit.icon}
                    </div>
                    <label className="text-[11px] font-black text-white uppercase tracking-widest opacity-70 group-hover:opacity-100 transition-opacity">
                      {limit.label}
                    </label>
                  </div>
                  {limit.limitValue === -1 && (
                    <div className="flex items-center gap-2 bg-indigo-500/10 text-indigo-400 px-3 py-1.5 rounded-lg border border-indigo-500/20">
                      <InfinityIcon size={12} />
                      <span className="text-[9px] font-black uppercase tracking-widest">Infinite</span>
                    </div>
                  )}
                </div>

                <div className="flex gap-4">
                  <div className="relative flex-1 group/input">
                    <input
                      type="number"
                      className="w-full h-16 bg-white/[0.03] border border-white/5 rounded-2xl px-6 text-xl font-black text-white focus:ring-1 focus:ring-indigo-500/50 focus:bg-white/[0.08] transition-all outline-none"
                      value={limit.limitValue}
                      onChange={(e) => handleValueChange(limit.limitKey, e.target.value)}
                      placeholder="Quota amount..."
                      disabled={!isAdmin}
                    />
                  </div>

                  <button
                    onClick={() => handleSetUnlimited(limit.limitKey)}
                    disabled={!isAdmin}
                    className={`h-16 px-8 rounded-2xl font-black text-[10px] uppercase tracking-widest border transition-all ${limit.limitValue === -1
                      ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                      : 'bg-white/5 border-white/5 text-slate-500 hover:text-white hover:bg-white/10'
                      } ${!isAdmin ? 'opacity-30 cursor-not-allowed' : 'active:scale-95'}`}
                  >
                    Unlimited
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
};

export default PlanLimitsModal;