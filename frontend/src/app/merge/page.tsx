"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { FileUp, File, X, Loader2, Download } from "lucide-react";

export default function MergePdfPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [isMerging, setIsMerging] = useState(false);
  const [mergedUrl, setMergedUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setError(null);
    setMergedUrl(null);
    setFiles((prev) => [...prev, ...acceptedFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
  });

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleMerge = async () => {
    if (files.length < 2) {
      setError("Please select at least 2 PDFs to merge.");
      return;
    }

    setIsMerging(true);
    setError(null);

    const formData = new FormData();
    files.forEach((file) => {
      formData.append("pdfs", file);
    });

    try {
      const response = await fetch("http://localhost:3333/api/v1/merge", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const err = await response.json().catch(() => null);
        throw new Error(err?.error || "Failed to merge PDFs");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setMergedUrl(url);

      // Auto-download
      const a = document.createElement("a");
      a.href = url;
      a.download = "merged-pdfmaster.pdf";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setIsMerging(false);
    }
  };

  return (
    <div className="flex-1 container mx-auto max-w-4xl px-4 py-12">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-extrabold tracking-tight mb-4 text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-500">
          Merge PDF Files
        </h1>
        <p className="text-lg text-muted-foreground">
          Combine multiple PDFs into a single document in seconds.
        </p>
      </div>

      {!mergedUrl ? (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <Card
            {...getRootProps()}
            className={`border-2 border-dashed p-12 text-center cursor-pointer transition-all duration-300 ${
              isDragActive
                ? "border-primary bg-primary/10 shadow-lg shadow-primary/20 scale-[1.02]"
                : "border-border hover:border-primary/50 hover:bg-card/50"
            }`}
          >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="bg-primary/20 p-4 rounded-full">
                <FileUp className="h-10 w-10 text-primary" />
              </div>
              <div>
                <p className="text-xl font-medium">
                  {isDragActive ? "Drop your PDFs here" : "Drag & drop PDFs here"}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  or click to select files from your computer
                </p>
              </div>
            </div>
          </Card>

          {error && (
            <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm text-center">
              {error}
            </div>
          )}

          {files.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-lg flex items-center justify-between">
                <span>Selected Files ({files.length})</span>
                <Button variant="ghost" size="sm" onClick={() => setFiles([])} className="text-muted-foreground h-8 text-xs">
                  Clear All
                </Button>
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {files.map((file, i) => (
                  <div
                    key={i}
                    className="relative group bg-card border border-border p-3 rounded-lg flex items-center gap-3 animate-in fade-in zoom-in-95 duration-200"
                  >
                    <File className="h-8 w-8 text-blue-500 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{file.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFile(i);
                      }}
                      className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex justify-center pt-6">
                <Button
                  size="lg"
                  onClick={handleMerge}
                  disabled={isMerging || files.length < 2}
                  className="rounded-full px-8 h-12 shadow-lg shadow-primary/25 text-base"
                >
                  {isMerging ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Merging PDFs...
                    </>
                  ) : (
                    "Merge PDFs Now"
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <Card className="p-12 text-center animate-in zoom-in-95 duration-500 bg-card/50 border-primary/20 shadow-xl shadow-primary/10">
          <div className="flex flex-col items-center justify-center space-y-6">
            <div className="bg-green-500/20 p-4 rounded-full">
              <Download className="h-12 w-12 text-green-500" />
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-2">PDFs Merged Successfully!</h2>
              <p className="text-muted-foreground">
                Your combined PDF should have downloaded automatically.
              </p>
            </div>
            <div className="flex gap-4">
              <Button onClick={() => setMergedUrl(null)} variant="outline" className="rounded-full px-6">
                Merge More Files
              </Button>
              <a href={mergedUrl} download="merged-pdfmaster.pdf" className={cn(buttonVariants({ variant: "default" }), "rounded-full px-6 shadow-lg shadow-primary/20")}>
                Download Again
              </a>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
