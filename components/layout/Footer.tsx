"use client";

import Link from "next/link";

export default function Footer() {
  return (
    <footer className="relative z-20 border-t border-slate-100 bg-white">
      <div className="mx-auto flex max-w-[1500px] flex-col items-center justify-between gap-4 px-5 py-5 text-xs text-slate-500 sm:flex-row sm:px-8 lg:px-10">
        <p>© {new Date().getFullYear()} VChatz. All rights reserved.</p>

        <div className="flex flex-wrap justify-center gap-5 font-medium">
          <Link
            href="/privacy"
            className="transition-colors hover:text-blue-600"
          >
            Privacy Policy
          </Link>

          <Link
            href="/terms"
            className="transition-colors hover:text-blue-600"
          >
            Terms of Service
          </Link>

          <Link
            href="/community-guidelines"
            className="transition-colors hover:text-blue-600"
          >
            Safety Guidelines
          </Link>
        </div>
      </div>
    </footer>
  );
}