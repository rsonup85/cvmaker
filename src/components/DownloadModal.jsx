import React, { useEffect, useState } from "react";
import { Check, AlertCircle } from "lucide-react";
import { getTemplateById } from "../data/templates";
import { getPriceForTemplate, setPricingCache } from "../data/pricing";
import { createRazorpayOrder, getPricing, verifyRazorpayPayment } from "../lib/serverApi";

export function DownloadModal({ isOpen, onClose, onDownloadPDF, selectedTemplateId, resumeEmail, resumeName, resumeData, designSettings }) {
  const [paying, setPaying] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [serverPricing, setServerPricing] = useState(null);

  useEffect(() => {
    if (!isOpen) return;
    getPricing().then((data) => { setServerPricing(data); setPricingCache(data); }).catch(() => {});
  }, [isOpen]);

  if (!isOpen) return null;
  const tpl = getTemplateById(selectedTemplateId);
  const local = getPriceForTemplate(selectedTemplateId, getTemplateById);
  const override = serverPricing?.templates?.[selectedTemplateId];
  const serverPrice = override ? (override.free ? 0 : Number(override.price)) : tpl?.category === "Basic" ? Number(serverPricing?.basic ?? local.price) : Number(serverPricing?.professional ?? local.price);
  const isFree = Boolean(override?.free) || serverPrice === 0;
  const paidTier = { ...local, price: isFree ? 0 : serverPrice, free: isFree };

  const handleFreeDownload = async () => {
    setErrorMsg(""); setPaying(true);
    try { onDownloadPDF(true); onClose(); } finally { setPaying(false); }
  };

  const handlePaidDownload = async () => {
    setErrorMsg(""); setPaying(true);
    try {
      if (!window.Razorpay) throw new Error("Razorpay checkout load nahi hui. Page refresh karke try karo.");
      const order = await createRazorpayOrder({
        templateId: selectedTemplateId,
        product: "template",
        customerEmail: String(resumeEmail || '').trim(),
        customerName: String(resumeName || '').trim(),
        resumeData,
        designSettings,
      });
      if (order.free) { onDownloadPDF(true); onClose(); return; }
      const options = {
        key: order.keyId,
        amount: order.amount,
        currency: order.currency || "INR",
        name: "CV Maker AI",
        description: `${order.templateName} – 1 Resume Download`,
        order_id: order.orderId,
        theme: { color: "#2563eb" },
        handler: async (response) => {
          try {
            const verified = await verifyRazorpayPayment(response);
            if (!verified.verified) throw new Error("Payment verify nahi hua.");
            await onDownloadPDF(true, verified); onClose();
          } catch (err) {
            setErrorMsg(err?.message || "Payment verification failed. PDF download nahi kiya gaya.");
          } finally { setPaying(false); }
        },
        modal: { ondismiss: () => setPaying(false) },
      };
      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", (response) => { setPaying(false); setErrorMsg(response?.error?.description || "Payment failed."); });
      rzp.open();
    } catch (err) { setPaying(false); setErrorMsg(err?.message || "Order create nahi hua. Firebase/Razorpay configuration check karo."); }
  };

  return <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-5 space-y-4">
      <div className="text-center"><h3 className="text-lg font-black text-slate-900">Download Resume</h3><p className="text-[11px] text-slate-500 mt-0.5">{paidTier.templateName} · {paidTier.category}{isFree ? " · Free" : " · One-time payment"}</p></div>
      {errorMsg && <div className="flex gap-2 items-start bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl p-3"><AlertCircle size={16}/><p>{errorMsg}</p></div>}
      <div className="rounded-2xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-center shadow-sm animate-pulse">
        <div className="text-sm font-black text-amber-800">💡 मेरे प्यारे भाई और बहन ❤️</div>
        <div className="mt-0.5 text-[11px] font-semibold text-amber-700">Payment करने से पहले एक बार अपना Resume अच्छे से check कर लो।</div>
      </div>
      <div className={`border-2 rounded-2xl p-4 space-y-3 ${isFree ? "border-emerald-500 bg-emerald-50/40" : "border-blue-600 bg-blue-50/40"}`}>
        <div className="flex items-center justify-between"><span className="font-bold text-sm">{paidTier.title}</span><span className={`font-black text-xl ${isFree ? "text-emerald-600" : "text-blue-600"}`}>{isFree ? "FREE" : `₹${paidTier.price}`}</span></div>
        <p className="text-xs text-slate-600">{paidTier.desc}</p>
        <ul className="text-[11px] text-slate-600 space-y-1"><li className="flex gap-1.5"><Check size={12}/> No watermark</li><li className="flex gap-1.5"><Check size={12}/> HD / Print ready</li><li className="flex gap-1.5"><Check size={12}/> One-time for this resume only</li></ul>
        <button onClick={isFree ? handleFreeDownload : handlePaidDownload} disabled={paying} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl text-sm disabled:opacity-60">{paying ? "Processing…" : isFree ? "Download Free PDF" : `Pay ₹${paidTier.price} & Download`}</button>
      </div>
      <button onClick={onClose} disabled={paying} className="w-full text-xs font-semibold text-slate-500 py-2">Cancel</button>
    </div>
  </div>;
}
