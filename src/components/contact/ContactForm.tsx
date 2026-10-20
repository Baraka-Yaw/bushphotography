"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { submitContact } from "@/app/actions/contact";
import { PROJECT_TYPES } from "@/lib/contact";
import type { ContactState } from "@/lib/contact";
import { Button } from "@/components/ui/Button";
import { SocialIcon } from "@/components/ui/SocialIcon";
import { cn } from "@/lib/utils";

const INITIAL: ContactState = { status: "idle" };

/**
 * WhatsApp's glyph. Not in `SOCIAL_ICON_PATHS` because that map is keyed by
 * `SocialLink.label` for the profile links in the footer; WhatsApp is a contact
 * channel here, not a profile to follow.
 */
const WHATSAPP_ICON =
  "M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z";

// `glass-field` carries the material and the focus ring; form controls can't
// render pseudo-elements, so it is a self-contained rule rather than `.glass`.
const FIELD =
  "glass-field px-4 py-3 text-base text-fg placeholder:text-muted/70";

export function ContactForm() {
  const [state, formAction] = useActionState(submitContact, INITIAL);

  if (state.status === "success") {
    return (
      <div className="glass glass-soft border-accent/40 p-8" role="status">
        <p className="font-display text-2xl text-accent">
          {state.whatsappUrl ? "Ready to send" : "Message sent"}
        </p>
        <p className="mt-2 text-muted">{state.message}</p>

        {/*
          A link the visitor clicks, not an automatic redirect: navigating them
          off-site without asking is hostile, and a scripted `window.open` would
          be caught by popup blockers since it is not tied to a user gesture.
        */}
        {state.whatsappUrl ? (
          <a
            href={state.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="glass glass-interactive glass-pill mt-6 inline-flex min-h-11 items-center justify-center gap-2 border-accent/45 px-6 py-3 text-xs uppercase tracking-[0.18em] text-accent hover:border-accent hover:bg-accent/12"
          >
            <SocialIcon path={WHATSAPP_ICON} />
            Open WhatsApp
          </a>
        ) : null}
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-6" noValidate>
      {state.status === "error" && state.message ? (
        <p
          // Announced when the server action comes back with a failure.
          role="alert"
          className="glass glass-sm px-4 py-3 text-sm text-fg"
        >
          {state.message}
        </p>
      ) : null}

      <Field
        label="Name"
        name="name"
        error={state.errors?.name}
        defaultValue={state.values?.name}
      >
        {(props) => <input type="text" autoComplete="name" className={FIELD} {...props} />}
      </Field>

      <Field
        label="Email"
        name="email"
        error={state.errors?.email}
        defaultValue={state.values?.email}
      >
        {(props) => (
          <input type="email" autoComplete="email" inputMode="email" className={FIELD} {...props} />
        )}
      </Field>

      <Field
        label="Phone (optional)"
        name="phone"
        error={state.errors?.phone}
        defaultValue={state.values?.phone}
      >
        {(props) => (
          <input type="tel" autoComplete="tel" inputMode="tel" className={FIELD} {...props} />
        )}
      </Field>

      <Field
        label="Project type"
        name="projectType"
        error={state.errors?.projectType}
        defaultValue={state.values?.projectType}
      >
        {(props) => (
          <select className={cn(FIELD, "appearance-none")} {...props}>
            <option value="">Select…</option>
            {PROJECT_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        )}
      </Field>

      <Field
        label="Message"
        name="message"
        error={state.errors?.message}
        defaultValue={state.values?.message}
      >
        {(props) => (
          <textarea
            rows={6}
            placeholder="What are you looking to shoot, roughly when, and where?"
            className={cn(FIELD, "resize-y")}
            {...props}
          />
        )}
      </Field>

      {/*
        Honeypot. Hidden from sighted users and removed from the accessibility
        tree, and tabIndex={-1} keeps keyboard users from landing in it — only an
        automated form-filler will populate this.
      */}
      <div aria-hidden="true" className="absolute left-[-9999px] h-0 w-0 overflow-hidden">
        <label htmlFor="hp_check">Leave this field blank</label>
        <input
          id="hp_check"
          name="hp_check"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          // Browsers largely ignore autocomplete="off" on text inputs, and this
          // field was previously named `company` — the `organization` autofill
          // token — so real visitors autofilling their details filled it too and
          // were treated as bots. The neutral name above is the actual fix; these
          // opt out of the two most common password managers as well.
          data-lpignore="true"
          data-1p-ignore=""
        />
      </div>

      <SubmitButton />
    </form>
  );
}

function SubmitButton() {
  // Must be a child of <form> for useFormStatus to see the pending state.
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending} aria-disabled={pending}>
      {pending ? "Sending…" : "Send message"}
    </Button>
  );
}

/**
 * Wires the label, error message and `aria-describedby`/`aria-invalid` together
 * so every field's error is announced rather than only shown.
 */
function Field({
  label,
  name,
  error,
  defaultValue,
  children,
}: {
  label: string;
  name: string;
  error?: string;
  defaultValue?: string;
  children: (props: {
    id: string;
    name: string;
    defaultValue?: string;
    "aria-invalid"?: boolean;
    "aria-describedby"?: string;
  }) => React.ReactNode;
}) {
  const errorId = `${name}-error`;

  return (
    <div>
      <label
        htmlFor={name}
        className="mb-2 block text-xs uppercase tracking-[0.16em] text-muted"
      >
        {label}
      </label>

      {children({
        id: name,
        name,
        defaultValue,
        ...(error ? { "aria-invalid": true, "aria-describedby": errorId } : {}),
      })}

      {error ? (
        <p id={errorId} className="mt-2 text-sm text-accent">
          {error}
        </p>
      ) : null}
    </div>
  );
}
