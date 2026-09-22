"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, CheckCircle2, LocateFixed, Siren } from "lucide-react";
import { EXPOSURE, type ExposureKey } from "@/lib/catalog";
import type { Branch } from "@/lib/types";

const STEPS = [
  { n: "01", label: "Exposure category" },
  { n: "02", label: "Animal type" },
  { n: "03", label: "PhilHealth" },
  { n: "04", label: "Branch & schedule" },
];

const ANIMALS = [
  { key: "Dog", hint: "Most common exposure in the Philippines" },
  { key: "Cat", hint: "Includes scratches from kittens" },
  { key: "Other", hint: "Monkey, bat, rodent, mongooses" },
];

function slots() {
  const out: string[] = [];
  for (let h = 8; h <= 16; h++) {
    for (const m of [0, 30]) {
      if (h === 16 && m === 30) continue;
      const ampm = h < 12 ? "AM" : "PM";
      const hh = h % 12 === 0 ? 12 : h % 12;
      out.push(`${String(hh).padStart(2, "0")}:${String(m).padStart(2, "0")} ${ampm}`);
    }
  }
  return out;
}

const fadeSlide = {
  initial: { opacity: 0, x: 24 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -18 },
  transition: { duration: 0.22, ease: [0.2, 0.8, 0.2, 1] as const },
};

interface Confirmation {
  reference: string;
  branchName: string;
  branchAddress: string;
  appointmentDate: string;
  appointmentTime: string;
  exposureCategory: string;
  indication: string;
  isPhilhealthMember: boolean;
}

