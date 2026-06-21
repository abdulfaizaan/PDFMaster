"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button, buttonVariants } from '@/components/ui/button';
import { FileDown, Menu, LogOut, User as UserIcon } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/components/theme-toggle';

export function Header() {
  const { user, logout, isLoading } = useAuth();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={cn(
      "sticky top-0 z-50 w-full transition-all duration-200",
      scrolled ? "bg-background border-b border-hairline/40 shadow-sm" : "bg-transparent border-transparent"
    )}>
      <div className="container mx-auto max-w-7xl px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <div className="bg-primary text-primary-foreground p-1.5 rounded-lg shadow-sm">
              <FileDown aria-hidden="true" className="h-5 w-5" />
            </div>
            <span className="font-bold text-xl tracking-tight">PDFMaster</span>
          </Link>
          <nav className="hidden md:flex ml-8 gap-6 text-sm font-medium text-muted-foreground">
            <Link href="/merge" className="transition-colors hover:text-foreground">Merge PDF</Link>
            <Link href="/split" className="transition-colors hover:text-foreground">Split PDF</Link>
            <Link href="/compress" className="transition-colors hover:text-foreground">Compress PDF</Link>
            <Link href="/sign" className="transition-colors hover:text-foreground">Sign PDF</Link>
            <Link href="/jpg-to-pdf" className="transition-colors hover:text-foreground">JPG to PDF</Link>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden md:flex gap-2 items-center">
            {isLoading ? (
              <div className="w-20 h-8 animate-pulse bg-muted rounded-md" />
            ) : user ? (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <UserIcon aria-hidden="true" className="h-4 w-4" />
                  {user.fullName}
                </div>
                <Button variant="ghost" size="sm" onClick={logout} className="text-muted-foreground hover:text-foreground">
                  <LogOut aria-hidden="true" className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </div>
            ) : (
              <>
                  <ThemeToggle />
                  <Link className={cn(buttonVariants({ variant: "ghost", size: "sm" }))} href="/login">
                    Sign in
                  </Link>
                  <Link className={cn(buttonVariants({ size: "sm" }))} href="/signup">
                    Get Started
                  </Link>
              </>
            )}
          </div>
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu aria-hidden="true" className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
