import React from "react";
import Link from "next/link";

export interface PolicySection {
  id: string;
  heading: string;
  paragraphs: string[];
  bullets?: string[];
}

export interface PolicyHighlight {
  label: string;
  value: string;
}

interface PolicyPageShellProps {
  currentPath: string;
  eyebrow: string;
  title: string;
  effectiveDate: string;
  intro: string;
  highlights: PolicyHighlight[];
  sections: PolicySection[];
}

const POLICY_LINKS = [
  { label: "Refunds & Cancellations", href: "/refunds-and-cancellations" },
  { label: "Shipping Policy", href: "/shipping-policy" },
  { label: "Privacy Policy", href: "/privacy-policy" },
  { label: "Terms & Conditions", href: "/terms-and-conditions" },
];

/**
 * Shared editorial layout shell for ORIIKO India policy pages.
 */
export function PolicyPageShell({
  currentPath,
  eyebrow,
  title,
  effectiveDate,
  intro,
  highlights,
  sections,
}: PolicyPageShellProps) {
  return (
    <main className="flex-1 bg-[#F2F2F0] dark:bg-[#26231F] text-[#26231F] dark:text-[#F2F2F0] py-8 sm:py-18">
      <div className="max-w-[1140px] mx-auto px-4 sm:px-10">
        {/* Breadcrumb */}
        <nav
          aria-label="Breadcrumb"
          className="text-[11px] tracking-widest uppercase text-[#26231F]/50 dark:text-[#F2F2F0]/55 flex flex-wrap items-center gap-2 mb-6 sm:mb-8"
        >
          <Link href="/" className="hover:text-[#591623] dark:hover:text-[#F2F2F0] transition-colors">
            Home
          </Link>
          <span>/</span>
          <span className="text-[#26231F] dark:text-[#F2F2F0]">{title}</span>
        </nav>

        {/* Policy Header */}
        <header className="border-b border-[#26231F]/15 dark:border-[#F2F2F0]/15 pb-8 mb-10 space-y-4">
          <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#591623]/10 dark:bg-[#591623]/40 text-[10px] tracking-[0.22em] uppercase text-[#591623] dark:text-[#F2F2F0] font-semibold">
            {eyebrow}
          </span>
          <h1
            className="text-3xl sm:text-5xl font-serif font-normal text-[#26231F] dark:text-[#F2F2F0] leading-tight"
            style={{ fontFamily: '"Cormorant Garamond", "Didot", serif' }}
          >
            {title}
          </h1>
          <p className="text-sm text-[#26231F]/75 dark:text-[#F2F2F0]/75 leading-relaxed max-w-2xl font-sans">
            {intro}
          </p>
          <p className="text-[11px] uppercase tracking-[0.18em] text-[#26231F]/50 dark:text-[#F2F2F0]/55 font-sans">
            Effective Date: {effectiveDate} &bull; ORIIKO India Storefront
          </p>
        </header>

        {/* Summary Highlights */}
        <section
          aria-label="Key Policy Highlights"
          className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-12"
        >
          {highlights.map((item) => (
            <div
              key={item.label}
              className="rounded-xl border border-[#26231F]/12 dark:border-[#F2F2F0]/15 bg-[#F2F2F0] dark:bg-[#F2F2F0]/[0.04] p-4 sm:p-5 space-y-1"
            >
              <span className="text-[10px] uppercase tracking-[0.2em] text-[#8C072B] dark:text-[#F2F2F0]/75 font-semibold block">
                {item.label}
              </span>
              <p className="text-sm font-medium text-[#26231F] dark:text-[#F2F2F0] leading-snug">
                {item.value}
              </p>
            </div>
          ))}
        </section>

        {/* Mobile Quick Policy Tabs */}
        <div className="lg:hidden flex gap-2 overflow-x-auto pb-4 mb-4 no-scrollbar">
          {POLICY_LINKS.map((link) => {
            const isActive = currentPath === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`shrink-0 px-3.5 py-2 min-h-[38px] inline-flex items-center rounded-full text-[11px] font-medium border transition-colors ${isActive
                  ? "bg-[#591623] text-[#F2F2F0] border-[#591623]"
                  : "bg-[#F2F2F0] dark:bg-[#F2F2F0]/[0.05] text-[#26231F]/80 dark:text-[#F2F2F0]/80 border-[#26231F]/15 dark:border-[#F2F2F0]/15 hover:border-[#591623] dark:hover:border-[#F2F2F0]"
                  }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* Content Grid: Policy Content First on Mobile, Sidebar Left on Desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-10 items-start">
          {/* Sidebar Navigation */}
          <aside className="order-2 lg:order-1 lg:col-span-4 space-y-5 sm:space-y-6 lg:sticky lg:top-28">
            <div className="hidden lg:block rounded-2xl border border-[#26231F]/15 dark:border-[#F2F2F0]/15 bg-[#F2F2F0] dark:bg-[#F2F2F0]/[0.04] p-5 space-y-3">
              <span className="text-[10px] uppercase tracking-[0.22em] text-[#26231F]/55 dark:text-[#F2F2F0]/60 font-semibold block">
                ORIIKO Policies
              </span>
              <ul className="space-y-1.5">
                {POLICY_LINKS.map((link) => {
                  const isActive = currentPath === link.href;
                  return (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className={`block px-3.5 py-2.5 rounded-lg text-xs font-medium transition-colors ${isActive
                          ? "bg-[#591623] text-[#F2F2F0]"
                          : "text-[#26231F]/80 dark:text-[#F2F2F0]/80 hover:bg-[#591623]/8 dark:hover:bg-[#591623]/30 hover:text-[#591623] dark:hover:text-[#F2F2F0]"
                          }`}
                      >
                        {link.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="rounded-2xl border border-[#26231F]/15 dark:border-[#F2F2F0]/15 bg-[#F2F2F0] dark:bg-[#F2F2F0]/[0.04] p-5 space-y-2.5">
              <span className="text-[10px] uppercase tracking-[0.22em] text-[#8C072B] dark:text-[#F2F2F0]/75 font-semibold block">
                Need Assistance?
              </span>
              <p className="text-xs text-[#26231F]/70 dark:text-[#F2F2F0]/70 leading-relaxed">
                Reach our India customer support desk Monday to Saturday, 10:00 AM – 7:00 PM IST.
              </p>
              <a
                href="mailto:support@oriiko.com"
                className="inline-flex items-center px-4 py-2.5 min-h-[40px] rounded-full bg-[#26231F] dark:bg-[#591623] text-[#F2F2F0] text-[11px] uppercase tracking-wider font-medium hover:bg-[#591623] dark:hover:bg-[#8C072B] transition-colors"
              >
                support@oriiko.com
              </a>
            </div>
          </aside>

          {/* Main Policy Sections */}
          <div className="order-1 lg:order-2 lg:col-span-8 space-y-4 sm:space-y-6">
            {sections.map((section, idx) => (
              <section
                key={section.id}
                id={section.id}
                className="rounded-2xl border border-[#26231F]/12 dark:border-[#F2F2F0]/15 bg-[#F2F2F0] dark:bg-[#F2F2F0]/[0.04] p-5 sm:p-8 space-y-3"
              >
                <h2 className="text-xl font-serif text-[#26231F] dark:text-[#F2F2F0] font-normal">
                  <span className="text-[#8C072B] dark:text-[#F2F2F0]/70 mr-2 font-sans text-xs font-semibold">
                    0{idx + 1}.
                  </span>
                  {section.heading}
                </h2>

                <div className="space-y-3 text-xs sm:text-sm text-[#26231F]/75 dark:text-[#F2F2F0]/75 leading-relaxed font-sans">
                  {section.paragraphs.map((p, pIdx) => (
                    <p key={pIdx}>{p}</p>
                  ))}
                  {section.bullets && section.bullets.length > 0 && (
                    <ul className="list-disc pl-5 space-y-1.5 pt-1 text-[#26231F]/80 dark:text-[#F2F2F0]/80">
                      {section.bullets.map((bullet, bIdx) => (
                        <li key={bIdx}>{bullet}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </section>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}

