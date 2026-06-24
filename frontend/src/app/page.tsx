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

      {/* SEO Content Section */}
      <section className="w-full max-w-[1024px] px-4 py-16 md:py-24 bg-canvas text-ink-muted-80 space-y-6 text-left border-t border-hairline mt-12">
        <h2 className="text-[32px] font-[600] text-ink mb-6">The Ultimate PDF Editor for All Your Document Needs</h2>
        
        <p className="text-[17px] leading-relaxed">
          Welcome to your all-in-one digital workspace. When you need a comprehensive <strong>PDF Editor</strong> to manage, modify, and enhance your digital documents, we have everything you need in one centralized platform. In today's fast-paced digital environment, managing files efficiently is more critical than ever. Professionals, students, and casual users alike need dependable solutions that don't require expensive software subscriptions. That is exactly why we bring you tools that function seamlessly, much like the popular platforms you may already be familiar with, such as <em>i love pdf</em>, but engineered with our own unique blend of speed, uncompromising privacy, and rock-solid reliability.
        </p>

        <p className="text-[17px] leading-relaxed">
          Are you tired of downloading bulky, resource-heavy software just to make minor tweaks to your documents? Our versatile <strong>pdf editor</strong> lets you modify your files directly from your web browser, saving you time and device storage. With a few simple clicks, you can effortlessly <strong>convert pdf to word</strong> for quick text modifications, ensuring that your formatting remains intact. We also make it incredibly easy to transform your visual assets using our highly optimized <strong>jpg to pdf</strong> and <strong>png to pdf</strong> tools. If you have the opposite requirement—perhaps needing to extract images for a presentation—our <strong>pdf to jpg</strong> conversion feature ensures high-quality image extraction from any document page. A versatile <strong>pdf converter</strong> is an absolute must-have for anyone who handles digital paperwork regularly. We even support varied and niche formats, ensuring you can swiftly convert <strong>pdf to to wordm</strong> and other specialized extensions as dictated by your workflow requirements.
        </p>

        <h3 className="text-[24px] font-[600] text-ink mt-8 mb-4">Combine and Organize with the Best PDF Combiner</h3>
        
        <p className="text-[17px] leading-relaxed">
          Handling multiple separate files can be a frustrating hassle, especially when you need to send them as a single, cohesive email attachment or submit them to an online portal. This is precisely where our powerful <strong>pdf combiner</strong> comes into play. You can quickly and intuitively <strong>combine pdf</strong> files into one neat, meticulously organized document. If you have several monthly reports, scanned receipts, or lecture notes, simply use our intuitive drag-and-drop interface to <strong>merge pdf</strong> files together in the exact order you want. A good merge tool saves an incredible amount of time and significantly reduces desktop clutter, making it far easier to share important information with your colleagues, professors, or clients without the risk of missing pages.
        </p>

        <h3 className="text-[24px] font-[600] text-ink mt-8 mb-4">Optimize Your Files: Advanced PDF Compressor</h3>
        
        <p className="text-[17px] leading-relaxed">
          Large, unoptimized files can be notoriously difficult to share via email or upload to strict web portals that enforce strict file size limits. With our advanced <strong>pdf compressor</strong>, you can easily <strong>compress pdf</strong> documents without noticeably compromising their visual quality or text legibility. Our smart compression algorithms strike the perfect balance, ensuring your files remain perfectly readable and highly professional while taking up merely a fraction of their original storage space. A reliable compressor is essential for long-term digital archiving, faster web uploads, and quick sharing on mobile devices. When you combine this powerful feature with our <strong>free pdf editor</strong>, you have a complete, enterprise-grade suite of document tools right at your fingertips.
        </p>

        <h3 className="text-[24px] font-[600] text-ink mt-8 mb-4">Your Go-To PDF Converter and Document Suite</h3>
        
        <p className="text-[17px] leading-relaxed">
          In summary, whether you need to quickly annotate a page or require a robust, full-featured suite of document manipulation tools, our platform is expertly designed to cater to all your digital needs. The unparalleled ability to seamlessly <strong>convert pdf to word</strong>, leverage a dependable and lightning-fast <strong>pdf converter</strong>, and efficiently <strong>merge pdf</strong> or <strong>compress pdf</strong> files makes our website a vital daily resource for your digital tasks. We take immense pride in offering a <strong>free pdf editor</strong> that easily rivals the most expensive software packages on the market today. Stop wasting your valuable time with complicated, unintuitive software installations. Try our suite of online tools today and experience firsthand the extraordinary ease of having a top-tier <strong>pdf combiner</strong>, an efficient <strong>jpg to pdf</strong> utility, and so much more—all available instantly, securely, and completely free directly within your web browser.
        </p>
      </section>

      {/* FAQ Section */}
      <section className="w-full max-w-[1024px] px-4 py-16 md:py-24 bg-canvas border-t border-hairline">
        <div className="text-center mb-12">
          <h2 className="text-[32px] font-[600] text-ink mb-4">Frequently Asked Questions</h2>
          <p className="text-[17px] text-ink-muted-80">Got questions? We've got answers.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h3 className="text-[20px] font-[600] text-ink">Is this PDF editor completely free?</h3>
            <p className="text-[17px] text-ink-muted-80 leading-relaxed">
              Yes, all of our core tools, including the PDF combiner, compressor, and converters, are 100% free to use with no hidden fees.
            </p>
          </div>
          <div className="space-y-4">
            <h3 className="text-[20px] font-[600] text-ink">Are my uploaded files secure?</h3>
            <p className="text-[17px] text-ink-muted-80 leading-relaxed">
              Absolutely. We prioritize your privacy. All uploaded documents are processed securely and automatically deleted from our servers shortly after processing.
            </p>
          </div>
          <div className="space-y-4">
            <h3 className="text-[20px] font-[600] text-ink">Can I convert a PDF to Word?</h3>
            <p className="text-[17px] text-ink-muted-80 leading-relaxed">
              Yes, you can easily use our PDF to Word converter to make your documents editable without losing their original formatting.
            </p>
          </div>
          <div className="space-y-4">
            <h3 className="text-[20px] font-[600] text-ink">Does it work on mobile devices?</h3>
            <p className="text-[17px] text-ink-muted-80 leading-relaxed">
              Yes, our website is fully mobile-responsive. You can seamlessly compress PDFs, merge files, or convert them directly from your smartphone or tablet browser.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
