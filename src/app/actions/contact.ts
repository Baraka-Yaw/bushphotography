"use server";

import { buildWhatsAppUrl, ContactSchema } from "@/lib/contact";
import type { ContactField, ContactState } from "@/lib/contact";
import { getSiteSettings } from "@/lib/content";
import { sendContactEmail } from "@/lib/mail";

const FIELDS: ContactField[] = [
  "name",
  "email",
  "phone",
  "projectType",
  "message",
];

export async function submitContact(
  _prevState: ContactState,
  formData: FormData,
): Promise<ContactState> {
  const raw = {
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? ""),
    phone: String(formData.get("phone") ?? ""),
    projectType: String(formData.get("projectType") ?? ""),
    message: String(formData.get("message") ?? ""),
    hp_check: String(formData.get("hp_check") ?? ""),
  };

  const values = {
    name: raw.name,
    email: raw.email,
    phone: raw.phone,
    projectType: raw.projectType,
    message: raw.message,
  };

  /*
    A tripped honeypot suggests a bot — but it is a heuristic, and a false
    positive used to discard a real enquiry silently while showing the visitor a
    success message. That is the worst possible failure for a contact form, and
    it happened in practice (see the note on `hp_check` in lib/contact.ts).

    So a trip no longer short-circuits the submit. It only suppresses the email
    copy, which is the one part a bot could actually abuse. The WhatsApp link is
    still returned: building it transmits nothing, and a bot cannot open someone
    else's WhatsApp and press send.
  */
  const suspectedBot = raw.hp_check.length > 0;

  const parsed = ContactSchema.safeParse(raw);

  if (!parsed.success) {
    const errors: ContactState["errors"] = {};
    for (const issue of parsed.error.issues) {
      const field = issue.path[0];
      if (typeof field === "string" && (FIELDS as string[]).includes(field)) {
        errors[field as ContactField] ??= issue.message;
      }
    }

    return {
      status: "error",
      message: "Please check the highlighted fields.",
      errors,
      values,
    };
  }

  const settings = await getSiteSettings();

  /*
    WhatsApp is the delivery channel. Building the link sends nothing — the
    visitor's own WhatsApp does that when they open it — so the success copy
    below says "ready to send", never "sent".
  */
  const whatsappUrl = settings.whatsapp
    ? buildWhatsAppUrl(settings.whatsapp, settings.name, parsed.data)
    : undefined;

  /*
    Email is attempted as a best-effort second copy, for whenever a provider is
    configured. It is no longer the gate: an undelivered email with WhatsApp
    available is not a lost enquiry, so it must not fail the submit.
  */
  let delivered = false;
  try {
    if (suspectedBot) throw new Error("honeypot tripped — email suppressed");
    ({ delivered } = await sendContactEmail({
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone,
      projectType: parsed.data.projectType,
      message: parsed.data.message,
    }));
  } catch (error) {
    console.error("[contact] Email delivery failed", error);
  }

  // Nothing configured at all — say so rather than pretending. An unconfigured
  // form that claims success silently loses real enquiries.
  if (!whatsappUrl && !delivered) {
    return {
      status: "error",
      message:
        "The contact form isn't connected yet. Please email or call directly using the details on this page.",
      values,
    };
  }

  return {
    status: "success",
    message: whatsappUrl
      ? "Your message is ready. Open WhatsApp to send it — it goes from your own number, so I can reply straight back."
      : "Thanks — I'll be in touch shortly.",
    whatsappUrl,
  };
}
