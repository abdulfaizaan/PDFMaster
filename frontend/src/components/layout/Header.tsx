"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { FileDown, Menu, LogOut, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { ThemeToggle } from '@/components/theme-toggle';

export function Header() {
  const { user, logout, isLoading } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-hairline bg-canvas/80 backdrop-blur-[20px] saturate-180">
      <div className="container mx-auto max-w-[1024px] h-16 flex items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
          <div className="text-ink">
            <FileDown aria-hidden="true" className="h-6 w-6" />
          </div>
          <span className="font-[600] text-[21px] tracking-[0.231px] text-ink hidden sm:inline-block">
            MergeMaster
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6 text-[14px] font-[400] text-ink">
          <Link href="/merge" className="hover:text-primary transition-colors">Merge PDF</Link>
          <Link href="/split" className="hover:text-primary transition-colors">Split PDF</Link>
          <Link href="/edit" className="hover:text-primary transition-colors">Edit PDF</Link>
          <Link href="/compress" className="hover:text-primary transition-colors">Compress PDF</Link>
          <Link href="/chat" className="hover:text-primary transition-colors">AI Chat</Link>
        </nav>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-4 text-[14px]">
            {isLoading ? (
              <div className="w-16 h-5 animate-pulse bg-surface-soft rounded" />
            ) : user ? (
              <button onClick={logout} className="hover:text-primary transition-colors flex items-center gap-1 text-ink">
                Logout
              </button>
            ) : (
              <Link href="/login" className="hover:text-primary transition-colors text-ink">Sign In</Link>
            )}
            <ThemeToggle />
          </div>

          {/* Mobile Menu Button */}
          <Button variant="ghost" size="icon" className="md:hidden text-ink" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-hairline bg-canvas">
          <div className="flex flex-col p-4 gap-4 text-[17px] font-[400] text-ink">
            <Link href="/merge" className="py-2 hover:text-primary" onClick={() => setIsMobileMenuOpen(false)}>Merge PDF</Link>
            <Link href="/split" className="py-2 hover:text-primary" onClick={() => setIsMobileMenuOpen(false)}>Split PDF</Link>
            <Link href="/edit" className="py-2 hover:text-primary" onClick={() => setIsMobileMenuOpen(false)}>Edit PDF</Link>
            <Link href="/compress" className="py-2 hover:text-primary" onClick={() => setIsMobileMenuOpen(false)}>Compress PDF</Link>
            <Link href="/chat" className="py-2 hover:text-primary" onClick={() => setIsMobileMenuOpen(false)}>AI Chat</Link>
            <div className="h-[1px] bg-hairline my-2" />
            <div className="flex items-center justify-between">
              {user ? (
                 <button onClick={() => { logout(); setIsMobileMenuOpen(false); }} className="py-2 hover:text-primary">
                   Logout
                 </button>
              ) : (
                <Link href="/login" className="py-2 hover:text-primary" onClick={() => setIsMobileMenuOpen(false)}>Sign In</Link>
              )}
              <ThemeToggle />
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
