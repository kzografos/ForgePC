import nodemailer from "nodemailer";
import { Resend } from "resend";

// Environment detection
const isDev = process.env.NODE_ENV !== "production";

// Runtime config
const config = useRuntimeConfig();

// Mailtrap transporter for development
const getMailtrapTransporter = () => {
  return nodemailer.createTransport({
    host: config.mailtrapHost || "sandbox.smtp.mailtrap.io",
    port: parseInt(config.mailtrapPort || "587"),
    auth: {
      user: config.mailtrapUser,
      pass: config.mailtrapPass,
    },
  });
};

// Resend client for production
const getResendClient = () => {
  return new Resend(config.resendApiKey);
};

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

/**
 * Send email using appropriate service based on environment
 */
export async function sendEmail(
  options: EmailOptions,
): Promise<{ success: boolean; error?: string }> {
  const fromAddress = options.from || "ForgePC <noreply@forgepc.com>";

  try {
    if (isDev) {
      // Use Mailtrap in development
      const transporter = getMailtrapTransporter();
      await transporter.sendMail({
        from: fromAddress,
        to: options.to,
        subject: options.subject,
        html: options.html,
      });
      console.log(`[DEV] Email sent to ${options.to} via Mailtrap`);
    } else {
      // Use Resend in production
      const resend = getResendClient();
      await resend.emails.send({
        from: fromAddress,
        to: options.to,
        subject: options.subject,
        html: options.html,
      });
      console.log(`[PROD] Email sent to ${options.to} via Resend`);
    }
    return { success: true };
  } catch (error: any) {
    console.error("Failed to send email:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Send welcome email to new newsletter subscriber
 */
export async function sendWelcomeEmail(
  email: string,
): Promise<{ success: boolean; error?: string }> {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; background-color: #0f172a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <tr>
          <td style="background: linear-gradient(135deg, #1e1b4b 0%, #312e81 100%); border-radius: 16px; padding: 40px; text-align: center;">
            <!-- Logo/Brand -->
            <div style="margin-bottom: 24px;">
              <span style="display: inline-block; padding: 8px 12px; background-color: rgba(139, 92, 246, 0.2); border-radius: 8px;">
                <span style="font-size: 24px;">✨</span>
              </span>
              <span style="color: #ffffff; font-size: 24px; font-weight: bold; margin-left: 8px; vertical-align: middle;">ForgePC</span>
            </div>
            
            <!-- Heading -->
            <h1 style="color: #ffffff; font-size: 28px; font-weight: bold; margin: 0 0 16px 0;">
              Welcome to the Family! 🎉
            </h1>
            
            <!-- Body text -->
            <p style="color: #94a3b8; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
              Thank you for subscribing to our newsletter. You're now part of an exclusive community that gets first access to:
            </p>
            
            <!-- Benefits list -->
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px;">
              <tr>
                <td style="padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.1);">
                  <span style="color: #a78bfa;">🚀</span>
                  <span style="color: #e2e8f0; margin-left: 8px;">New product launches</span>
                </td>
              </tr>
              <tr>
                <td style="padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.1);">
                  <span style="color: #a78bfa;">💰</span>
                  <span style="color: #e2e8f0; margin-left: 8px;">Exclusive discounts & deals</span>
                </td>
              </tr>
              <tr>
                <td style="padding: 12px 0;">
                  <span style="color: #a78bfa;">📦</span>
                  <span style="color: #e2e8f0; margin-left: 8px;">Early access to sales</span>
                </td>
              </tr>
            </table>
            
            <!-- CTA Button -->
            <a href="${process.env.NUXT_PUBLIC_SITE_URL || "https://forgepc-store.vercel.app"}/products"
               style="display: inline-block; padding: 14px 32px; background-color: #8b5cf6; color: #ffffff; text-decoration: none; border-radius: 12px; font-weight: 600; font-size: 16px;">
              Browse Products
            </a>
            
            <!-- Footer -->
            <p style="color: #64748b; font-size: 12px; margin-top: 32px;">
              You're receiving this email because you subscribed to our newsletter.<br>
              © ${new Date().getFullYear()} ForgePC. All rights reserved.
            </p>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject: "Welcome to ForgePC! 🎉",
    html,
  });
}
