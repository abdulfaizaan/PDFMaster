import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { FileQuestion } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 min-h-[calc(100vh-64px)] bg-canvas">
      <div className="text-center space-y-8 max-w-md animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="flex justify-center">
          <div className="bg-primary/10 p-6 rounded-full">
            <FileQuestion className="h-16 w-16 text-primary" />
          </div>
        </div>
        
        <div className="space-y-4">
          <h1 className="text-8xl font-display font-medium tracking-tighter text-ink">
            404
          </h1>
          <h2 className="text-3xl font-display font-normal text-ink tracking-tight">
            Page not found
          </h2>
          <p className="text-lg text-muted-foreground">
            Sorry, we couldn’t find the page you’re looking for. It might have been moved or deleted.
          </p>
        </div>

        <div className="pt-4 flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            href="/" 
            className={cn(buttonVariants({ size: "lg" }), "px-8 rounded-full shadow-sm")}
          >
            Go back home
          </Link>
          <Link 
            href="/merge" 
            className={cn(buttonVariants({ size: "lg", variant: "outline" }), "px-8 rounded-full bg-surface-card")}
          >
            Merge PDFs
          </Link>
        </div>
      </div>
    </div>
  );
}
