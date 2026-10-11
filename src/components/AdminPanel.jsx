import React, { useEffect, useState } from "react";
import { Lock, LogOut, Save, RotateCcw, Shield, IndianRupee, Eye, EyeOff, CheckCircle2, LayoutTemplate, AlertCircle } from "lucide-react";
import { auth } from "../lib/firebase";
import { getPricing, getAdminStatus, savePricing, resetPricing, getLaunchConfig, saveLaunchConfig } from "../lib/serverApi";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { TEMPLATES_CONFIG } from "../data/templates";
import { setPricingCache } from "../data/pricing";

const ADMIN_EMAIL_KEY = "cvmaker_admin_email";

export function AdminPanel({ isOpen, onClose }) {
  const [authed, setAuthed] = useState(false);
  const [email, setEmail] = useState(() => { try { return localStorage.getItem(ADMIN_EMAIL_KEY) || ""; } catch { return ""; } });
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [basic, setBasic] = useState(9);
  const [professional, setProfessional] = useState(21);
  const [customClone, setCustomClone] = useState(40);
  const [templateMap, setTemplateMap] = useState({});
  const [savedMsg, setSavedMsg] = useState("");
  const [grandLaunchEnabled, setGrandLaunchEnabled] = useState(false);
  const [launchSaving, setLaunchSaving] = useState(false);

  const loadState = async () => {
    const data = await getPricing();
    setPricingCache(data);
    setBasic(data.basic); setProfessional(data.professional); setCustomClone(data.customClone);
    const map = {};
    TEMPLATES_CONFIG.forEach((t) => {
      const override = data.templates?.[t.id];
      const categoryPrice = t.category === "Basic" ? data.basic : data.professional;
      map[t.id] = { price: override ? override.price : categoryPrice, free: Boolean(override?.free), useCustom: Boolean(override) };
    });
    setTemplateMap(map);
    try {
      const launch = await getLaunchConfig();
      setGrandLaunchEnabled(Boolean(launch?.grandLaunchEnabled));
    } catch (_) {}
  };

  useEffect(() => {
    if (!isOpen) return;
    if (auth.currentUser) {
      auth.currentUser.getIdToken(true).then(() => getAdminStatus()).then((s) => { if (s.admin) { setAuthed(true); loadState().catch(() => {}); } }).catch(() => {});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleLogin = async (e) => {
    e.preventDefault(); setLoading(true); setLoginError("");
    try {
      const credential = await signInWithEmailAndPassword(auth, email.trim(), password);
      await credential.user.getIdToken(true);
      const status = await getAdminStatus();
      if (!status.admin) {
        await signOut(auth);
        throw new Error("Is Firebase account par admin permission nahi hai.");
      }
      try { localStorage.setItem(ADMIN_EMAIL_KEY, credential.user.email || email.trim()); } catch {}
      setAuthed(true); setPassword(""); await loadState();
    } catch (err) {
      setLoginError(err?.message || "Login failed. Firebase Auth details check karo.");
    } finally { setLoading(false); }
  };

  const handleLogout = async () => { await signOut(auth).catch(() => {}); setAuthed(false); };

  const updateTemplate = (id, patch) => setTemplateMap((prev) => ({ ...prev, [id]: { ...prev[id], ...patch } }));

  const handleSave = async () => {
    setLoading(true); setSavedMsg("");
    try {
      const templates = {};
      Object.entries(templateMap).forEach(([id, val]) => {
        if (val.useCustom || val.free) templates[id] = { price: val.free ? 0 : Math.max(1, Math.round(Number(val.price) || 1)), free: Boolean(val.free) };
      });
      const data = await savePricing({ basic, professional, customClone, templates });
      setPricingCache(data); await loadState(); setSavedMsg("Pricing securely Firebase me save ho gayi ✓");
    } catch (err) { setSavedMsg(err?.message || "Save failed"); }
    finally { setLoading(false); setTimeout(() => setSavedMsg(""), 3500); }
  };

  const handleLaunchToggle = async (next) => {
    setLaunchSaving(true);
    try {
      const data = await saveLaunchConfig({ grandLaunchEnabled: next });
      setGrandLaunchEnabled(Boolean(data?.grandLaunchEnabled));
      setSavedMsg(next ? "Grand Launch ON — public website par animation active ✓" : "Grand Launch OFF — permanently public website se band ✓");
    } catch (err) {
      setSavedMsg(err?.message || "Grand Launch setting save failed");
    } finally {
      setLaunchSaving(false);
      setTimeout(() => setSavedMsg(""), 4500);
    }
  };

  const handleReset = async () => {
    setLoading(true);
    try { const data = await resetPricing(); setPricingCache(data); await loadState(); setSavedMsg("Default pricing restore ho gayi ✓"); }
    catch (err) { setSavedMsg(err?.message || "Reset failed"); }
    finally { setLoading(false); setTimeout(() => setSavedMsg(""), 3500); }
  };

  return <div className="fixed inset-0 z-[100] bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden max-h-[92vh] flex flex-col">
      <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2"><Shield size={20} className="text-amber-400" /><div><h2 className="font-bold text-sm">Master Admin</h2><p className="text-[10px] text-slate-400">Firebase-secured pricing control</p></div></div>
        <button onClick={onClose} className="text-slate-400 hover:text-white text-xs font-semibold px-2 py-1">Close</button>
      </div>

      {!authed ? <form onSubmit={handleLogin} className="p-6 space-y-4">
        <div className="text-center"><div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-100 mb-3"><Lock size={22} className="text-slate-600" /></div><p className="text-sm text-slate-600">Firebase Admin account se login karo.</p></div>
        <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Admin email" className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm" autoFocus />
        <div className="relative"><input type={showPass ? "text" : "password"} required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm pr-10" /><button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">{showPass ? <EyeOff size={16}/> : <Eye size={16}/>}</button></div>
        {loginError && <div className="flex gap-2 text-xs text-red-700 bg-red-50 border border-red-200 rounded-xl p-3"><AlertCircle size={15}/><span>{loginError}</span></div>}
        <button disabled={loading} className="w-full bg-slate-900 text-white font-semibold py-2.5 rounded-xl text-sm disabled:opacity-60">{loading ? "Checking…" : "Login"}</button>
      </form> : <div className="flex flex-col flex-1 min-h-0">
        <div className="px-4 pt-3 flex items-center justify-between"><p className="text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full font-medium">Admin verified</p><button onClick={handleLogout} className="flex items-center gap-1 text-xs text-slate-500 hover:text-red-600"><LogOut size={14}/> Logout</button></div>
        <div className="p-4 space-y-4 overflow-y-auto flex-1">
          <div className="rounded-xl border border-blue-100 bg-blue-50 p-3 text-[11px] text-blue-800">Pricing ab browser/localStorage se control nahi hoti. Razorpay order ka final amount hamesha Firebase server Firestore se aayega.</div>
          <div className={`rounded-2xl border p-4 ${grandLaunchEnabled ? "border-emerald-200 bg-gradient-to-br from-slate-950 to-slate-800 text-white" : "border-slate-200 bg-slate-50"}`}>
            <div className="flex items-center justify-between gap-3">
              <div><div className="text-sm font-extrabold flex items-center gap-2">✨ GRAND LAUNCH</div><p className={`text-[10px] mt-1 ${grandLaunchEnabled ? "text-slate-300" : "text-slate-500"}`}>VIP cinematic opening animation for public visitors</p></div>
              <button type="button" disabled={launchSaving} onClick={() => handleLaunchToggle(!grandLaunchEnabled)} aria-pressed={grandLaunchEnabled} className={`relative w-16 h-9 rounded-full transition ${grandLaunchEnabled ? "bg-emerald-500" : "bg-slate-300"}`}><span className={`absolute top-1 w-7 h-7 rounded-full bg-white shadow transition-transform ${grandLaunchEnabled ? "translate-x-8" : "translate-x-1"}`}/></button>
            </div>
            <div className={`mt-3 text-[10px] rounded-xl px-3 py-2 ${grandLaunchEnabled ? "bg-white/10 text-slate-200" : "bg-white text-slate-600 border border-slate-200"}`}>
              {grandLaunchEnabled ? "🟢 ON: Website open hote hi 5-second Grand Launch sequence chalega." : "🔴 OFF: Grand Launch completely disabled. Website directly app kholegi."}
            </div>
            <div className={`mt-2 text-[9px] ${grandLaunchEnabled ? "text-slate-400" : "text-slate-500"}`}>Setting Firebase/server par save hoti hai — browser cache ya localStorage par depend nahi karti.</div>
          </div>
          <PriceField label="Basic Template" value={basic} onChange={setBasic}/><PriceField label="Professional Template" value={professional} onChange={setProfessional}/><PriceField label="Custom Template Clone" value={customClone} onChange={setCustomClone}/>
          <div className="space-y-3"><div className="text-xs font-bold text-slate-800 flex items-center gap-1"><LayoutTemplate size={14}/> Per-template overrides</div>
            {TEMPLATES_CONFIG.map((t) => { const row = templateMap[t.id] || {price:t.category === "Basic" ? basic : professional, free:false, useCustom:false}; return <div key={t.id} className="border border-slate-200 rounded-xl p-3 space-y-2">
              <div className="flex items-center justify-between"><div><div className="text-xs font-bold text-slate-800">{t.name}</div><div className="text-[10px] text-slate-400">{t.category} · {t.id}</div></div><label className="text-[10px] font-semibold text-emerald-700"><input type="checkbox" checked={row.free} onChange={(e)=>updateTemplate(t.id,{free:e.target.checked,useCustom:true,price:e.target.checked?0:row.price})}/> Free</label></div>
              <div className="flex gap-2 items-center"><label className="text-[10px] text-slate-500"><input type="checkbox" checked={row.useCustom || row.free} onChange={(e)=>updateTemplate(t.id,{useCustom:e.target.checked,free:e.target.checked?row.free:false})}/> Custom</label><div className="relative flex-1"><IndianRupee size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400"/><input type="number" min="1" max="99999" disabled={row.free || !row.useCustom} value={row.free?0:row.price} onChange={(e)=>updateTemplate(t.id,{price:e.target.value===""?"":Number(e.target.value),useCustom:true})} className="w-full border rounded-lg pl-7 pr-2 py-1.5 text-xs"/></div></div>
            </div>; })}
          </div>
          {savedMsg && <div className="flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 rounded-xl px-3 py-2"><CheckCircle2 size={14}/>{savedMsg}</div>}
        </div>
        <div className="p-4 border-t flex gap-2"><button disabled={loading} onClick={handleSave} className="flex-1 flex items-center justify-center gap-1.5 bg-blue-600 text-white font-semibold py-2.5 rounded-xl text-sm disabled:opacity-60"><Save size={16}/> Save to Firebase</button><button disabled={loading} onClick={handleReset} className="flex items-center gap-1.5 border px-3 rounded-xl text-sm"><RotateCcw size={15}/> Reset</button></div>
      </div>}
    </div>
  </div>;
}

function PriceField({ label, value, onChange }) { return <div><label className="block text-xs font-semibold text-slate-700 mb-1">{label}</label><div className="relative"><IndianRupee size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/><input type="number" min="1" max="99999" value={value} onChange={(e)=>onChange(Math.max(1, Math.min(99999, Number(e.target.value)||1)))} className="w-full border border-slate-200 rounded-xl pl-8 pr-3 py-2.5 text-sm font-semibold"/></div></div>; }

export function useAdminTrigger() {
  const [adminOpen, setAdminOpen] = useState(false);
  const [clickCount, setClickCount] = useState(0);
  useEffect(() => { const check=()=>{if(window.location.hash==="#admin")setAdminOpen(true)}; check(); window.addEventListener("hashchange",check); return()=>window.removeEventListener("hashchange",check); },[]);
  const onLogoClick=()=>{setClickCount(c=>{const n=c+1;if(n>=5){setAdminOpen(true);return 0}return n});clearTimeout(window.__adminClickTimer);window.__adminClickTimer=setTimeout(()=>setClickCount(0),2000)};
  const closeAdmin=()=>{setAdminOpen(false);if(window.location.hash==="#admin")history.replaceState(null,"",window.location.pathname+window.location.search)};
  return {adminOpen,setAdminOpen,closeAdmin,onLogoClick};
}
