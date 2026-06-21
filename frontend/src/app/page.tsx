import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { ArrowRight, Combine, Scissors, FileArchive, Layers, FileSignature, FileImage, Type } from "lucide-react";
import Link from "next/link";

const tools = [
  {
    title: "Merge PDF",
    description: "Combine multiple PDFs into one unified document.",
    icon: <Combine aria-hidden="true" className="h-6 w-6 text-primary" />,
    href: "/merge",
  },
  {
    title: "Split PDF",
    description: "Extract pages or split a PDF into multiple files.",
    icon: <Scissors aria-hidden="true" className="h-6 w-6 text-primary" />,
    href: "/split",
  },
  {
    title: "Edit PDF",
    description: "Add text, annotations, and edit your PDF files securely in your browser.",
    icon: <Type aria-hidden="true" className="h-6 w-6 text-primary" />,
    href: "/edit",
  },
  {
    title: "Compress PDF",
    description: "Reduce file size without losing quality.",
    icon: <FileArchive aria-hidden="true" className="h-6 w-6 text-primary" />,
    href: "/compress",
  },
  {
    title: "JPG to PDF",
    description: "Combine multiple JPG or PNG images into a PDF.",
    icon: <FileImage aria-hidden="true" className="h-6 w-6 text-primary" />,
    href: "/jpg-to-pdf",
  },
  {
    title: "Organize PDF",
    description: "Sort, delete, and rearrange PDF pages.",
    icon: <Layers aria-hidden="true" className="h-6 w-6 text-primary" />,
    href: "/organize",
  },
  {
    title: "Sign PDF",
    description: "Add your digital signature to documents.",
    icon: <FileSignature aria-hidden="true" className="h-6 w-6 text-primary" />,
    href: "/sign",
  },
];

export default function Home() {
  return (
    <div className="flex flex-col items-center bg-canvas">
      {/* Hero Section */}
      <section className="w-full py-24 md:py-32 flex flex-col items-center justify-center text-center px-4 bg-canvas">
        <div className="inline-flex items-center rounded-full border border-hairline bg-surface-soft px-3 py-1 text-[14px] text-ink mb-8 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-4 duration-700">
          <span className="flex h-2 w-2 rounded-full bg-primary mr-2 motion-safe:animate-pulse"></span>
          MergeMaster&nbsp;v2.0 is now live
        </div>
        
        <h1 className="text-[56px] md:text-[64px] leading-[1.05] font-[600] tracking-[-1.5px] max-w-4xl mb-6 text-balance text-ink motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-6 duration-700 delay-100">
          Meet your new document partner
        </h1>
        
        <p className="text-[21px] text-ink-muted-80 max-w-2xl mb-10 text-balance leading-[1.38] motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-8 duration-700 delay-200">
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

      <section id="features" className="w-full max-w-[1024px] px-4 py-16 md:py-24 bg-canvas">
        <div className="text-center mb-16 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-4 duration-700">
          <h2 className="text-[40px] font-[600] tracking-[-1px] mb-4 text-balance text-ink">Most Popular Tools</h2>
          <p className="text-ink-muted-48 text-[21px]">Join millions of users who trust MergeMaster for their document needs.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tools.map((tool, index) => {
            // Determine if this is the last item and it sits alone on a row
            const isLast = index === tools.length - 1;
            const isLonelyDesktop = isLast && tools.length % 3 === 1;
            const isLonelyTablet = isLast && tools.length % 2 === 1;

            return (
              <div 
                key={index}
                className={cn(
                  "h-full",
                  isLonelyDesktop && "lg:col-start-2",
                  isLonelyTablet && "md:col-span-2 lg:col-span-1 md:flex md:justify-center lg:block"
                )}
              >
                <Link 
                  href={tool.href} 
                  className={cn(
                    "group block h-full w-full",
                    isLonelyTablet && "md:w-[calc(50%-12px)] lg:w-full"
                  )}
                >
                  <Card className="h-full p-8 transition-all duration-300 bg-surface-card border border-hairline hover:bg-surface-soft hover:-translate-y-1 hover:shadow-lg relative overflow-hidden">
                    <div className={`h-12 w-12 flex items-center justify-center mb-6 transition-transform duration-300 group-hover:scale-110`}>
                      {tool.icon}
                    </div>
                    <h3 className="text-[21px] font-[600] mb-2 text-ink">{tool.title}</h3>
                    <p className="text-[17px] text-ink-muted-80 leading-relaxed">
                      {tool.description}
                    </p>
                  </Card>
                </Link>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
