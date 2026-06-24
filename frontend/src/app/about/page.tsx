import { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us | MergeMaster",
  description: "Learn more about MergeMaster, the free online PDF editor.",
};

export default function AboutPage() {
  return (
    <div className="container mx-auto max-w-[800px] py-16 px-4">
      <h1 className="text-4xl font-bold text-ink mb-8">About Us</h1>
      <div className="prose prose-lg text-ink-muted-80 space-y-6">
        <p>
          Welcome to MergeMaster, your reliable partner for all your digital document needs. 
          We believe that managing PDF files should be simple, fast, and completely free.
        </p>
        <p>
          Our mission is to provide professional-grade PDF tools without the steep learning curves or expensive subscriptions typically associated with document management software. Whether you're a student compiling research, a professional managing contracts, or simply someone trying to organize personal documents, our suite of tools is designed with you in mind.
        </p>
        <h2 className="text-2xl font-semibold text-ink mt-8 mb-4">Our Core Values</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>Simplicity:</strong> We build tools that are intuitive and easy to use.</li>
          <li><strong>Privacy:</strong> We respect your data. Your files are processed securely.</li>
          <li><strong>Accessibility:</strong> High-quality tools should be accessible to everyone, for free.</li>
        </ul>
        <p className="mt-8">
          Thank you for choosing MergeMaster. We're constantly working to improve our platform and add new features to make your document workflow as seamless as possible.
        </p>
      </div>
    </div>
  );
}
