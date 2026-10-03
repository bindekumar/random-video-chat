import Link from "next/link";
import {
  CreditCard,
  ShieldCheck,
  Lock,
  CheckCircle2,
  ArrowLeft,
  Crown,
  Sparkles,
  Tag,
} from "lucide-react";

export default function CheckoutPage() {
  return (
    <div className="relative flex min-h-screen flex-col justify-between overflow-hidden bg-zinc-950 font-sans text-zinc-100 antialiased selection:bg-amber-500 selection:text-zinc-950">
      {/* Background Glows */}
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[500px] w-[700px] -translate-x-1/2 rounded-full bg-amber-500/10 blur-[140px]" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-[400px] w-[400px] rounded-full bg-blue-600/10 blur-[140px]" />

      <div>
        {/* Header */}
        <header className="sticky top-0 z-50 border-b border-zinc-800/80 bg-zinc-950/60 backdrop-blur-xl">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
            <Link
              href="/premium"
              className="flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900/50 px-3.5 py-2 text-xs font-medium text-zinc-300 transition-all hover:border-zinc-700 hover:bg-zinc-800 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Plans</span>
            </Link>

            <div className="flex items-center gap-2 text-xs font-semibold text-zinc-400">
              <Lock className="h-3.5 w-3.5 text-emerald-400" />
              <span>256-Bit SSL Secured Checkout</span>
            </div>
          </div>
        </header>

        {/* Main Section */}
        <main className="relative z-10 mx-auto max-w-6xl px-6 py-10">
          <div className="grid gap-8 lg:grid-cols-12">
            
            {/* Payment Details Form (Left - 7 Columns) */}
            <div className="space-y-6 lg:col-span-7">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-white md:text-3xl">
                  Complete Your Order
                </h1>
                <p className="mt-1 text-xs text-zinc-400">
                  Select your preferred payment method and confirm details.
                </p>
              </div>

              {/* Payment Method Selector */}
              <div className="rounded-3xl border border-zinc-800/80 bg-zinc-900/40 p-6 backdrop-blur-xl">
                <h3 className="text-sm font-semibold text-white">Select Payment Method</h3>

                <div className="mt-4 grid grid-cols-3 gap-3">
                  <div className="flex flex-col items-center justify-center rounded-2xl border border-amber-500 bg-amber-500/10 p-4 text-xs font-semibold text-amber-400 cursor-pointer">
                    <CreditCard className="mb-2 h-5 w-5" />
                    <span>Card</span>
                  </div>

                  <div className="flex flex-col items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4 text-xs font-semibold text-zinc-400 opacity-60">
                    <span className="mb-2 text-base font-bold italic tracking-tighter">PayPal</span>
                    <span>PayPal</span>
                  </div>

                  <div className="flex flex-col items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4 text-xs font-semibold text-zinc-400 opacity-60">
                    <Sparkles className="mb-2 h-5 w-5" />
                    <span>UPI / QR</span>
                  </div>
                </div>

                {/* Card Input Fields */}
                <form className="mt-6 space-y-4">
                  <div>
                    <label className="block text-[11px] font-medium text-zinc-400">
                      Cardholder Name
                    </label>
                    <input
                      type="text"
                      readOnly
                      defaultValue="John Doe"
                      className="mt-1.5 w-full rounded-xl border border-zinc-800 bg-zinc-950/60 px-4 py-2.5 text-xs text-white placeholder-zinc-600 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-zinc-400">
                      Card Number
                    </label>
                    <input
                      type="text"
                      readOnly
                      defaultValue="4532 •••• •••• 8890"
                      className="mt-1.5 w-full rounded-xl border border-zinc-800 bg-zinc-950/60 px-4 py-2.5 text-xs text-white placeholder-zinc-600 outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-medium text-zinc-400">
                        Expiry Date
                      </label>
                      <input
                        type="text"
                        readOnly
                        defaultValue="12/28"
                        className="mt-1.5 w-full rounded-xl border border-zinc-800 bg-zinc-950/60 px-4 py-2.5 text-xs text-white placeholder-zinc-600 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-zinc-400">
                        CVV
                      </label>
                      <input
                        type="password"
                        readOnly
                        defaultValue="123"
                        className="mt-1.5 w-full rounded-xl border border-zinc-800 bg-zinc-950/60 px-4 py-2.5 text-xs text-white placeholder-zinc-600 outline-none"
                      />
                    </div>
                  </div>

                  <Link
                    href="/dashboard"
                    className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 px-6 py-3.5 text-xs font-bold text-zinc-950 transition-all hover:from-amber-300 hover:to-amber-500 active:scale-[0.99] shadow-lg shadow-amber-500/20"
                  >
                    <Lock className="h-3.5 w-3.5" />
                    <span>Pay $119.88 Now</span>
                  </Link>
                </form>
              </div>
            </div>

            {/* Order Summary (Right - 5 Columns) */}
            <div className="space-y-6 lg:col-span-5">
              <div className="rounded-3xl border border-amber-500/30 bg-gradient-to-b from-amber-500/10 via-zinc-900/60 to-zinc-900/80 p-6 backdrop-blur-2xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Crown className="h-5 w-5 text-amber-400" />
                    <h3 className="text-base font-bold text-white capitalize">
                      Pro Pass
                    </h3>
                  </div>
                  <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-[10px] font-bold uppercase text-amber-400">
                    Annual Billing
                  </span>
                </div>

                <div className="mt-6 space-y-3 text-xs text-zinc-300">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                    <span>Gender & Location Match Filters</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                    <span>Priority Queue Placement</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                    <span>100% Ad-Free Experience</span>
                  </div>
                </div>

                <hr className="my-6 border-zinc-800/80" />

                {/* Promo Code Input */}
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
                    <input
                      type="text"
                      readOnly
                      placeholder="Promo Code"
                      className="w-full rounded-xl border border-zinc-800 bg-zinc-950/60 pl-9 pr-3 py-2 text-xs text-white placeholder-zinc-600 outline-none"
                    />
                  </div>
                  <button
                    type="button"
                    className="rounded-xl border border-zinc-800 bg-zinc-800/60 px-4 py-2 text-xs font-semibold text-zinc-400"
                  >
                    Apply
                  </button>
                </div>

                <hr className="my-6 border-zinc-800/80" />

                {/* Pricing Calculation */}
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-zinc-400">
                    <span>Monthly Rate</span>
                    <span>$9.99 / mo</span>
                  </div>

                  <div className="flex justify-between text-zinc-400">
                    <span>Duration</span>
                    <span>12 Months</span>
                  </div>

                  <div className="flex justify-between pt-3 text-base font-bold text-white border-t border-zinc-800/80">
                    <span>Total Due Today</span>
                    <span className="text-amber-400">$119.88</span>
                  </div>
                </div>
              </div>

              {/* Security Guarantee Badge */}
              <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-4 backdrop-blur-xl">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="h-6 w-6 text-emerald-400 shrink-0" />
                  <div className="text-xs">
                    <p className="font-semibold text-white">30-Day Money-Back Guarantee</p>
                    <p className="text-zinc-400 mt-0.5">Cancel anytime from your profile settings.</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </main>
      </div>

      {/* Footer */}
      <footer className="relative z-10 border-t border-zinc-800/80 bg-zinc-950/80 py-6 backdrop-blur-lg">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 text-xs text-zinc-500">
          <span>© {new Date().getFullYear()} VChatz. All rights reserved.</span>
          <span>Encrypted Payment System</span>
        </div>
      </footer>
    </div>
  );
}