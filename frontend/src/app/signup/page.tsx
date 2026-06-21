"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import Link from "next/link";

export default function SignupPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      router.push("/");
    } catch (err: any) {
      setError(err.message || "An error occurred during sign up.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex w-full min-h-[calc(100vh-64px)]">
      {/* Left Pane - Brand Side */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 bg-surface-dark p-12 text-on-dark-soft border-r border-hairline/20">
        <Link href="/" className="flex items-center gap-2">
          <div className="text-on-dark p-1">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M12 18v-6"/><path d="m9 15 3 3 3-3"/></svg>
          </div>
          <span className="font-bold text-xl tracking-tight text-on-dark">PDFMaster</span>
        </Link>
        <div className="max-w-md">
          <h2 className="text-4xl font-display font-normal text-on-dark mb-4 tracking-tight leading-snug">
            Your documents deserve the best tools.
          </h2>
          <p className="text-lg">
            Create an account to securely save your merged, split, and compressed PDFs in one place.
          </p>
        </div>
        <div className="text-sm">
          © {new Date().getFullYear()} PDFMaster Inc.
        </div>
      </div>

      {/* Right Pane - Form Side */}
      <div className="flex-1 flex items-center justify-center p-4 lg:p-8 bg-canvas">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-sm"
        >
          <div className="space-y-6">
            <div className="space-y-2 text-center lg:text-left">
              <h1 className="text-3xl font-display font-medium tracking-tight text-ink">Create an account</h1>
              <p className="text-body text-base">
                Enter your information to get started with PDFMaster.
              </p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 text-sm text-red-600 bg-red-500/10 rounded-md border border-red-500/20">
                  {error}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="John Doe…"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  autoComplete="name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com…"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  spellCheck={false}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                />
              </div>
              <div className="pt-2 flex flex-col gap-4">
                <Button type="submit" className="w-full bg-ink text-canvas hover:bg-ink/90" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 aria-hidden="true" className="mr-2 h-4 w-4 animate-spin" />
                      Creating account…
                    </>
                  ) : (
                    "Create Account"
                  )}
                </Button>
                <div className="text-sm text-center lg:text-left text-muted">
                  Already have an account?{" "}
                  <Link href="/login" className="text-ink font-medium hover:underline underline-offset-4">
                    Sign in
                  </Link>
                </div>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
