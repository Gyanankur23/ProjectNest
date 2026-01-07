import nodemailer from "nodemailer";

export async function sendEmail(to: string, subject: string, text: string) {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log(`[MOCK EMAIL] To: ${to}, Subject: ${subject}, Text: ${text}`);
    return;
  }

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail', // or use host/port
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_FROM || "noreply@projectnest.com",
      to,
      subject,
      text,
    });
  } catch (e) {
    console.error("Failed to send email:", e);
  }
}
