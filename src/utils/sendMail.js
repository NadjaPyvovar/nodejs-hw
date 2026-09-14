import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: Number(process.env.SMTP_PORT) === 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

export const sendEmail = async (options) => {
  return transporter.sendMail({
    from: process.env.SMTP_FROM,
    ...options,
  });
};

// note: secure must be only true for port 465 (i.e. implicit TLS); Brevo/SendGrid standard port 587 uses STARTTLS which nodemail negotiates automatically when secure: false; sendEmail({to, subject, html}) is reusable utility; from is injected centrally, so callers only supply the per-emails field 
