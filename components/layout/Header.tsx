"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { UserPlus, LogIn, Menu, X } from "lucide-react";

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: "About", href: "/about" },
    { name: "Safety", href: "/safety" },
    { name: "Community", href: "/community" },
    { name: "Blog", href: "/blog" },
    { name: "FAQ", href: "/faq" },
  ];

  return (
    <header className="fixed top-0 left-0 z-50 w-full border-b border-slate-100 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-[1500px] items-center justify-between px-4 sm:h-18 sm:px-6 lg:h-20 lg:px-8">
        
        {/* LOGO */}
        <Link
          href="/"
          className="flex shrink-0 items-center transition-transform duration-200 hover:scale-[1.02]"
        >
          <Image
            src="/logo-header.png"
            alt="VChatz"
            width={160}
            height={55}
            priority
            className="h-auto w-[110px] sm:w-[130px] lg:w-[145px]"
          />
        </Link>

        {/* DESKTOP NAVIGATION */}
        <nav className="hidden items-center gap-6 lg:flex xl:gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="text-sm font-semibold text-slate-600 transition-colors hover:text-blue-600"
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* DESKTOP AUTH BUTTONS */}
        <div className="hidden items-center gap-3 lg:flex">
          <Link
            href="/login"
            className="rounded-xl px-4 py-2 text-sm font-bold text-[#1455e8] transition-colors hover:bg-blue-50"
          >
            Sign In
          </Link>

          <Link
            href="/register"
            className="flex items-center gap-1.5 rounded-xl bg-[#1455e8] px-4 py-2.5 text-sm font-bold text-white shadow-md shadow-blue-500/20 transition-all hover:bg-blue-600 active:scale-95"
          >
            <UserPlus className="h-4 w-4" />
            <span>Sign Up</span>
          </Link>
        </div>

        {/* MOBILE MENU TOGGLE BUTTON */}
        <button
          onClick={() => setIsMobileMenuOpen((prev) => !prev)}
          aria-expanded={isMobileMenuOpen}
          aria-controls="mobile-menu"
          aria-label="Toggle Navigation Menu"
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-700 transition-colors hover:bg-slate-50 lg:hidden"
        >
          {isMobileMenuOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* MOBILE MENU DRAWER */}
      <div
        id="mobile-menu"
        className={`border-b border-slate-100 bg-white px-5 py-5 shadow-xl transition-all duration-200 ease-in-out lg:hidden ${
          isMobileMenuOpen
            ? "translate-y-0 opacity-100 pointer-events-auto block"
            : "-translate-y-2 opacity-0 pointer-events-none hidden"
        }`}
      >
        <nav className="flex flex-col gap-1.5">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              onClick={() => setIsMobileMenuOpen(false)}
              className="rounded-xl px-3.5 py-2.5 text-base font-semibold text-slate-700 transition-colors hover:bg-slate-50 hover:text-blue-600"
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* MOBILE AUTH BUTTONS (INSIDE MENU DRAWER) */}
        <div className="mt-5 flex flex-col gap-2.5 border-t border-slate-100 pt-4">
          <Link
            href="/login"
            onClick={() => setIsMobileMenuOpen(false)}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 py-2.5 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-50"
          >
            <LogIn className="h-4 w-4 text-slate-500" />
            <span>Sign In</span>
          </Link>

          <Link
            href="/register"
            onClick={() => setIsMobileMenuOpen(false)}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#1455e8] py-2.5 text-sm font-bold text-white shadow-md shadow-blue-500/20 transition-all hover:bg-blue-600 active:scale-[0.98]"
          >
            <UserPlus className="h-4 w-4" />
            <span>Sign Up</span>
          </Link>
        </div>
      </div>
    </header>
  );
}