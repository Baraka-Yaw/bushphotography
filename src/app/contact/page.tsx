import type { Metadata } from "next";

import { ContactForm } from "@/components/contact/ContactForm";
import { Container } from "@/components/ui/Container";
import { SocialIcon, socialIconPath } from "@/components/ui/SocialIcon";
import { getSiteSettings } from "@/lib/content";
import { cn } from "@/lib/utils";
import { telHref } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Book Bush Photography for a wedding, traditional marriage, graduation, portrait session, corporate event or party.",
  alternates: { canonical: "/contact" },
};

export default async function ContactPage() {
  const settings = await getSiteSettings();

  return (
    <Container className="pb-8 pt-16 sm:pt-24">
      <header className="max-w-2xl">
        <p className="eyebrow">Contact</p>
        <h1 className="mt-3 font-display text-[clamp(2.5rem,6vw,4.5rem)] leading-[1.05]">
          Let&apos;s talk
        </h1>
        <p className="mt-4 text-muted">
          Tell me about your day — what it is, the date, and where. Or pick a
          package and book it straight on WhatsApp.
        </p>
      </header>

      <div className="mt-14 grid gap-14 lg:grid-cols-[1.2fr_0.8fr] lg:gap-20">
        <ContactForm />

        <aside className="panel panel-soft h-fit space-y-10 px-6 py-8 sm:px-8">
          <div>
            <h2 className="eyebrow border-b border-line/60 pb-3">Direct</h2>
            <ul className="mt-4 space-y-3">
              <li>
                <a
                  href={`mailto:${settings.email}`}
                  className="transition-colors hover:text-accent"
                >
                  {settings.email}
                </a>
              </li>
              <li>
                <a
                  href={telHref(settings.phone)}
                  className="transition-colors hover:text-accent"
                >
                  {settings.phone}
                </a>
              </li>
              <li className="text-muted">{settings.location}</li>
            </ul>
          </div>

          <div>
            <h2 className="eyebrow border-b border-line/60 pb-3">Elsewhere</h2>
            <ul className="mt-4 flex flex-wrap gap-2">
              {settings.socials.map((social) => {
                const icon = socialIconPath(social.label);
                return (
                  <li key={social.label}>
                    <a
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      data-social={social.label.toLowerCase()}
                      className={cn(
                        "social-link chip pill flex min-h-11 items-center justify-center transition-colors",
                        icon ? "w-11" : "px-4 text-sm text-muted hover:text-accent",
                      )}
                    >
                      {icon ? (
                        <>
                          <SocialIcon path={icon} />
                          <span className="sr-only">{social.label}</span>
                        </>
                      ) : (
                        social.label
                      )}
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
        </aside>
      </div>
    </Container>
  );
}
