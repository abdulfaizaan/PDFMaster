"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileUp, File, X, Loader2, Download, Scissors } from "lucide-react";

export default function SplitPdfPage() {
  const [file, setFile] = useState<File | null>(null);
  const [rangeStr, setRangeStr] = useState("");
  const [isSplitting, setIsSplitting] = useState(false);
  const [splitUrl, setSplitUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setError(null);
    setSplitUrl(null);
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    maxFiles: 1,
  });

  const removeFile = () => {
    setFile(null);
    setRangeStr("");
  };

  const handleSplit = async () => {
    if (!file) {
      setError("Please select a PDF to split.");
      return;
    }
    if (!rangeStr.trim()) {
      setError("Please enter a page range (e.g., 1-5, 8, 11-13).");
      return;
    }

    setIsSplitting(true);
    setError(null);

    const formData = new FormData();
    formData.append("pdf", file);
    formData.append("range", rangeStr);

    try {
      const response = await fetch("http://localhost:3333/api/v1/split", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const err = await response.json().catch(() => null);
        throw new Error(err?.error || "Failed to split PDF. Check your page range.");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setSplitUrl(url);

      // Auto-download
      const a = document.createElement("a");
      a.href = url;
      a.download = "split-pdfmaster.pdf";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setIsSplitting(false);
    }
  };

  return (
    <div className="flex-1 container mx-auto max-w-4xl px-4 py-12">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-extrabold tracking-tight mb-4 text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-rose-500">
          Split PDF Pages
        </h1>
        <p className="text-lg text-muted-foreground">
          Extract specific pages or a range of pages from your PDF file.
        </p>
      </div>

      {!splitUrl ? (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {!file ? (
            <Card
              {...getRootProps()}
              className={`border-2 border-dashed p-12 text-center cursor-pointer transition-all duration-300 ${
                isDragActive
                  ? "border-orange-500 bg-orange-500/10 shadow-lg shadow-orange-500/20 scale-[1.02]"
                  : "border-border hover:border-orange-500/50 hover:bg-card/50"
              }`}
            >
              <input {...getInputProps()} />
              <div className="flex flex-col items-center justify-center space-y-4">
                <div className="bg-orange-500/20 p-4 rounded-full">
                  <FileUp className="h-10 w-10 text-orange-500" />
                </div>
                <div>
                  <p className="text-xl font-medium">
                    {isDragActive ? "Drop your PDF here" : "Drag & drop a PDF here"}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    or click to select a file from your computer
                  </p>
                </div>
              </div>
            </Card>
          ) : (
            <div className="space-y-6">
              <div className="relative group bg-card border border-orange-500/30 p-6 rounded-xl flex items-center gap-4 animate-in fade-in zoom-in-95 duration-200 shadow-md">
                <File className="h-12 w-12 text-orange-500 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-lg font-medium truncate">{file.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <button
                  onClick={removeFile}
                  className="bg-destructive text-destructive-foreground rounded-full p-2 transition-transform hover:scale-110 shadow-sm"
                  aria-label="Remove file"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <Card className="p-6 bg-surface-card border-none shadow-none">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="range" className="text-base font-semibold">
                      Pages to extract
                    </Label>
                    <Input
                      id="range"
                      placeholder="e.g. 1-5, 8, 11-13"
                      value={rangeStr}
                      onChange={(e) => setRangeStr(e.target.value)}
                      className="text-lg h-12 focus-visible:ring-orange-500"
                    />
                    <p className="text-xs text-muted-foreground">
                      Enter page numbers or page ranges separated by commas.
                    </p>
                  </div>
                </div>
              </Card>

              {error && (
                <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm text-center font-medium">
                  {error}
                </div>
              )}

              <div className="flex justify-center pt-4">
                <Button
                  size="lg"
                  onClick={handleSplit}
                  disabled={isSplitting || !rangeStr.trim()}
                  className="rounded-full px-8 h-12 shadow-lg shadow-orange-500/25 bg-orange-500 hover:bg-orange-600 text-white text-base"
                >
                  {isSplitting ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Splitting PDF...
                    </>
                  ) : (
                    <>
                      <Scissors className="mr-2 h-5 w-5" />
                      Split PDF Now
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <Card className="p-12 text-center animate-in zoom-in-95 duration-500 bg-card/50 border-orange-500/20 shadow-xl shadow-orange-500/10">
          <div className="flex flex-col items-center justify-center space-y-6">
            <div className="bg-green-500/20 p-4 rounded-full">
              <Download className="h-12 w-12 text-green-500" />
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-2">PDF Split Successfully!</h2>
              <p className="text-muted-foreground">
                Your extracted pages have been downloaded automatically.
              </p>
            </div>
            <div className="flex gap-4">
              <Button onClick={removeFile} variant="outline" className="rounded-full px-6 border-orange-500/20 hover:bg-orange-500/10">
                Split Another File
              </Button>
              <a href={splitUrl} download="split-pdfmaster.pdf" className={cn(buttonVariants({ variant: "default" }), "rounded-full px-6 shadow-lg shadow-orange-500/20 bg-orange-500 hover:bg-orange-600")}>
                Download Again
              </a>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
