/**
 * CVMaker AI - Email Delivery via Resend
 * Sends high-resolution resume links and receipts for paid orders.
 */

export async function sendPaidDocumentEmail({
  toEmail,
  recipientName,
  templateId,
  orderId,
  paymentId,
  downloadLink
}) {
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'resumes@biodatamaker.store';
  const appUrl = process.env.APP_URL || 'https://www.biodatamaker.store';

  if (!apiKey) {
    console.warn('sendPaidDocumentEmail: RESEND_API_KEY not configured. Email skipped.');
    return {
      attempted: false,
      sent: false,
      message: 'Email delivery not configured in server environment.'
    };
  }

  try {
    const finalDownloadUrl = downloadLink || `${appUrl}/download?order=${orderId}`;

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        from: `CV Maker AI <${fromEmail}>`,
        to: [toEmail],
        subject: `Your Official High-Res Document is Ready (Order #${orderId})`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px;">
            <div style="text-align: center; margin-bottom: 24px;">
              <h1 style="color: #0f172a; margin: 0; font-size: 24px;">CVMaker AI</h1>
              <p style="color: #64748b; margin: 4px 0 0 0; font-size: 14px;">Official High-Resolution Document Delivery</p>
            </div>
            
            <p style="font-size: 15px; color: #334155;">Hello ${recipientName || 'Valued User'},</p>
            <p style="font-size: 14px; color: #334155; line-height: 1.6;">
              Thank you for choosing CVMaker AI. Your payment for Template <strong>#${templateId.toUpperCase()}</strong> has been verified.
            </p>
            
            <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; margin: 20px 0;">
              <p style="margin: 0 0 8px 0; font-size: 13px; color: #64748b;"><strong>Order ID:</strong> ${orderId}</p>
              <p style="margin: 0; font-size: 13px; color: #64748b;"><strong>Payment ID:</strong> ${paymentId}</p>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${finalDownloadUrl}" style="background-color: #0f172a; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 10px; font-weight: bold; font-size: 14px; display: inline-block;">
                Download High-Resolution Document
              </a>
            </div>

            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
            <p style="font-size: 12px; color: #94a3b8; text-align: center; margin: 0;">
              CVMaker AI • Premium Resume & Marriage Biodata Maker • All rights reserved.
            </p>
          </div>
        `
      })
    });

    const data = await response.json();
    if (response.ok) {
      return { attempted: true, sent: true, emailId: data.id };
    } else {
      return { attempted: true, sent: false, error: data.message };
    }
  } catch (err) {
    console.error('sendPaidDocumentEmail error:', err.message);
    return { attempted: true, sent: false, error: err.message };
  }
}
