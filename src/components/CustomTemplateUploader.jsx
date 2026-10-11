import React, { useRef, useState } from "react";
import { Upload, Sparkles, Lock, AlertCircle } from "lucide-react";
import { getPrices, setPricingCache } from "../data/pricing";
import { createRazorpayOrder, cloneCustomTemplate, verifyRazorpayPayment, getPricing } from "../lib/serverApi";

const MAX_BYTES = 3 * 1024 * 1024;
const TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export function CustomTemplateUploader({ onCustomTemplateReady }) {
  const [image, setImage] = useState(null);
  const [mimeType, setMimeType] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [clonePrice, setClonePrice] = useState(getPrices().customClone);
  const inputRef = useRef(null);

  React.useEffect(() => { getPricing().then((data) => { setPricingCache(data); setClonePrice(data.customClone); }).catch(() => {}); }, []);

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError("");
    if (!TYPES.has(file.type)) { setError("Sirf JPG, PNG ya WebP image allowed hai."); return; }
    if (file.size > MAX_BYTES) { setError("Image maximum 3 MB ki honi chahiye."); return; }
    setMimeType(file.type);
    const reader = new FileReader();
    reader.onloadend = () => setImage(String(reader.result || ""));
    reader.readAsDataURL(file);
  };

  const payAndGenerate = async () => {
    if (!image) return;
    setLoading(true); setError("");
    try {
      if (!window.Razorpay) throw new Error("Razorpay checkout load nahi hui. Page refresh karke try karo.");
      const order = await createRazorpayOrder({ product: "custom", templateId: "custom-clone" });
      const response = await new Promise((resolve, reject) => {
        const rzp = new window.Razorpay({
          key: order.keyId, amount: order.amount, currency: order.currency || "INR", order_id: order.orderId,
          name: "CV Maker AI", description: "AI Custom Resume Template Clone", theme: { color: "#2563eb" },
          handler: resolve, modal: { ondismiss: () => reject(new Error("Payment cancelled.")) },
        });
        rzp.on("payment.failed", (r) => reject(new Error(r?.error?.description || "Payment failed.")));
        rzp.open();
      });
      const verified = await verifyRazorpayPayment(response);
      if (!verified.verified) throw new Error("Payment verification failed.");
      const result = await cloneCustomTemplate({ paymentId: verified.paymentId, entitlementToken: verified.entitlementToken, imageData: image, mimeType });
      onCustomTemplateReady(result.layoutConfig);
    } catch (err) { setError(err?.message || "Custom template generate nahi hua."); }
    finally { setLoading(false); }
  };

  return <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 text-center">
    <h3 className="font-bold text-slate-900 text-base mb-1">Upload Any Resume Template Image</h3>
    <p className="text-xs text-slate-500 mb-4">AI design analysis for ₹{clonePrice}</p>
    {error && <div className="flex gap-2 text-xs text-red-700 bg-red-50 border border-red-200 rounded-xl p-3 mb-3 text-left"><AlertCircle size={15}/><span>{error}</span></div>}
    {!image ? <label className="border-2 border-dashed border-slate-300 hover:border-blue-500 bg-slate-50 rounded-xl p-6 cursor-pointer flex flex-col items-center justify-center"><Upload className="text-slate-400 mb-2" size={28}/><span className="text-xs font-bold text-slate-700">Select JPG / PNG / WebP</span><span className="text-[10px] text-slate-400 mt-1">Maximum 3 MB</span><input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleImageUpload} className="hidden"/></label> : <div className="space-y-4"><img src={image} alt="Uploaded template" className="max-h-40 mx-auto rounded-lg shadow border"/><button onClick={payAndGenerate} disabled={loading} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 text-xs disabled:opacity-60">{loading ? <><Sparkles className="animate-spin" size={16}/> Generating…</> : <><Lock size={14}/> Pay ₹{clonePrice} & Generate Clone</>}</button><button onClick={()=>{setImage(null);setMimeType("");if(inputRef.current)inputRef.current.value=""}} className="text-[11px] text-slate-500">Change image</button></div>}
  </div>;
}
