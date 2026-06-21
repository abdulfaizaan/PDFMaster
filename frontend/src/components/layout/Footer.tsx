import Link from 'next/link';
import { FileDown } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-canvas-parchment text-ink-muted-80 border-t border-hairline">
      <div className="container mx-auto max-w-[1024px] px-4 py-16">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-5">
          <div className="col-span-2 lg:col-span-2 flex flex-col gap-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="text-ink">
                <FileDown aria-hidden="true" className="h-6 w-6" />
              </div>
              <span className="font-[600] text-[21px] tracking-tight text-ink">MergeMaster</span>
            </Link>
            <p className="text-[14px] max-w-xs leading-relaxed text-ink-muted-80">
              The ultimate open-source PDF toolkit. Merge, split, compress, convert, and edit PDFs for free without any limits.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <h3 className="font-[600] text-ink text-[14px]">Tools</h3>
            <Link href="/merge" className="text-[14px] transition-colors hover:text-ink">Merge PDF</Link>
            <Link href="/split" className="text-[14px] transition-colors hover:text-ink">Split PDF</Link>
            <Link href="/compress" className="text-[14px] transition-colors hover:text-ink">Compress PDF</Link>
            <Link href="/convert" className="text-[14px] transition-colors hover:text-ink">Convert PDF</Link>
          </div>
          <div className="flex flex-col gap-3">
            <h3 className="font-[600] text-ink text-[14px]">Company</h3>
            <Link href="/about" className="text-[14px] transition-colors hover:text-ink">About Us</Link>
            <Link href="/pricing" className="text-[14px] transition-colors hover:text-ink">Pricing</Link>
            <Link href="/github" className="text-[14px] transition-colors hover:text-ink">GitHub Repository</Link>
          </div>
          <div className="flex flex-col gap-3">
            <h3 className="font-[600] text-ink text-[14px]">Legal</h3>
            <Link href="/privacy" className="text-[14px] transition-colors hover:text-ink">Privacy Policy</Link>
            <Link href="/terms" className="text-[14px] transition-colors hover:text-ink">Terms of Service</Link>
          </div>
        </div>
        <div className="mt-12 border-t border-hairline pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-[12px] text-ink-muted-48">
            © {new Date().getFullYear()} MergeMaster. Built with open source.
          </p>
        </div>
      </div>
    </footer>
  );
}
