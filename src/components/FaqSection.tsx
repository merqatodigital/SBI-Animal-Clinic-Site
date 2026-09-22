"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HelpCircle, Plus, ArrowRight, MessageCircleQuestion } from "lucide-react";
import type { Faq } from "@/lib/cms";

export function FaqSection({ faqs }: { faqs: Faq[] }) {
  const [open, setOpen] = useState<number | null>(0);
  if (faqs.length === 0) return null;

  return (
    <section id="faq" className="scroll-mt-32 border-t border-hair bg-paper">
      <div className="mx-auto max-w-[1400px] px-4 py-16 sm:px-6 lg:py-24">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
          <div>
            <p className="plate-label inline-flex items-center gap-2 rounded-full border border-hair bg-white px-3.5 py-2 text-cyan-deep shadow-sm">
              <MessageCircleQuestion className="h-4 w-4" aria-hidden="true" />
              06 / FAQ
            </p>
            <h2 className="mt-5 text-[clamp(2rem,5vw,3.4rem)] text-navy">
              Bitten? Scratched? Licked?
              <br />
              <span className="text-ink">Answers before you arrive.</span>
            </h2>
            <p className="mt-5 max-w-md text-[16px] leading-relaxed text-steel">
              Managed from the admin panel — add, edit, reorder or hide questions any time.
              Still unsure? Call the hotline on{" "}
              <a href="tel:09286052684" className="tabular font-bold text-navy underline decoration-cyan underline-offset-4">
                0928 605 2684
              </a>
              .
            </p>
            <a href="#triage" className="btn btn-primary btn-lg group mt-7">
              Start triage &amp; book
              <ArrowRight className="h-4 w-4 transition-transform duration-150 group-hover:translate-x-1" />
            </a>
          </div>

          <div className="space-y-3">
            {faqs.map((f) => {
              const isOpen = open === f.id;
              return (
                <div
                  key={f.id}
                  className={`card overflow-hidden transition-shadow ${
                    isOpen ? "shadow-[0_22px_44px_-30px_rgba(6,37,74,0.6)]" : ""
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setOpen(isOpen ? null : f.id)}
                    aria-expanded={isOpen}
                    className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left"
                  >
                    <span className="flex items-start gap-3 text-[17px] font-bold text-navy">
                      <HelpCircle
                        className={`mt-0.5 h-5 w-5 shrink-0 ${isOpen ? "text-cyan-deep" : "text-steel/70"}`}
                        aria-hidden="true"
                      />
                      {f.question}
                    </span>
                    <span
                      aria-hidden="true"
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-all duration-200 ${
                        isOpen ? "rotate-45 bg-navy text-white" : "bg-cyan-soft text-navy"
                      }`}
                    >
                      <Plus className="h-4.5 w-4.5" />
                    </span>
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: [0.2, 0.8, 0.2, 1] }}
                        className="overflow-hidden"
                      >
                        <p className="max-w-3xl px-5 pb-6 pl-[3.4rem] text-[16px] leading-relaxed text-ink/85">
                          {f.answer}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
