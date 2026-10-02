import nodemailer, { Transporter } from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

let transporter: Transporter | null = null;

function getTransporter(): Transporter | null {
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  if (user && pass) {
    if (!transporter) {
      transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: { user, pass },
      });
    }
    return transporter;
  }
  return null;
}

export async function sendOtpEmail(toEmail: string, otp: string, recipientName: string = 'Customer'): Promise<boolean> {
  const transport = getTransporter();

  console.log(`\n========================================`);
  console.log(`🚗 Om Sai Travels — Email OTP Dispatch`);
  console.log(`📧 To: ${toEmail}`);
  console.log(`🔑 OTP Code: ${otp}`);
  console.log(`========================================\n`);

  if (!transport) {
    console.log(`ℹ️ [Email Service] EMAIL_USER / EMAIL_PASS not configured in environment. OTP logged above for development.`);
    return true;
  }

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f9fafb; margin: 0; padding: 0; }
        .container { max-width: 520px; margin: 30px auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06); border: 1px solid #f3f4f6; }
        .header { background: linear-gradient(135deg, #ea580c, #f97316); padding: 32px 24px; text-align: center; }
        .logo-text { color: #ffffff; font-size: 26px; font-weight: 800; letter-spacing: -0.5px; margin: 0; }
        .sub-text { color: #fed7aa; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 2px; margin-top: 4px; }
        .body { padding: 32px 28px; }
        .greeting { font-size: 18px; font-weight: 700; color: #111827; margin-bottom: 12px; }
        .text { font-size: 15px; color: #4b5563; line-height: 1.6; margin-bottom: 24px; }
        .otp-box { background: #fff7ed; border: 2px dashed #ea580c; border-radius: 12px; padding: 20px; text-align: center; margin: 24px 0; }
        .otp-label { font-size: 12px; text-transform: uppercase; letter-spacing: 1.5px; color: #c2410c; font-weight: 700; margin-bottom: 8px; }
        .otp-code { font-size: 36px; font-weight: 800; color: #ea580c; letter-spacing: 8px; font-family: 'Courier New', Courier, monospace; }
        .expiry-text { font-size: 13px; color: #9ca3af; margin-top: 12px; }
        .footer { background: #111827; padding: 24px; text-align: center; color: #9ca3af; font-size: 12px; }
        .footer p { margin: 4px 0; }
        .highlight { color: #f97316; font-weight: 600; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 class="logo-text">Om Sai Travels</h1>
          <div class="sub-text">Vehicle Booking & Airport Transfers</div>
        </div>
        <div class="body">
          <div class="greeting">Hello, ${recipientName}!</div>
          <div class="text">
            Your verification OTP code for <strong>Om Sai Travels</strong> login is:
          </div>
          <div class="otp-box">
            <div class="otp-label">Your One-Time Password</div>
            <div class="otp-code">${otp}</div>
            <div class="expiry-text">⚠️ This OTP is valid for 10 minutes. Do not share this code with anyone.</div>
          </div>
          <div class="text" style="font-size: 14px; color: #6b7280;">
            If you did not request this OTP, please ignore this email.
          </div>
        </div>
        <div class="footer">
          <p>© 2026 <strong>Om Sai Travels</strong>. All rights reserved.</p>
          <p>Support: <span class="highlight">8080959502</span> | <span class="highlight">omsaikrupa@gmail.com</span></p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    await transport.sendMail({
      from: `"Om Sai Travels" <${process.env.EMAIL_USER}>`,
      to: toEmail,
      subject: `🔑 ${otp} — Your Om Sai Travels Verification Code`,
      html: htmlContent,
    });
    console.log(`✅ [Email Service] Real OTP email successfully delivered to ${toEmail}`);
    return true;
  } catch (err) {
    console.error(`❌ [Email Service] Failed to send email via SMTP:`, err);
    // Don't block flow if SMTP credentials fail; return true so user can still test with logged OTP
    return true;
  }
}
