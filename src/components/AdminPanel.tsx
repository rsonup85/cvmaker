/**
 * CVMaker AI - Admin Pricing & Launch Management Panel
 * Firebase Authenticated (admin === true custom claim required)
 * Supports pagination/search over all 400 template IDs with zero lag.
 */

import React, { useState, useEffect } from 'react';
import { 
  getAdminStatus, 
  getPricing, 
  savePricing, 
  resetPricing, 
  getLaunchConfig, 
  saveLaunchConfig 
} from '../lib/serverApi';
import { auth, signInWithEmailAndPassword, firebaseSignOut } from '../lib/firebase';
import { ALL_TEMPLATES, TemplateConfig } from '../data/catalog';
import { 
  ShieldCheck, X, Search, RefreshCw, Save, RotateCcw, 
  Check, AlertCircle, Lock, ChevronLeft, ChevronRight, Sparkles 
} from 'lucide-react';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const TEMPLATES_PER_PAGE = 20;

export const AdminPanel: React.FC<AdminPanelProps> = ({ isOpen, onClose }) => {
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [checkingAuth, setCheckingAuth] = useState<boolean>(true);
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [authError, setAuthError] = useState<string | null>(null);

  // Pricing State
  const [basicPrice, setBasicPrice] = useState<number>(9);
  const [proPrice, setProPrice] = useState<number>(21);
  const [customPrice, setCustomPrice] = useState<number>(40);
  const [grandLaunch, setGrandLaunch] = useState<boolean>(false);
  const [templateOverrides, setTemplateOverrides] = useState<Record<string, number>>({});
  
  // Search & Pagination in Admin
  const [search, setSearch] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [saving, setSaving] = useState<boolean>(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    checkStatusAndLoad();
  }, [isOpen]);

  const checkStatusAndLoad = async () => {
    setCheckingAuth(true);
    setAuthError(null);
    try {
      const status = await getAdminStatus();
      if (status.admin) {
        setIsAdmin(true);
        await loadPricingData();
      } else {
        setIsAdmin(false);
      }
    } catch {
      setIsAdmin(false);
    } finally {
      setCheckingAuth(false);
    }
  };

  const loadPricingData = async () => {
    try {
      const data = await getPricing();
      if (data.success) {
        setBasicPrice(data.basic ?? 9);
        setProPrice(data.professional ?? 21);
        setCustomPrice(data.customClone ?? 40);
        setGrandLaunch(Boolean(data.grandLaunchEnabled));
        setTemplateOverrides(data.templates || {});
      }
    } catch (err: any) {
      console.warn('Could not load current pricing from server:', err);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    if (!auth) {
      setAuthError('Firebase Auth client is not initialized. Please verify VITE_FIREBASE_* settings.');
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
      await checkStatusAndLoad();
    } catch (err: any) {
      setAuthError(err?.message || 'Login failed. Please verify admin credentials.');
    }
  };

  const handleLogout = async () => {
    if (auth) await firebaseSignOut(auth);
    setIsAdmin(false);
  };

  const handleSave = async () => {
    setSaving(true);
    setStatusMsg(null);
    try {
      await savePricing({
        basic: basicPrice,
        professional: proPrice,
        customClone: customPrice,
        templates: templateOverrides
      });

      await saveLaunchConfig({
        grandLaunchEnabled: grandLaunch
      });

      setStatusMsg({ type: 'success', text: 'Pricing & launch configuration saved successfully!' });
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err?.message || 'Failed to save pricing configuration.' });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (!confirm('Are you sure you want to reset all pricing to standard defaults?')) return;
    setSaving(true);
    setStatusMsg(null);
    try {
      await resetPricing();
      setBasicPrice(9);
      setProPrice(21);
      setCustomPrice(40);
      setGrandLaunch(false);
      setTemplateOverrides({});
      setStatusMsg({ type: 'success', text: 'All prices reset to default successfully!' });
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err?.message || 'Failed to reset pricing.' });
    } finally {
      setSaving(false);
    }
  };

  const filteredTemplates = ALL_TEMPLATES.filter((t) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return t.id.toLowerCase().includes(q) || t.name.toLowerCase().includes(q) || t.type.toLowerCase().includes(q);
  });

  const totalPages = Math.ceil(filteredTemplates.length / TEMPLATES_PER_PAGE) || 1;
  const paginatedList = filteredTemplates.slice((page - 1) * TEMPLATES_PER_PAGE, page * TEMPLATES_PER_PAGE);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base flex items-center gap-2">
                CV Maker AI • Administrator Console
              </h3>
              <p className="text-xs text-slate-400">Manage global pricing, discounts, and template overrides</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {checkingAuth ? (
            <div className="py-12 text-center text-slate-500">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-amber-600" />
              Verifying admin session...
            </div>
          ) : !isAdmin ? (
            <form onSubmit={handleLogin} className="max-w-md mx-auto py-8 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-2">
                <Lock className="w-6 h-6" />
              </div>
              <div className="text-center">
                <h4 className="text-base font-bold text-slate-900">Admin Sign In</h4>
                <p className="text-xs text-slate-500">Sign in with an authorized Firebase Admin account.</p>
              </div>

              {authError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{authError}</span>
                </div>
              )}

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  placeholder="admin@cvmaker.ai"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
              >
                Sign In to Console
              </button>
            </form>
          ) : (
            <div className="space-y-6">
              {statusMsg && (
                <div
                  className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                    statusMsg.type === 'success'
                      ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                      : 'bg-rose-50 border border-rose-200 text-rose-800'
                  }`}
                >
                  {statusMsg.type === 'success' ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                  <span>{statusMsg.text}</span>
                </div>
              )}

              {/* Global Tier Pricing */}
              <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Base Tier Pricing (INR ₹)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs text-slate-600 block mb-1">Basic Templates (₹)</label>
                    <input
                      type="number"
                      min={0}
                      value={basicPrice}
                      onChange={(e) => setBasicPrice(Number(e.target.value))}
                      className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-600 block mb-1">Professional Templates (₹)</label>
                    <input
                      type="number"
                      min={0}
                      value={proPrice}
                      onChange={(e) => setProPrice(Number(e.target.value))}
                      className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-600 block mb-1">Custom Clone (₹)</label>
                    <input
                      type="number"
                      min={0}
                      value={customPrice}
                      onChange={(e) => setCustomPrice(Number(e.target.value))}
                      className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-xl"
                    />
                  </div>
                </div>

                {/* Grand Launch Free Toggle */}
                <div className="pt-2 flex items-center justify-between border-t border-slate-200/60">
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">Grand Launch Free Mode</span>
                    <span className="text-[11px] text-slate-500">Makes all 400+ templates 100% free for promotions</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setGrandLaunch(!grandLaunch)}
                    className={`w-11 h-6 rounded-full transition-colors relative ${
                      grandLaunch ? 'bg-emerald-600' : 'bg-slate-300'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                        grandLaunch ? 'left-6' : 'left-1'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Per-Template Price Overrides */}
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      Individual Template Overrides ({filteredTemplates.length})
                    </h4>
                    <p className="text-[11px] text-slate-500">Search and customize specific prices</p>
                  </div>
                  <div className="relative w-full sm:w-64">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search by ID or name..."
                      value={search}
                      onChange={(e) => {
                        setSearch(e.target.value);
                        setPage(1);
                      }}
                      className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>
                </div>

                <div className="border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100 max-h-72 overflow-y-auto">
                  {paginatedList.map((tmpl) => {
                    const currentOverride = templateOverrides[tmpl.id];
                    return (
                      <div key={tmpl.id} className="p-2.5 px-4 flex items-center justify-between hover:bg-slate-50 text-xs">
                        <div>
                          <span className="font-bold text-slate-900 mr-2">{tmpl.id}</span>
                          <span className="text-slate-600">{tmpl.name}</span>
                          <span className="ml-2 text-[10px] uppercase font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">
                            {tmpl.type}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] text-slate-400">₹</span>
                          <input
                            type="number"
                            min={0}
                            placeholder={String(tmpl.pricingCategory === 'professional' ? proPrice : basicPrice)}
                            value={currentOverride ?? ''}
                            onChange={(e) => {
                              const val = e.target.value === '' ? undefined : Number(e.target.value);
                              const updated = { ...templateOverrides };
                              if (val === undefined) {
                                delete updated[tmpl.id];
                              } else {
                                updated[tmpl.id] = val;
                              }
                              setTemplateOverrides(updated);
                            }}
                            className="w-20 text-xs px-2 py-1 bg-white border border-slate-200 rounded-lg text-right"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Pagination for Admin */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between pt-1 text-xs text-slate-500">
                    <span>Page {page} of {totalPages}</span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="p-1 rounded-lg border border-slate-200 disabled:opacity-40"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        className="p-1 rounded-lg border border-slate-200 disabled:opacity-40"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Actions Footer */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="text-xs font-bold text-slate-500 hover:text-slate-800"
                >
                  Sign Out
                </button>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleReset}
                    disabled={saving}
                    className="px-3 py-2 text-xs font-bold text-rose-600 bg-rose-50 border border-rose-200 rounded-xl hover:bg-rose-100 flex items-center gap-1"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Reset Defaults
                  </button>
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={saving}
                    className="px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl flex items-center gap-1.5 shadow-xs"
                  >
                    {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                    Save Configuration
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
