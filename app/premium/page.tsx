"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Crown,
  Check,
  Zap,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Globe,
  SlidersHorizontal,
  Flame,
  HelpCircle,
  ChevronDown,
  ArrowLeft,
  X,
} from "lucide-react";

interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    question: "Can I cancel my subscription anytime?",
    answer:
      "Yes, absolutely. You can cancel your subscription at any time directly from your account settings. You will retain access to Pro features until the end of your billing cycle.",
  },
  {
    question: "How do gender & location filters work?",
    answer:
      "PRO members gain direct control over matchmaking parameters. You can filter users by gender, region, or specific countries to match with exactly who you want.",
  },
  {
    question: "Is my payment information secure?",
    answer:
      "100% secure. We use enterprise-grade encryption via Stripe and PayPal. We never store your full credit card details on our servers.",
  },
  {
    question: "What happens if I don't get matched fast enough?",
    answer:
      "PRO members receive Priority Queue placement. This routes your connection requests ahead of free users, dropping average wait times to under 3 seconds.",
  },
];

export default function PremiumPage() {
  const router = useRouter();
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">(
    "yearly"
  );
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const handleCheckout = (planTier: string) => {
    setLoadingPlan(planTier);
    // Integrate payment gateway redirect here (e.g., Stripe Checkout)
    setTimeout(() => {
      router.push(`/checkout?plan=${planTier}&billing=${billingCycle}`);
    }, 800);
  };

  return (
    <div className="relative flex min-h-screen flex-col justify-between overflow-hidden bg-zinc-950 font-sans text-zinc-100 antialiased selection:bg-amber-500 selection:text-zinc-950">
      {/* Background Radial Glow Effects */}
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[600px] w-[800px] -translate-x-1/2 rounded-full bg-gradient-to-b from-amber-500/15 via-purple-600/10 to-transparent blur-[140px]" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-[500px] w-[500px] rounded-full bg-blue-600/10 blur-[140px]" />

      <div>
        {/* Navigation Bar */}
        <header className="sticky top-0 z-50 border-b border-zinc-800/80 bg-zinc-950/60 backdrop-blur-xl">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900/50 px-3.5 py-2 text-xs font-medium text-zinc-300 transition-all hover:border-zinc-700 hover:bg-zinc-800 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Dashboard</span>
            </button>

            <div className="flex items-center gap-2 text-xs font-semibold text-amber-400">
              <Crown className="h-4 w-4" />
              <span>MeetStream PRO</span>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="relative z-10 mx-auto max-w-5xl px-6 pt-12 text-center md:pt-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1.5 text-xs font-semibold text-amber-400 backdrop-blur-md shadow-lg shadow-amber-500/10">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Unlock the Full Experience</span>
          </div>

          <h1 className="mt-6 text-4xl font-black tracking-tight text-white md:text-6xl">
            Match Faster. Chat Smarter.
            <span className="block bg-gradient-to-r from-amber-300 via-amber-400 to-amber-600 bg-clip-text text-transparent">
              Go Premium Today.
            </span>
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-base text-zinc-400 md:text-lg">
            Skip the queues, apply advanced location filters, and enjoy zero ad interruptions with our PRO plans.
          </p>

          {/* Monthly / Yearly Billing Toggle */}
          <div className="mt-10 flex items-center justify-center">
            <div className="relative flex items-center rounded-2xl border border-zinc-800 bg-zinc-900/80 p-1.5 backdrop-blur-md">
              <button
                onClick={() => setBillingCycle("monthly")}
                className={`relative px-5 py-2 text-xs font-semibold transition-all rounded-xl ${
                  billingCycle === "monthly"
                    ? "bg-zinc-800 text-white shadow-md"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                Monthly Billing
              </button>
              <button
                onClick={() => setBillingCycle("yearly")}
                className={`relative flex items-center gap-1.5 px-5 py-2 text-xs font-semibold transition-all rounded-xl ${
                  billingCycle === "yearly"
                    ? "bg-amber-500 text-zinc-950 shadow-lg shadow-amber-500/25"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                <span>Annual Billing</span>
                <span className="rounded-md bg-zinc-950/20 px-1.5 py-0.5 text-[10px] font-bold tracking-wide uppercase">
                  Save 40%
                </span>
              </button>
            </div>
          </div>
        </section>

        {/* Pricing Cards Grid */}
        <section className="relative z-10 mx-auto max-w-6xl px-6 py-12">
          <div className="grid gap-8 lg:grid-cols-3 lg:items-stretch">

            {/* 1. Free Tier */}
            <div className="flex flex-col justify-between rounded-3xl border border-zinc-800/80 bg-zinc-900/40 p-8 backdrop-blur-xl transition-all duration-300 hover:border-zinc-700">
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-white">Basic</h3>
                  <span className="rounded-full bg-zinc-800 px-3 py-1 text-[10px] font-semibold text-zinc-400">
                    Standard Access
                  </span>
                </div>
                <p className="mt-2 text-xs text-zinc-400">
                  Ideal for casual users exploring instant matching.
                </p>

                <div className="mt-6 flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-white">$0</span>
                  <span className="text-xs text-zinc-500">/ forever</span>
                </div>

                <hr className="my-6 border-zinc-800/80" />

                <ul className="space-y-3.5 text-xs text-zinc-300">
                  <li className="flex items-center gap-3">
                    <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                    <span>Unlimited Text & Video Matching</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                    <span>Encrypted Connection</span>
                  </li>
                  <li className="flex items-center gap-3 text-zinc-500">
                    <X className="h-4 w-4 shrink-0" />
                    <span>Random Gender & Location</span>
                  </li>
                  <li className="flex items-center gap-3 text-zinc-500">
                    <X className="h-4 w-4 shrink-0" />
                    <span>Standard Queue Wait Times</span>
                  </li>
                  <li className="flex items-center gap-3 text-zinc-500">
                    <X className="h-4 w-4 shrink-0" />
                    <span>Contains Occasional Ads</span>
                  </li>
                </ul>
              </div>

              <div className="mt-8">
                <button
                  disabled
                  className="w-full rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-3.5 text-xs font-semibold text-zinc-500 cursor-not-allowed"
                >
                  Current Plan
                </button>
              </div>
            </div>

            {/* 2. Pro Tier (Featured / Popular) */}
            <div className="relative flex flex-col justify-between rounded-3xl border-2 border-amber-500/80 bg-gradient-to-b from-amber-500/10 via-zinc-900/80 to-zinc-900/90 p-8 shadow-2xl shadow-amber-500/10 backdrop-blur-2xl">
              {/* Popular Badge */}
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-1 text-[10px] font-extrabold tracking-wider uppercase text-zinc-950 shadow-md">
                Most Popular
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Crown className="h-5 w-5 text-amber-400" />
                    <h3 className="text-xl font-bold text-white">Pro Pass</h3>
                  </div>
                  <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-[10px] font-bold text-amber-400">
                    High Priority
                  </span>
                </div>
                <p className="mt-2 text-xs text-zinc-300">
                  Perfect for users who want targeted matches without restrictions.
                </p>

                <div className="mt-6 flex items-baseline gap-1">
                  <span className="text-4xl font-black text-white">
                    {billingCycle === "yearly" ? "$9.99" : "$14.99"}
                  </span>
                  <span className="text-xs text-zinc-400">/ month</span>
                </div>
                {billingCycle === "yearly" && (
                  <p className="mt-1 text-[11px] font-medium text-amber-400">
                    Billed annually ($119.88/year)
                  </p>
                )}

                <hr className="my-6 border-amber-500/20" />

                <ul className="space-y-3.5 text-xs text-zinc-200">
                  <li className="flex items-center gap-3">
                    <Check className="h-4 w-4 text-amber-400 shrink-0" />
                    <span className="font-medium text-white">
                      Gender & Regional Filters
                    </span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="h-4 w-4 text-amber-400 shrink-0" />
                    <span className="font-medium text-white">
                      Priority Queue Matchmaking
                    </span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="h-4 w-4 text-amber-400 shrink-0" />
                    <span>100% Ad-Free Experience</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="h-4 w-4 text-amber-400 shrink-0" />
                    <span>Exclusive VIP Badge on Profile</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="h-4 w-4 text-amber-400 shrink-0" />
                    <span>HD Video Streaming Quality</span>
                  </li>
                </ul>
              </div>

              <div className="mt-8">
                <button
                  onClick={() => handleCheckout("pro")}
                  disabled={loadingPlan === "pro"}
                  className="group relative flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 px-4 py-3.5 text-xs font-bold text-zinc-950 transition-all hover:from-amber-300 hover:to-amber-500 active:scale-[0.99] shadow-lg shadow-amber-500/25 disabled:opacity-50"
                >
                  {loadingPlan === "pro" ? (
                    <span>Processing...</span>
                  ) : (
                    <>
                      <span>Upgrade to Pro</span>
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* 3. Unlimited VIP Tier */}
            <div className="flex flex-col justify-between rounded-3xl border border-zinc-800/80 bg-zinc-900/40 p-8 backdrop-blur-xl transition-all duration-300 hover:border-purple-500/40 hover:bg-zinc-900/60">
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-white">VIP Ultimate</h3>
                  <span className="rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-1 text-[10px] font-bold text-purple-400">
                    All Access
                  </span>
                </div>
                <p className="mt-2 text-xs text-zinc-400">
                  Designed for power users demanding max controls and instant connections.
                </p>

                <div className="mt-6 flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-white">
                    {billingCycle === "yearly" ? "$19.99" : "$29.99"}
                  </span>
                  <span className="text-xs text-zinc-500">/ month</span>
                </div>

                <hr className="my-6 border-zinc-800/80" />

                <ul className="space-y-3.5 text-xs text-zinc-300">
                  <li className="flex items-center gap-3">
                    <Check className="h-4 w-4 text-purple-400 shrink-0" />
                    <span>Everything in Pro Plan</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="h-4 w-4 text-purple-400 shrink-0" />
                    <span className="font-medium text-white">
                      Instant Re-match & Skip Penalties
                    </span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="h-4 w-4 text-purple-400 shrink-0" />
                    <span>City-level Precision Location</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="h-4 w-4 text-purple-400 shrink-0" />
                    <span>Dedicated 24/7 Priority Support</span>
                  </li>
                </ul>
              </div>

              <div className="mt-8">
                <button
                  onClick={() => handleCheckout("vip")}
                  disabled={loadingPlan === "vip"}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl border border-purple-500/40 bg-purple-600/10 px-4 py-3.5 text-xs font-semibold text-purple-300 transition-all hover:bg-purple-600 hover:text-white active:scale-[0.99]"
                >
                  Get Ultimate VIP
                </button>
              </div>
            </div>

          </div>
        </section>

        {/* Feature Grid Highlights */}
        <section className="relative z-10 mx-auto max-w-5xl px-6 py-12">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white md:text-3xl">
              Why Upgrade to Premium?
            </h2>
            <p className="mt-2 text-xs text-zinc-400">
              Here is what sets our Pro experience apart from standard matchmaking.
            </p>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-6 backdrop-blur-xl">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400">
                <SlidersHorizontal className="h-5 w-5" />
              </div>
              <h4 className="mt-4 text-base font-bold text-white">
                Targeted Filters
              </h4>
              <p className="mt-2 text-xs leading-relaxed text-zinc-400">
                Choose preferred gender, age brackets, and geographic regions before searching.
              </p>
            </div>

            <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-6 backdrop-blur-xl">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
                <Zap className="h-5 w-5" />
              </div>
              <h4 className="mt-4 text-base font-bold text-white">
                Zero Wait Times
              </h4>
              <p className="mt-2 text-xs leading-relaxed text-zinc-400">
                Jump to the front of the matchmaking line and connect instantly with live users.
              </p>
            </div>

            <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-6 backdrop-blur-xl">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h4 className="mt-4 text-base font-bold text-white">
                Ad-Free Freedom
              </h4>
              <p className="mt-2 text-xs leading-relaxed text-zinc-400">
                Enjoy uninterrupted conversations without annoying video banners or popups.
              </p>
            </div>
          </div>
        </section>

        {/* FAQ Accordion Section */}
        <section className="relative z-10 mx-auto max-w-3xl px-6 py-12">
          <div className="text-center">
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-400">
              <HelpCircle className="h-4 w-4 text-amber-400" />
              <span>Got Questions?</span>
            </div>
            <h2 className="mt-2 text-2xl font-bold text-white md:text-3xl">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="mt-8 space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="overflow-hidden rounded-2xl border border-zinc-800/80 bg-zinc-900/40 transition-all"
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className="flex w-full items-center justify-between px-6 py-4 text-left text-xs font-semibold text-white transition-colors hover:bg-zinc-800/40"
                >
                  <span>{faq.question}</span>
                  <ChevronDown
                    className={`h-4 w-4 text-zinc-400 transition-transform duration-200 ${
                      openFaq === index ? "rotate-180 text-amber-400" : ""
                    }`}
                  />
                </button>
                {openFaq === index && (
                  <div className="border-t border-zinc-800/60 px-6 py-4 text-xs leading-relaxed text-zinc-400">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="relative z-10 border-t border-zinc-800/80 bg-zinc-950/80 py-6 backdrop-blur-lg mt-12">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 sm:flex-row">
          <div className="flex items-center gap-2 text-xs text-zinc-500">
            <span>© {new Date().getFullYear()} VChatz. Secure SSL Encrypted.</span>
          </div>

          <div className="flex items-center gap-6 text-xs text-zinc-400">
            <a href="/privacy" className="hover:text-white transition-colors">
              Privacy Policy
            </a>
            <a href="/terms" className="hover:text-white transition-colors">
              Terms of Service
            </a>
            <a href="/support" className="hover:text-white transition-colors">
              Contact Support
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}