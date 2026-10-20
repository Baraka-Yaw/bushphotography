import "server-only";

/**
 * Email delivery seam.
 *
 * The spec calls for a serverless form handler, but no provider has been chosen
 * and no API key exists yet. Rather than block the contact form on that decision,
 * this validates and logs, and reports back whether the message was actually
 * delivered — so the UI can be honest instead of showing a success state for a
 * message that went nowhere.
 *
 * To wire up a real provider (Resend shown), replace the body of `sendContactEmail`:
 *
 *   const resend = new Resend(process.env.RESEND_API_KEY);
 *   await resend.emails.send({
 *     from: "site@yourdomain.com",
 *     to: process.env.CONTACT_TO_EMAIL,
 *     replyTo: message.email,
 *     subject: `New enquiry — ${message.projectType}`,
 *     text: body,
 *   });
 *   return { delivered: true };
 *
 * Nothing else in the app changes.
 */

export type ContactMessage = {
  name: string;
  email: string;
  /** Optional — the form does not require it. */
  phone?: string;
  projectType: string;
  message: string;
};

export type DeliveryResult = {
  /** False when no provider is configured — the caller must not claim success. */
  delivered: boolean;
};

export async function sendContactEmail(message: ContactMessage): Promise<DeliveryResult> {
  const configured = Boolean(process.env.RESEND_API_KEY && process.env.CONTACT_TO_EMAIL);

  if (!configured) {
    console.info(
      "[contact] No email provider configured; message not sent.\n" +
        `  from: ${message.name} <${message.email}>\n` +
        `  type: ${message.projectType}\n` +
        `  message: ${message.message}`,
    );
    return { delivered: false };
  }

  // Provider call goes here once one is chosen.
  throw new Error(
    "Email provider credentials are set but sendContactEmail has no implementation. " +
      "Add the provider call in src/lib/mail.ts.",
  );
}
