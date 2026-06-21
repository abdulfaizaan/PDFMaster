import React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms and Conditions | PDFMaster",
  description: "Terms and conditions for using PDFMaster services.",
};

export default function TermsAndConditions() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-16">
      <h1 className="text-4xl font-extrabold tracking-tight mb-8">Terms and Conditions</h1>
      
      <div className="prose prose-slate dark:prose-invert max-w-none space-y-6">
        <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
        
        <section>
          <h2 className="text-2xl font-semibold mt-8 mb-4">1. Acceptance of Terms</h2>
          <p>
            By accessing and using PDFMaster, you agree to be bound by these Terms and Conditions. If you do not agree with any part of these terms, you may not use our service.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mt-8 mb-4">2. Use of Service</h2>
          <p>
            PDFMaster provides tools such as PDF free download, PDF converter, PDF merge, and document compression. You agree to use these services only for lawful purposes and in accordance with these Terms. You are solely responsible for the content of the documents you process using our tools.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mt-8 mb-4">3. Fair Use</h2>
          <p>
            While we offer a PDF converter free of charge, we reserve the right to rate-limit or restrict access to users who abuse the platform, generate excessive automated requests, or attempt to circumvent security measures, including our AI rate limits.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mt-8 mb-4">4. Limitation of Liability</h2>
          <p>
            PDFMaster is provided "as is" without warranties of any kind. We are not liable for any lost data, corrupted files, or damages resulting from the use of our services. Always maintain backups of your important documents before processing them.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mt-8 mb-4">5. Intellectual Property</h2>
          <p>
            You retain all rights to your documents. PDFMaster does not claim any ownership over the files you process. The PDFMaster software, design, and code are protected by intellectual property laws.
          </p>
        </section>
      </div>
    </div>
  );
}
