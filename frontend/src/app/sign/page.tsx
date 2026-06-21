"use client";

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

const SignPdfClient = dynamic(() => import("./SignPdfClient"), {
  ssr: false,
  loading: () => (
    <div className="flex-1 flex items-center justify-center min-h-[60vh]">
      <Loader2 className="h-10 w-10 animate-spin text-primary" />
    </div>
  ),
});

export default function SignPdfPage() {
  return <SignPdfClient />;
}
