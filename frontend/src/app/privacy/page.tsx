import React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | PDFMaster",
  description: "Privacy policy for PDFMaster PDF converter and editor.",
};

export default function PrivacyPolicy() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-16">
      <h1 className="text-4xl font-extrabold tracking-tight mb-8">Privacy Policy</h1>
      
      <div className="prose prose-slate dark:prose-invert max-w-none space-y-6">
        <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
        
        <section>
          <h2 className="text-2xl font-semibold mt-8 mb-4">1. Local Processing Guarantee</h2>
          <p>
            PDFMaster is built on a local-first architecture. When you use our core tools (such as Compress PDF, PDF Merge, and PDF Converter), <strong>your files never leave your device</strong>. All processing is done securely within your web browser using WebAssembly. We do not upload, store, or have any access to your documents.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mt-8 mb-4">2. AI Document Intelligence</h2>
          <p>
            If you choose to use our "Chat with PDF" feature, the text from your document is extracted locally in your browser. Only the raw text snippets necessary to answer your questions are securely transmitted to our AI provider (Groq) for processing. The original PDF file is never uploaded.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mt-8 mb-4">3. Account Information</h2>
          <p>
            If you create an account, we store your email address and basic profile information securely via our authentication provider (Supabase). We do not sell or share this information with third parties.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mt-8 mb-4">4. Analytics</h2>
          <p>
            We may collect anonymous, aggregated usage data (such as page views and tool usage frequencies) to help us improve the platform. This data contains no personally identifiable information.
          </p>
        </section>
      </div>
    </div>
  );
}
