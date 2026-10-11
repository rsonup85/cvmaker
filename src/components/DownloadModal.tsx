/**
 * CVMaker AI - Download & Razorpay Checkout Modal
 * Supports both Free Instant PDF download and Paid Razorpay High-Res PDF checkout.
 */

import React, { useState } from 'react';
import { resolveTemplatePrice } from '../data/pricing';
import { createRazorpayOrder, verifyRazorpayPayment } from '../lib/serverApi';
import { exportElementToPdf, printElementDirectly } from '../lib/pdfExport';
import { 
  Download, X, Check, ShieldCheck, Mail, Sparkles, Printer, 
  CreditCard, RefreshCw, AlertCircle, FileCheck 
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface DownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  templateId: string;
  documentRef: React.RefObject<HTMLDivElement | null>;
  candidateName: string;
  customerEmailDefault?: string;
  snapshotData?: any;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

export const DownloadModal: React.FC<DownloadModalProps> = ({
  isOpen,
  onClose,
  templateId,
  documentRef,
  candidateName,
  customerEmailDefault = '',
  snapshotData
}) => {
  const [customerEmail, setCustomerEmail] = useState<string>(customerEmailDefault);
  const [downloadingFree, setDownloadingFree] = useState<boolean>(false);
  const [processingPaid, setProcessingPaid] = useState<boolean>(false);
  const [paymentSuccess, setPaymentSuccess] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const priceInfo = resolveTemplatePrice(templateId);

  // Free Download Handler
  const handleFreeDownload = async () => {
    if (!documentRef.current) return;
    setDownloadingFree(true);
    setError(null);

    try {
      const cleanName = candidateName.replace(/[^a-zA-Z0-9]/g, '_') || 'Resume';
      await exportElementToPdf(documentRef.current, {
        filename: `${cleanName}_CV.pdf`,
        showWatermark: false
      });
      confetti({ particleCount: 50, spread: 60 });
    } catch (err: any) {
      setError(err?.message || 'Free PDF download encountered an issue.');
    } finally {
      setDownloadingFree(false);
    }
  };

  // Paid High-Res Razorpay Checkout Handler
  const handlePaidCheckout = async () => {
    if (!customerEmail.trim() || !customerEmail.includes('@')) {
      setError('Please provide a valid email address to receive your official High-Res PDF.');
      return;
    }

    setProcessingPaid(true);
    setError(null);

    try {
      // Step 1: Create Order on server
      const orderRes = await createRazorpayOrder({
        templateId,
        customerEmail: customerEmail.trim(),
        customerName: candidateName,
        snapshot: snapshotData
      });

      // If server determined template is free
      if (orderRes.free) {
        await handleFreeDownload();
        return;
      }

      // Step 2: Open Razorpay Checkout modal
      if (typeof window.Razorpay === 'undefined') {
        // Load Razorpay checkout script dynamically if not present
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        await new Promise((resolve, reject) => {
          script.onload = resolve;
          script.onerror = () => reject(new Error('Failed to load Razorpay payment gateway script.'));
          document.body.appendChild(script);
        });
      }

      const options = {
        key: orderRes.keyId,
        amount: orderRes.amount,
        currency: orderRes.currency || 'INR',
        name: 'CV Maker AI',
        description: `Premium High-Res PDF: ${orderRes.templateName || templateId}`,
        order_id: orderRes.orderId,
        prefill: {
          name: candidateName,
          email: customerEmail.trim()
        },
        theme: {
          color: '#d97706'
        },
        handler: async (response: any) => {
          try {
            // Step 3: Server Signature & Capture Verification
            const verifyRes = await verifyRazorpayPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              templateId,
              customerEmail: customerEmail.trim(),
              snapshot: snapshotData
            });

            if (verifyRes.verified) {
              setPaymentSuccess(true);
              confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
              // Also trigger instant local PDF download
              if (documentRef.current) {
                await exportElementToPdf(documentRef.current, {
                  filename: `${candidateName.replace(/[^a-zA-Z0-9]/g, '_')}_Official_CV.pdf`,
                  showWatermark: false
                });
              }
            } else {
              setError('Payment verification failed. Please contact support.');
            }
          } catch (verifyErr: any) {
            setError(verifyErr?.message || 'Payment verification failed on server.');
          } finally {
            setProcessingPaid(false);
          }
        },
        modal: {
          ondismiss: () => {
            setProcessingPaid(false);
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', (resp: any) => {
        setError(resp.error?.description || 'Payment failed or was cancelled.');
        setProcessingPaid(false);
      });
      rzp.open();
    } catch (err: any) {
      setError(err?.message || 'Unable to initialize Razorpay checkout.');
      setProcessingPaid(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 relative space-y-5">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3">
            <Download className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-black text-slate-900">
            Export Document PDF
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Template #{templateId.toUpperCase()} • Ready for A4 Print & ATS Applications
          </p>
        </div>

        {/* Error notification */}
        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Success notification */}
        {paymentSuccess ? (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 space-y-2 text-center">
            <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <Check className="w-5 h-5 stroke-[3]" />
            </div>
            <h4 className="font-bold text-sm">Payment Verified Successfully!</h4>
            <p className="text-xs text-emerald-700">
              Your official high-resolution document has been downloaded and a copy is dispatched to <strong>{customerEmail}</strong>.
            </p>
            <button
              onClick={onClose}
              className="mt-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs"
            >
              Done
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Free Download Option */}
            <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Standard PDF Download</h4>
                  <p className="text-[11px] text-slate-500">Instant browser download (Standard 200 DPI)</p>
                </div>
                <span className="text-xs font-extrabold text-emerald-600 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200">
                  FREE
                </span>
              </div>
              <button
                type="button"
                onClick={handleFreeDownload}
                disabled={downloadingFree}
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2"
              >
                {downloadingFree ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" /> Generating Free PDF...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" /> Download Free PDF
                  </>
                )}
              </button>
            </div>

            {/* Paid High-Res Option */}
            <div className="p-4 rounded-2xl border-2 border-amber-500/30 bg-amber-50/30 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    Ultra High-Res Print PDF + Email Delivery
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    300 DPI vector clarity, zero compression & permanent email backup
                  </p>
                </div>
                <span className="text-xs font-black text-amber-900 px-2.5 py-1 rounded-lg bg-amber-100 border border-amber-300">
                  ₹{priceInfo.priceInRupees}
                </span>
              </div>

              {/* Email Input for delivery */}
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Delivery Email Address
                </label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full pl-8 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={handlePaidCheckout}
                disabled={processingPaid}
                className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2"
              >
                {processingPaid ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" /> Connecting to Razorpay...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4" /> Pay ₹{priceInfo.priceInRupees} via UPI / Card & Download
                  </>
                )}
              </button>
            </div>

            {/* Direct Print Option */}
            <div className="flex justify-center pt-1">
              <button
                type="button"
                onClick={printElementDirectly}
                className="text-xs text-slate-500 hover:text-slate-800 font-semibold flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" /> Direct System Print (Ctrl+P)
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
