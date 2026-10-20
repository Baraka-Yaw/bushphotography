/**
 * Shared contact-form contract.
 *
 * This lives outside `app/actions/contact.ts` on purpose: a `"use server"` module
 * may only export async functions. Every other export gets wrapped as a server
 * reference, so a plain array exported from there arrives on the client as a
 * function proxy and blows up the moment you map over it.
 */

import { z } from "zod";

export const PROJECT_TYPES = [
  "Wedding",
  "Traditional marriage",
  "Graduation",
  "Portrait session",
  "Corporate event",
  "Party / celebration",
  "Concert / stage",
  "Something else",
] as const;

export const ContactSchema = z.object({
  name: z.string().trim().min(2, "Please enter your name.").max(100),
  email: z.email("Please enter a valid email address.").max(200),
  // Optional: an enquiry sent through WhatsApp already carries the sender's
  // number, so requiring this would add friction for nothing. It is still worth
  // collecting for anyone who submits from desktop WhatsApp Web under a
  // different number, or once email delivery is wired up.
  phone: z
    .string()
    .trim()
    .max(40, "That phone number looks too long.")
    .optional(),
  projectType: z.enum(PROJECT_TYPES, "Please choose a project type."),
  message: z
    .string()
    .trim()
    .min(10, "Please give me a little more detail (10 characters or more).")
    .max(4000, "That message is too long — 4000 characters maximum."),
  /**
   * Honeypot. Hidden from real users, so anything in it suggests a bot that
   * filled every field it could find.
   *
   * NOT named `company`: that maps to the autocomplete `organization` token, so
   * browser and password-manager autofill populated it whenever a real visitor
   * autofilled their name and email — tripping the trap and silently swallowing
   * genuine enquiries. The name here is deliberately outside the autofill
   * vocabulary.
   *
   * Intentionally unconstrained: a `max(0)` here would fail *validation* on a
   * trip, and since this field is not in `ContactField` the visitor would get
   * "Please check the highlighted fields" with nothing highlighted and no way
   * forward. The action reads the value and decides what to do with it.
   */
  hp_check: z.string().optional(),
});

export type ContactField =
  | "name"
  | "email"
  | "phone"
  | "projectType"
  | "message";

export type ContactState = {
  status: "idle" | "success" | "error";
  message?: string;
  /** Field-level messages, keyed by input name. */
  errors?: Partial<Record<ContactField, string>>;
  /**
   * Echoed back so a failed submit doesn't wipe what the visitor typed — losing a
   * long message to a validation error is the fastest way to lose the enquiry.
   */
  values?: Record<ContactField, string>;
  /**
   * Present on success: a `wa.me` link with the enquiry pre-composed. The form
   * renders it as a button rather than redirecting, so the visitor makes the
   * choice to leave the site and no popup blocker gets involved.
   */
  whatsappUrl?: string;
};

/**
 * Compose a `wa.me` deep link carrying the enquiry as pre-filled text.
 *
 * Nothing is transmitted by building this URL — the message is sent from the
 * visitor's own WhatsApp when they open it, which is why the form must never
 * claim the message has been sent at this point. It also means the enquiry
 * arrives from their number, so replies just work.
 */
export function buildWhatsAppUrl(
  whatsappNumber: string,
  siteName: string,
  data: {
    name: string;
    email: string;
    phone?: string;
    projectType: string;
    message: string;
  },
): string {
  const lines = [
    `New enquiry from ${siteName}`,
    "",
    `Name: ${data.name}`,
    `Email: ${data.email}`,
    ...(data.phone ? [`Phone: ${data.phone}`] : []),
    `Project type: ${data.projectType}`,
    "",
    data.message,
  ];

  // Digits only — wa.me rejects "+", spaces and punctuation.
  const number = whatsappNumber.replace(/\D/g, "");
  return `https://wa.me/${number}?text=${encodeURIComponent(lines.join("\n"))}`;
}

/**
 * `wa.me` link for a package's "Book" button. Like `buildWhatsAppUrl`, building
 * it sends nothing — the visitor sends it from their own WhatsApp.
 */
export function buildPackageWhatsAppUrl(
  whatsappNumber: string,
  siteName: string,
  pkg: { name: string; priceGhs?: number },
): string {
  const price = pkg.priceGhs !== undefined ? ` (${formatCedis(pkg.priceGhs)})` : "";
  const text = [
    `Hi ${siteName}, I'd like to book the ${pkg.name} package${price}.`,
    "",
    "Date:",
    "Location:",
  ].join("\n");
  const number = whatsappNumber.replace(/\D/g, "");
  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
}

/** "₵4,500" — explicit locale so server and client agree. */
export function formatCedis(amount: number): string {
  return `₵${new Intl.NumberFormat("en-GB").format(amount)}`;
}
