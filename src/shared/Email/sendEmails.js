import { Resend } from "resend";

// Initialize Resend lazily to ensure env vars are loaded
let resend = null;

const getResendClient = () => {
  if (!resend) {
    if (!process.env.RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY environment variable is not set");
    }
    resend = new Resend(process.env.RESEND_API_KEY);
  }
  return resend;
};

const sendEmail = async (options) => {
  const client = getResendClient();

  const { data, error } = await client.emails.send({
    from: "Glitci <operations@glitci.com>",
    to: options.email,
    subject: options.subject,
    html: options.message,
  });

  if (error) {
    console.error("Resend error:", error);
    throw new Error(`Failed to send email: ${error.message}`);
  }

  return data;
};

export default sendEmail;
