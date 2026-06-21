import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { ArrowRight, FileType, Combine, Scissors, FileArchive, Layers, FileSignature, FileImage } from "lucide-react";
import Link from "next/link";

const tools = [
  {
    title: "Merge PDF",
    description: "Combine multiple PDFs into one unified document.",
    icon: <Combine aria-hidden="true" className="h-6 w-6 text-blue-500" />,
    href: "/merge",
    color: "bg-blue-500/10 border-blue-500/20",
  },
  {
    title: "Split PDF",
    description: "Extract pages or split a PDF into multiple files.",
    icon: <Scissors aria-hidden="true" className="h-6 w-6 text-orange-500" />,
    href: "/split",
    color: "bg-orange-500/10 border-orange-500/20",
  },
  {
    title: "Compress PDF",
    description: "Reduce file size without losing quality.",
    icon: <FileArchive aria-hidden="true" className="h-6 w-6 text-green-500" />,
    href: "/compress",
    color: "bg-green-500/10 border-green-500/20",
  },

  {
    title: "JPG to PDF",
    description: "Combine multiple JPG or PNG images into a PDF.",
    icon: <FileImage aria-hidden="true" className="h-6 w-6 text-pink-500" />,
    href: "/jpg-to-pdf",
    color: "bg-pink-500/10 border-pink-500/20",
  },
  {
    title: "Organize PDF",
    description: "Sort, delete, and rearrange PDF pages.",
    icon: <Layers aria-hidden="true" className="h-6 w-6 text-indigo-500" />,
    href: "/organize",
    color: "bg-indigo-500/10 border-indigo-500/20",
  },
  {
    title: "Sign PDF",
    description: "Add your digital signature to documents.",
    icon: <FileSignature aria-hidden="true" className="h-6 w-6 text-rose-500" />,
    href: "/sign",
    color: "bg-rose-500/10 border-rose-500/20",
  },
];

export default function Home() {
  return (
    <div className="flex flex-col items-center">
      {/* Hero Section */}
      <section className="w-full py-24 md:py-32 flex flex-col items-center justify-center text-center px-4 bg-canvas">
        <div className="inline-flex items-center rounded-full border border-hairline bg-surface-soft px-3 py-1 text-sm text-ink mb-8 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-4 duration-700">
          <span className="flex h-2 w-2 rounded-full bg-primary mr-2 motion-safe:animate-pulse"></span>
          PDFMaster&nbsp;v2.0 is now live
        </div>
        
        <h1 className="text-5xl md:text-6xl lg:text-[64px] leading-[1.05] font-display font-normal tracking-[-1.5px] max-w-4xl mb-6 text-balance text-ink motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-6 duration-700 delay-100">
          Meet your new document partner
        </h1>
        
        <p className="text-lg md:text-xl text-body max-w-2xl mb-10 text-balance motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-8 duration-700 delay-200">
          Merge, split, compress, convert, and edit your PDFs for free. 
          The ultimate open-source alternative to proprietary tools.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-10 duration-700 delay-300">
          <Link href="/merge" className={cn(buttonVariants({ size: "lg" }), "px-8")}>
            Get Started <ArrowRight aria-hidden="true" className="ml-2 h-5 w-5" />
          </Link>
          <a href="#features" className={cn(buttonVariants({ size: "lg", variant: "secondary" }), "px-8")}>
            View All Tools
          </a>
        </div>
      </section>

      <section id="features" className="w-full max-w-7xl px-4 py-16 md:py-24">
        <div className="text-center mb-16 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-4 duration-700">
          <h2 className="text-4xl md:text-5xl font-display font-normal tracking-[-1px] mb-4 text-balance">Most Popular Tools</h2>
          <p className="text-muted text-lg">Join millions of users who trust PDFMaster for their document needs.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tools.map((tool, index) => (
            <Link href={tool.href} key={index} className="group block h-full">
              <Card className="h-full p-8 transition-all duration-300 bg-surface-card border-none hover:bg-surface-cream-strong hover:-translate-y-1 hover:shadow-lg hover:shadow-surface-dark/5 dark:hover:shadow-black/20 relative overflow-hidden">
                <div className={`h-12 w-12 flex items-center justify-center mb-6 transition-transform duration-300 group-hover:scale-110 group-hover:text-primary`}>
                  {tool.icon}
                </div>
                <h3 className="text-lg font-medium mb-2 text-ink transition-colors duration-300 group-hover:text-primary">{tool.title}</h3>
                <p className="text-body leading-relaxed">
                  {tool.description}
                </p>
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
