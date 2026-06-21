"use client";

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

const OrganizePdfClient = dynamic(() => import("./OrganizePdfClient"), {
  ssr: false,
  loading: () => (
    <div className="flex-1 flex items-center justify-center min-h-[60vh]">
      <Loader2 className="h-10 w-10 animate-spin text-primary" />
    </div>
  ),
});

export default function OrganizePdfPage() {
  return <OrganizePdfClient />;
}