export function TriageWizard({ branches }: { branches: Branch[] }) {
  const [step, setStep] = useState(0);
  const [category, setCategory] = useState<ExposureKey | null>(null);
  const [animal, setAnimal] = useState<string | null>(null);
  const [philhealth, setPhilhealth] = useState<boolean | null>(null);
  const [branchSlug, setBranchSlug] = useState<string>("");
  const [date, setDate] = useState<string>("");
  const [time, setTime] = useState<string>("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<Confirmation | null>(null);
  const rootRef = useRef<HTMLElement | null>(null);

  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const isUrgent = category === "III";
  const info = category ? EXPOSURE[category] : null;

  useEffect(() => {
    const onBranch = (e: Event) => {
      const slug = (e as CustomEvent<string>).detail;
      setBranchSlug(slug);
    };
    const onLocate = () => {
      setStep(3);
      document.getElementById("triage")?.scrollIntoView({ behavior: "smooth" });
    };
    window.addEventListener("sbi:select-branch", onBranch as EventListener);
    window.addEventListener("sbi:locate", onLocate);
    return () => {
      window.removeEventListener("sbi:select-branch", onBranch as EventListener);
      window.removeEventListener("sbi:locate", onLocate);
    };
  }, []);

  const canAdvance =
    (step === 0 && category !== null) ||
    (step === 1 && animal !== null) ||
    (step === 2 && philhealth !== null) ||
    step === 3;

  async function submit() {
    if (!branchSlug || !date || !time || !name.trim() || !phone.trim()) {
      setError("Please complete the branch, schedule and patient details.");
      setStep(3);
      return;
    }
    setSending(true);
    setError(null);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientName: name,
          contactNumber: phone,
          branchSlug,
          exposureCategory: category,
          animalType: animal,
          isPhilhealthMember: philhealth,
          appointmentDate: date,
          appointmentTime: time,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Booking failed");
      setDone({
        reference: json.booking.reference,
        branchName: json.branch.name,
        branchAddress: json.branch.address,
        appointmentDate: json.booking.appointmentDate,
        appointmentTime: json.booking.appointmentTime,
        exposureCategory: json.booking.exposureCategory,
        indication: json.booking.indication,
        isPhilhealthMember: json.booking.isPhilhealthMember,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Booking failed. Please try again.");
    } finally {
      setSending(false);
    }
  }

  const chosenBranch = branches.find((b) => b.slug === branchSlug);

  return (
    <section
      id="triage"
      ref={rootRef}
      className="relative scroll-mt-32 overflow-hidden"
      aria-label="Patient triage and appointment booking"
    >
      <motion.div
        className="absolute inset-0"
        animate={{ backgroundColor: isUrgent ? "#E31E24" : "#0A3D7A" }}
        transition={{ duration: 0.45, ease: [0.2, 0.8, 0.2, 1] }}
      />
      <div className="relative mx-auto max-w-[1400px] px-4 py-16 sm:px-6 lg:py-24">
        <div className="grid gap-10 lg:grid-cols-[190px_minmax(0,1fr)]">
          {/* Step rail */}
          <div className="lg:sticky lg:top-44 lg:self-start">
            <p className="plate-label text-white/60">02 / Triage</p>
            <h2 className="mt-2 text-[clamp(1.9rem,4vw,2.6rem)] text-white">
              Patient
              <br />
              triage
            </h2>
            <ol className="mt-6 hidden space-y-4 border-l border-white/25 pl-4 lg:block">
              {STEPS.map((s, i) => {
                const state = i === step ? "current" : i < step ? "done" : "todo";
                return (
                  <li key={s.n} className="relative">
                    <span
                      className={`absolute -left-[22px] h-2.5 w-2.5 rounded-full ${
                        state === "current"
                          ? "bg-cyan"
                          : state === "done"
                            ? "bg-white"
                            : "bg-white/30"
                      }`}
                      aria-hidden="true"
                    />
                    <button
                      type="button"
                      onClick={() => i <= step && setStep(i)}
                      disabled={i > step}
                      className={`block text-left text-[13px] leading-tight ${
                        state === "current"
                          ? "font-extrabold text-white"
                          : state === "done"
                            ? "text-white/75 hover:text-white"
                            : "text-white/45"
                      }`}
                    >
                      <span className="tabular mr-1.5 opacity-70">{s.n}</span>
                      {s.label}
                    </button>
                  </li>
                );
              })}
            </ol>
            <p className="mt-6 hidden max-w-[180px] text-[13px] leading-snug text-white/70 lg:block">
              Four steps. Under a minute. A reference number is issued instantly.
            </p>
          </div>

          {/* Panel */}
          <div className="min-w-0">
            <AnimatePresence mode="wait">
              {done ? (
                <motion.div
                  key="done"
                  {...fadeSlide}
                  data-wizard
                  className="rounded-[1.5rem] border border-white/20 bg-white p-6 shadow-[0_40px_80px_-56px_rgba(0,0,0,1)] sm:p-9"
                  role="status"
                >
                  <p className="plate-label text-cyan-deep">Booking confirmed</p>
                  <p className="tabular mt-3 text-[clamp(2rem,6vw,3.2rem)] font-extrabold text-navy">
                    {done.reference}
                  </p>
                  <p className="mt-1 text-[15px] text-steel">
                    Screenshot this reference or present it at the reception desk.
                  </p>
                  <dl className="mt-6 grid gap-px border border-hair bg-hair sm:grid-cols-2">
                    {[
                      ["Branch", `${done.branchName} — ${done.branchAddress}`],
                      ["Schedule", `${done.appointmentDate} · ${done.appointmentTime}`],
                      ["Indication", done.indication],
                      [
                        "PhilHealth",
                        done.isPhilhealthMember
                          ? "Member — Animal Bite Package applied (3 baseline doses subsidised)"
                          : "Non-member — standard consultation rates",
                      ],
                    ].map(([k, v]) => (
                      <div key={k} className="bg-white p-4">
                        <dt className="plate-label text-steel">{k}</dt>
                        <dd className="mt-1 text-[15px] font-semibold text-ink">{v}</dd>
                      </div>
                    ))}
                  </dl>
                  {done.exposureCategory === "III" && (
                    <div className="mt-6 border-l-4 border-alert bg-alert/8 p-4">
                      <p className="font-extrabold text-alert">URGENT — Category III</p>
                      <p className="mt-1 text-[15px] text-ink">
                        Arrive as early as possible on your scheduled slot. ERIG/HRIG must be
                        infiltrated into the wound as soon as possible after the bite.
                      </p>
                    </div>
                  )}
                  <div className="mt-6 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setDone(null);
                        setStep(0);
                        setCategory(null);
                        setAnimal(null);
                        setPhilhealth(null);
                        setTime("");
                      }}
                      className="btn btn-primary"
                    >
                      Book another
                    </button>
                    <a href="#locator" className="btn btn-outline">
                      Back to locator
                    </a>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key={step}
                  {...fadeSlide}
                  data-wizard
                  className="rounded-[1.5rem] border border-white/20 bg-white/8 p-5 shadow-[0_36px_80px_-60px_rgba(0,0,0,1)] backdrop-blur-md sm:p-8"
                >
                  {/* mobile step indicator */}
                  <div className="mb-5 flex items-center gap-2 lg:hidden">
                    {STEPS.map((s, i) => (
                      <span
                        key={s.n}
                        className={`h-1.5 flex-1 ${i <= step ? "bg-cyan" : "bg-white/25"}`}
                        aria-hidden="true"
                      />
                    ))}
                    <span className="plate-label tabular text-white/70">
                      {STEPS[step].n}/04
                    </span>
                  </div>

                  {step === 0 && (
                    <fieldset>
                      <legend className="text-[clamp(1.4rem,3vw,2rem)] font-extrabold text-white">
                        How did the exposure happen?
                      </legend>
                      <p className="mt-2 text-[15px] text-white/75">
                        WHO/DOH rabies post-exposure classification — pick the closest match.
                      </p>
                      <div className="mt-5 grid gap-3 md:grid-cols-3">
                        {(["I", "II", "III"] as ExposureKey[]).map((key) => {
                          const e = EXPOSURE[key];
                          const on = category === key;
                          const tone =
                            key === "I"
                              ? "border-white/40"
                              : key === "II"
                                ? "border-cyan"
                                : "border-alert";
                          return (
                            <button
                              key={key}
                              type="button"
                              aria-pressed={on}
                              onClick={() => setCategory(key)}
                              className={`group flex flex-col items-start rounded-2xl border p-5 text-left transition-all duration-150 ${
                                on
                                  ? `${key === "III" ? "bg-alert" : key === "II" ? "bg-cyan" : "bg-white"} -translate-y-1 shadow-[0_24px_48px_-28px_rgba(0,0,0,0.9)]`
                                  : `bg-white/8 hover:-translate-y-1 hover:bg-white/12 ${tone}`
                              }`}
                            >
                              <span
                                className={`text-[3.2rem] leading-none font-extrabold ${
                                  on ? (key === "II" ? "text-navy-deep" : "text-white") : "text-white"
                                }`}
                              >
                                {key}
                              </span>
                              <span
                                className={`mt-2 text-[14px] leading-snug font-semibold ${
                                  on ? (key === "II" ? "text-navy-deep" : "text-white") : "text-white/85"
                                }`}
                              >
                                {e.title}
                              </span>
                              <span
                                className={`plate-label mt-3 ${
                                  on ? (key === "II" ? "text-navy-deep/70" : "text-white/75") : "text-cyan"
                                }`}
                              >
                                {e.requirement}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </fieldset>
                  )}

                  {step === 1 && (
                    <fieldset>
                      <legend className="text-[clamp(1.4rem,3vw,2rem)] font-extrabold text-white">
                        Which animal was involved?
                      </legend>
                      <div className="mt-5 grid gap-3 sm:grid-cols-3">
                        {ANIMALS.map((a) => {
                          const on = animal === a.key;
                          return (
                            <button
                              key={a.key}
                              type="button"
                              aria-pressed={on}
                              onClick={() => setAnimal(a.key)}
                              className={`rounded-2xl border p-5 text-left transition-all duration-150 ${
                                on
                                  ? "-translate-y-1 border-cyan bg-cyan text-navy-deep shadow-[0_24px_48px_-28px_rgba(0,0,0,0.9)]"
                                  : "border-white/25 bg-white/8 text-white hover:-translate-y-1 hover:border-cyan hover:bg-white/12"
                              }`}
                            >
                              <span className="block text-[22px] font-extrabold">{a.key}</span>
                              <span
                                className={`mt-1 block text-[13px] ${on ? "text-navy-deep/75" : "text-white/70"}`}
                              >
                                {a.hint}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                      <p className="mt-5 max-w-2xl border-l-2 border-cyan pl-3 text-[15px] text-white/80">
                        If the animal is a pet, note its vaccination status — the attending
                        physician uses it alongside your exposure category to decide the
                        immunoglobulin schedule.
                      </p>
                    </fieldset>
                  )}

                  {step === 2 && (
                    <fieldset>
                      <legend className="text-[clamp(1.4rem,3vw,2rem)] font-extrabold text-white">
                        Are you a PhilHealth member?
                      </legend>
                      <p className="mt-2 text-[15px] text-white/75">
                        Answering yes flags your transaction for the Animal Bite Package — zero
                        cash or highly subsidised clearing of the 3 baseline active doses.
                      </p>
                      <div className="mt-5 grid gap-3 sm:grid-cols-2">
                            <button
                              type="button"
                              aria-pressed={philhealth === true}
                              onClick={() => setPhilhealth(true)}
                              className={`rounded-2xl border p-5 text-left transition-all duration-150 ${
                                philhealth === true
                                  ? "-translate-y-1 border-cyan bg-cyan text-navy-deep shadow-[0_24px_48px_-28px_rgba(0,0,0,0.9)]"
                                  : "border-white/25 bg-white/8 text-white hover:-translate-y-1 hover:border-cyan hover:bg-white/12"
                              }`}
                        >
                          <span className="block text-[24px] font-extrabold">Yes, member</span>
                          <span
                            className={`mt-1 block text-[14px] ${philhealth === true ? "text-navy-deep/75" : "text-white/70"}`}
                          >
                            is_philhealth_member = true · premium current
                          </span>
                        </button>
                            <button
                              type="button"
                              aria-pressed={philhealth === false}
                              onClick={() => setPhilhealth(false)}
                              className={`rounded-2xl border p-5 text-left transition-all duration-150 ${
                                philhealth === false
                                  ? "-translate-y-1 border-white bg-white text-navy shadow-[0_24px_48px_-28px_rgba(0,0,0,0.9)]"
                                  : "border-white/25 bg-white/8 text-white hover:-translate-y-1 hover:border-cyan hover:bg-white/12"
                              }`}
                        >
                          <span className="block text-[24px] font-extrabold">No / not sure</span>
                          <span
                            className={`mt-1 block text-[14px] ${philhealth === false ? "text-steel" : "text-white/70"}`}
                          >
                            We will verify your PIN at the branch
                          </span>
                        </button>
                      </div>
                    </fieldset>
                  )}

                  {step === 3 && (
                    <div>
                      <h3 className="text-[clamp(1.4rem,3vw,2rem)] text-white">
                        Choose your branch, date and time
                      </h3>

                      {/* Category read-out / urgent stamp */}
                      <AnimatePresence>
                        {isUrgent && (
                          <motion.div
                            initial={{ opacity: 0, y: -14, rotate: -1.5 }}
                            animate={{ opacity: 1, y: 0, rotate: -0.6 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3, ease: [0.2, 0.8, 0.2, 1] }}
                            className="mt-4 rounded-2xl border border-white bg-white p-5 shadow-[0_30px_60px_-34px_rgba(0,0,0,0.9)]"
                            role="alert"
                          >
                            <p className="plate-label text-alert">
                              Stamped · urgent · transdermal exposure
                            </p>
                            <p className="mt-1 text-[clamp(1.5rem,4vw,2.2rem)] leading-none font-extrabold text-alert">
                              CATEGORY III — SEEK CARE NOW
                            </p>
                            <ul className="mt-3 grid gap-1.5 text-[15px] text-ink sm:grid-cols-2">
                              {EXPOSURE.III.medicines.map((m) => (
                                <li key={m} className="flex gap-2">
                                  <span className="text-alert" aria-hidden="true">
                                    ▸
                                  </span>
                                  {m}
                                </li>
                              ))}
                            </ul>
                            <div className="mt-4 flex flex-wrap gap-2">
                              <a
                                href="#locator"
                                className="pulse-alert btn btn-alert"
                              >
                                <Siren className="h-4 w-4" aria-hidden="true" />
                                Seek care now — nearest branch
                              </a>
                              <button
                                type="button"
                                onClick={() =>
                                  window.dispatchEvent(new CustomEvent("sbi:locate"))
                                }
                                className="btn btn-outline"
                              >
                                <LocateFixed className="h-4 w-4" aria-hidden="true" />
                                Use my location
                              </button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <form
                        className="mt-5 grid gap-4 sm:grid-cols-2"
                        onSubmit={(e) => {
                          e.preventDefault();
                          submit();
                        }}
                      >
                        <div className="sm:col-span-2">
                          <label htmlFor="branch" className="plate-label text-white/75">
                            Branch
                          </label>
                          <select
                            id="branch"
                            value={branchSlug}
                            onChange={(e) => setBranchSlug(e.target.value)}
                            required
                            className="mt-1.5 h-13 w-full border border-white/40 bg-navy-deep px-3 py-3 text-[16px] text-white focus:border-cyan focus:outline-none"
                          >
                            <option value="">Select a branch…</option>
                            {["NCR", "Luzon", "Visayas", "Mindanao"].map((r) => (
                              <optgroup key={r} label={r}>
                                {branches
                                  .filter((b) => b.region === r)
                                  .map((b) => (
                                    <option key={b.slug} value={b.slug}>
                                      {b.name} — {b.city}
                                    </option>
                                  ))}
                              </optgroup>
                            ))}
                          </select>
                          {chosenBranch && (
                            <p className="mt-1.5 text-[14px] text-white/75">
                              {chosenBranch.address}
                              {chosenBranch.hours ? ` · ${chosenBranch.hours}` : ""}
                            </p>
                          )}
                        </div>

                        <div>
                          <label htmlFor="date" className="plate-label text-white/75">
                            Date
                          </label>
                          <input
                            id="date"
                            type="date"
                            min={today}
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            required
                            className="tabular mt-1.5 w-full border border-white/40 bg-navy-deep px-3 py-3 text-[16px] text-white focus:border-cyan focus:outline-none"
                          />
                        </div>
                        <div>
                          <label htmlFor="time" className="plate-label text-white/75">
                            Time slot
                          </label>
                          <select
                            id="time"
                            value={time}
                            onChange={(e) => setTime(e.target.value)}
                            required
                            className="mt-1.5 w-full border border-white/40 bg-navy-deep px-3 py-3 text-[16px] text-white focus:border-cyan focus:outline-none"
                          >
                            <option value="">Select a slot…</option>
                            {slots().map((s) => (
                              <option key={s} value={s}>
                                {s}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label htmlFor="pname" className="plate-label text-white/75">
                            Patient name
                          </label>
                          <input
                            id="pname"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            placeholder="Juan Dela Cruz"
                            className="mt-1.5 w-full border border-white/40 bg-navy-deep px-3 py-3 text-[16px] text-white placeholder:text-white/40 focus:border-cyan focus:outline-none"
                          />
                        </div>
                        <div>
                          <label htmlFor="pphone" className="plate-label text-white/75">
                            Mobile number
                          </label>
                          <input
                            id="pphone"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            required
                            inputMode="tel"
                            placeholder="09XX XXX XXXX"
                            className="tabular mt-1.5 w-full border border-white/40 bg-navy-deep px-3 py-3 text-[16px] text-white placeholder:text-white/40 focus:border-cyan focus:outline-none"
                          />
                        </div>

                        <p className="text-[14px] text-white/70 sm:col-span-2">
                          Exposure readout:{" "}
                          <strong className="text-white">
                            {info?.label} — {info?.requirement}
                          </strong>{" "}
                          · Animal: <strong className="text-white">{animal}</strong> · PhilHealth:{" "}
                          <strong className="text-white">
                            {philhealth === null ? "—" : philhealth ? "Member" : "Non-member"}
                          </strong>
                        </p>

                        {error && (
                          <p className="border-l-4 border-alert bg-alert/20 px-3 py-2 text-[15px] text-white sm:col-span-2">
                            {error}
                          </p>
                        )}

                        <div className="flex flex-wrap gap-2 sm:col-span-2">
                          <button
                            type="submit"
                            disabled={sending}
                            className="btn btn-accent btn-lg disabled:opacity-60"
                          >
                            <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                            {sending ? "Issuing reference…" : "Confirm booking"}
                          </button>
                          <span className="self-center text-[14px] text-white/70">
                            A booking reference is generated instantly.
                          </span>
                        </div>
                      </form>
                    </div>
                  )}

                  {/* Nav */}
                  <div className="mt-7 flex items-center justify-between gap-3 border-t border-white/20 pt-5">
                    <button
                      type="button"
                      onClick={() => setStep((s) => Math.max(0, s - 1))}
                      disabled={step === 0}
                      className="btn !border-white/40 !bg-transparent !text-white hover:!border-cyan hover:!bg-white/10 hover:!text-white disabled:opacity-30"
                    >
                      <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                      Back
                    </button>

                    {info && (
                      <p className="hidden max-w-md text-right text-[14px] leading-snug text-white/80 md:block">
                        {info.action}
                      </p>
                    )}

                    {step < 3 && (
                      <button
                        type="button"
                        onClick={() => canAdvance && setStep((s) => s + 1)}
                        disabled={!canAdvance}
                        className={`btn disabled:cursor-not-allowed disabled:opacity-40 ${
                          category === "III"
                            ? "!bg-white !text-alert hover:!bg-alert-deep hover:!text-white"
                            : "btn-accent"
                        }`}
                      >
                        Continue
                        <ArrowRight className="h-4 w-4" aria-hidden="true" />
                      </button>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
