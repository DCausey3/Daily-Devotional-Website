"use client";

import Link from "next/link";
import { useState } from "react";
import { Feather, Menu, X } from "lucide-react";

export default function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 border-b border-[#1f3b35]/10 bg-[#f8f5ed]/95 backdrop-blur">
      <div className="mx-auto flex h-20 max-w-[1200px] items-center justify-between px-5 md:px-8">
        <Link
          href="/"
          className="group flex items-center gap-3 text-left"
          aria-label="Pastor K home"
        >
          <span className="grid size-10 place-items-center rounded-full border border-[#c9a95c]/50 text-[#a47c24]">
            <Feather size={18} strokeWidth={1.7} />
          </span>
          <span>
            <span className="block font-serif text-[21px] leading-none text-[#132c29]">
              Pastor K
            </span>
            <span className="mt-1 block text-[9px] font-bold tracking-[.24em] text-[#6c776e] uppercase">
              Daily Devotionals
            </span>
          </span>
        </Link>
        <button
          type="button"
          className="grid size-10 place-items-center text-[#173b35] sm:hidden"
          aria-label={menuOpen ? "Close navigation" : "Open navigation"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X /> : <Menu />}
        </button>
        <nav
          className={`${menuOpen ? "absolute inset-x-0 top-20 flex border-b border-[#1f3b35]/10 bg-[#f8f5ed] px-5 py-4 shadow-sm" : "hidden"} flex-col gap-4 sm:static sm:flex sm:flex-row sm:items-center sm:gap-6 sm:border-0 sm:bg-transparent sm:p-0 sm:shadow-none`}
          aria-label="Main navigation"
        >
          <Link href="/" className="nav-link" onClick={() => setMenuOpen(false)}>
            Home
          </Link>
          <Link href="/devotionals" className="nav-link" onClick={() => setMenuOpen(false)}>
            Devotionals
          </Link>
          <Link href="/about" className="nav-link" onClick={() => setMenuOpen(false)}>
            About
          </Link>
          <Link href="/prayer-request" className="nav-link" onClick={() => setMenuOpen(false)}>
            Prayer Request
          </Link>
          <Link href="/contact" className="nav-link" onClick={() => setMenuOpen(false)}>
            Contact
          </Link>
        </nav>
      </div>
    </header>
  );
}
