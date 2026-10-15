import "server-only";
import nodemailer from "nodemailer";

export async function sendVerificationEmail(to: string, code: string) {
  const host = process.env.SMTP_HOST;

  // Development shortcut: with no SMTP settings, print the code in the terminal
  if (!host) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("SMTP is not configured (SMTP_HOST, SMTP_USER, SMTP_PASS).");
    }
    console.log(`\n[mail] Verification code for ${to}: ${code}\n`);
    return;
  }

  const port = Number(process.env.SMTP_PORT ?? 465);

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465, // 465 = SSL, 587 = STARTTLS
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const appName = "DevCommunity";

  await transporter.sendMail({
    from: process.env.MAIL_FROM ?? process.env.SMTP_USER,
    to,
    subject: `${code} is your ${appName} verification code`,
    text: `Your ${appName} verification code is ${code}. It expires in 10 minutes. If you didn't request it, you can ignore this email.`,
    html: `
      <div style="font-family:Arial,Helvetica,sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;background:#0f1629;color:#e2e8f0;border-radius:16px">
        <h1 style="margin:0 0 8px;font-size:20px;color:#ffffff">${appName}</h1>
        <p style="margin:0 0 24px;font-size:14px;color:#94a3b8">Confirm your email address</p>

        <p style="margin:0 0 12px;font-size:14px">Enter this code to finish signing up:</p>

        <div style="margin:0 0 24px;padding:16px;text-align:center;font-size:34px;font-weight:bold;letter-spacing:10px;color:#ffffff;background:#1e293b;border-radius:12px">
          ${code}
        </div>

        <p style="margin:0;font-size:12px;line-height:1.6;color:#94a3b8">
          This code expires in 10 minutes. If you didn't create an account, you can safely ignore this email.
        </p>
      </div>
    `,
  });
}