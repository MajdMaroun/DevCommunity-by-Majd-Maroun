import nodemailer from "nodemailer";

const smtpPort = Number(process.env.SMTP_PORT || 587);

const transporter = nodemailer.createTransport({
host: process.env.SMTP_HOST || "smtp.gmail.com",
port: smtpPort,
secure: smtpPort === 465,
auth: {
user: process.env.SMTP_USER,
pass: process.env.SMTP_PASS,
},
});

export async function sendVerificationEmail(
email: string,
code: string
) {
if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
throw new Error("SMTP credentials are missing from .env.local");
}

await transporter.sendMail({
from: process.env.SMTP_FROM || process.env.SMTP_USER,
to: email,
subject: "Verify your DevCommunity account",
text: `Your DevCommunity verification code is ${code}. It expires in 10 minutes.`,
html: `       <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; padding: 24px;">         <h2>Verify your DevCommunity account</h2>         <p>Use the following code to verify your email address:</p>         <div style="font-size: 32px; font-weight: bold; letter-spacing: 8px; padding: 16px 0;">
          ${code}         </div>         <p>This code expires in 10 minutes.</p>         <p>If you did not create this account, you can ignore this email.</p>       </div>
    `,
});
}
