import { db } from './firebaseAdmin.js';
import { claimEmailDelivery, getServerPdfSnapshot, issueServerPdfToken, markEmailDelivered, markEmailDeliveryFailed } from './serverPdf.js';

async function generatePdfFromPublicApp(paymentId) {
  const appUrl = String(process.env.APP_URL || 'https://cvmaker-azure.vercel.app').replace(/\/$/, '');
  const token = issueServerPdfToken(paymentId);
  const target = `${appUrl}/#server-pdf=${encodeURIComponent(token)}&paymentId=${encodeURIComponent(paymentId)}`;

  const { default: chromium } = await import('@sparticuz/chromium');
  const { default: puppeteer } = await import('puppeteer-core');
  chromium.setGraphicsMode = false;

  const browser = await puppeteer.launch({
    args: chromium.args,
    defaultViewport: { width: 1280, height: 900, deviceScaleFactor: 1 },
    executablePath: await chromium.executablePath(),
    headless: chromium.headless,
  });

  try {
    const page = await browser.newPage();
    await page.goto(target, { waitUntil: 'networkidle2', timeout: 15000 });
    await page.waitForSelector('#resume-document', { timeout: 12000 });
    await page.waitForFunction(() => document.documentElement.dataset.cvmakerPdfReady === 'true', { timeout: 12000 });
    await page.evaluate(() => document.fonts?.ready);
    await new Promise((resolve) => setTimeout(resolve, 250));
    await page.evaluate(() => {
      const resume = document.getElementById('resume-document');
      if (!resume) throw new Error('Resume document was not rendered.');
      document.body.innerHTML = resume.outerHTML;
      document.documentElement.style.margin = '0';
      document.documentElement.style.padding = '0';
      document.body.style.margin = '0';
      document.body.style.padding = '0';
      document.body.style.background = '#fff';
      const style = document.createElement('style');
      style.textContent = '@page{size:auto;margin:0}html,body{width:max-content;min-width:0}#resume-document{margin:0!important}';
      document.head.appendChild(style);
    });
    return await page.pdf({
      printBackground: true,
      preferCSSPageSize: true,
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
    });
  } finally {
    await browser.close();
  }
}

function esc(v) {
  return String(v || '').replace(/[<>&"']/g, (c) => ({ '<':'&lt;', '>':'&gt;', '&':'&amp;', '"':'&quot;', "'":'&#39;' }[c]));
}

export async function deliverPaidResumeEmail(paymentId) {
  const resendKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL;
  if (!resendKey || !fromEmail) throw new Error('Email delivery is not configured yet. Add RESEND_API_KEY and RESEND_FROM_EMAIL in Vercel.');

  const info = await getServerPdfSnapshot(paymentId);
  if (!info?.snapshot) throw new Error('Resume snapshot is missing for this paid order.');
  const customerEmail = String(info.customerEmail || '').trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)) throw new Error('Customer email is missing or invalid.');

  const claimed = await claimEmailDelivery(paymentId);
  if (!claimed) return { alreadySentOrInProgress: true, email: customerEmail };

  try {
    const pdf = await generatePdfFromPublicApp(paymentId);
    const filename = `${String(info.snapshot.resumeData?.fullName || 'Resume').replace(/\s+/g, '_').replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 80) || 'Resume'}_CV.pdf`;
    const name = esc(info.customerName || info.snapshot.resumeData?.fullName || 'there');
    const templateName = esc(info.templateName || 'Premium Resume');
    const orderId = esc(info.orderId || '');
    const amount = `₹${(Number(info.amountPaise || 0) / 100).toFixed(0)}`;
    const appUrl = String(process.env.APP_URL || 'https://cvmaker-azure.vercel.app').replace(/\/$/, '');
    const paymentDate = new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Kolkata' }).format(new Date());

    const html = `<!doctype html><html><body style="margin:0;background:#f5f7fb;font-family:Arial,Helvetica,sans-serif;color:#17233c"><div style="max-width:760px;margin:24px auto;background:#fff;border:1px solid #e5e7eb;border-radius:18px;overflow:hidden"><div style="background:linear-gradient(135deg,#2563eb,#1d4ed8);padding:28px 34px;color:#fff"><div style="font-size:28px;font-weight:900">CV<span style="color:#facc15">Maker</span></div><div style="font-size:13px;opacity:.9;margin-top:4px">Resume Builder</div></div><div style="padding:30px 34px"><div style="text-align:center;font-size:42px;color:#16a34a;line-height:1">✓</div><h1 style="text-align:center;font-size:30px;margin:12px 0 8px">Your Resume is Ready!</h1><p style="text-align:center;color:#64748b;font-size:15px;line-height:1.6;margin:0 auto 26px;max-width:580px">Hi ${name}, thank you for your payment. Your premium resume PDF is ready and attached to this email.</p><div style="border:1px solid #e2e8f0;border-radius:14px;overflow:hidden;margin-bottom:18px"><div style="padding:15px 18px;font-size:18px;font-weight:800;border-bottom:1px solid #e2e8f0">▣ &nbsp;Order Details</div><div style="padding:18px"><div style="padding:7px 0"><span style="color:#475569">Template</span><b style="float:right">${templateName}</b></div><div style="padding:7px 0"><span style="color:#475569">Order ID</span><b style="float:right">${orderId}</b></div><div style="padding:7px 0"><span style="color:#475569">Payment Amount</span><b style="float:right">${amount}</b></div><div style="padding:7px 0"><span style="color:#475569">Payment Date</span><b style="float:right">${paymentDate}</b></div><div style="padding:7px 0"><span style="color:#475569">Payment Status</span><b style="float:right;color:#15803d;background:#dcfce7;padding:5px 10px;border-radius:999px">Paid</b></div></div></div><div style="background:#ecfdf5;border:1px solid #bbf7d0;border-radius:14px;padding:18px;margin-bottom:20px"><div style="font-size:18px;font-weight:800;color:#15803d">🎁 Your Resume PDF is Attached</div><div style="margin-top:5px;color:#365314;font-size:14px">Please find your clean, watermark-free resume PDF attached with this email.</div></div><div style="text-align:center;margin:22px 0"><a href="${appUrl}" style="display:inline-block;background:#2563eb;color:#fff;text-decoration:none;font-weight:800;padding:15px 28px;border-radius:10px;font-size:16px">Open CVMaker</a></div><div style="background:#eff6ff;border-radius:12px;padding:16px;color:#1e40af"><b>Need Help?</b><div style="margin-top:4px;color:#475569;font-size:13px">If you have any questions, please reply to this email.</div></div></div><div style="border-top:1px solid #e2e8f0;padding:20px;text-align:center;color:#64748b;font-size:12px">Thank you for using CVMaker!<br>© ${new Date().getFullYear()} CVMaker. All rights reserved.</div></div></body></html>`;

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: fromEmail,
        to: [customerEmail],
        subject: 'Your CV is Ready – Download & PDF Attached',
        html,
        attachments: [{ filename, content: Buffer.from(pdf).toString('base64'), content_type: 'application/pdf' }],
        headers: { 'X-Entity-Ref-ID': paymentId },
      }),
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result?.message || result?.error?.message || 'Email could not be sent.');
    await markEmailDelivered(paymentId, result?.id || null);
    return { success: true, email: customerEmail, emailId: result?.id || null };
  } catch (error) {
    await markEmailDeliveryFailed(paymentId);
    throw error;
  }
}
