"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { FileUp, File, X, Loader2, Download, Minimize2, ShieldCheck } from "lucide-react";

export default function CompressPdfPage() {
  const [file, setFile] = useState<File | null>(null);
  const [level, setLevel] = useState("recommended");
  const [isCompressing, setIsCompressing] = useState(false);
  const [compressedUrl, setCompressedUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setError(null);
    setCompressedUrl(null);
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
    setLevel("recommended");
    setCompressedUrl(null);
  };

  const handleCompress = async () => {
    if (!file) {
      setError("Please select a PDF to compress.");
      return;
    }

    setIsCompressing(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("level", level);

      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";
      const response = await fetch(`${backendUrl}/api/compress`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Compression failed on the server. Make sure the backend is running.");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setCompressedUrl(url);

      // Auto-download
      const a = document.createElement("a");
      a.href = url;
      a.download = `compressed-${file.name}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err: any) {
      setError(err.message || "An error occurred while compressing the PDF.");
    } finally {
      setIsCompressing(false);
    }
  };

  return (
    <div className="flex-1 container mx-auto max-w-4xl px-4 py-12">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-extrabold tracking-tight mb-4 text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-500">
          Compress PDF
        </h1>
        <p className="text-lg text-muted-foreground mb-4">
          Perform a lightweight optimization on your PDF file.
        </p>
        <div className="flex items-center justify-center gap-2 text-sm font-medium text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 dark:text-emerald-400 py-1.5 px-4 rounded-full max-w-fit mx-auto border border-emerald-200 dark:border-emerald-500/20">
          <ShieldCheck className="h-4 w-4" />
          <span>100% Private - Processed entirely on your device</span>
        </div>
      </div>

      {!compressedUrl ? (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {!file ? (
            <Card
              {...getRootProps()}
              className={`border-2 border-dashed p-12 text-center cursor-pointer transition-all duration-300 ${
                isDragActive
                  ? "border-teal-500 bg-teal-500/10 shadow-lg shadow-teal-500/20 scale-[1.02]"
                  : "border-border hover:border-teal-500/50 hover:bg-card/50"
              }`}
            >
              <input {...getInputProps()} />
              <div className="flex flex-col items-center justify-center space-y-4">
                <div className="bg-teal-500/20 p-4 rounded-full">
                  <FileUp className="h-10 w-10 text-teal-500" />
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
              <div className="relative group bg-card border border-teal-500/30 p-6 rounded-xl flex items-center gap-4 animate-in fade-in zoom-in-95 duration-200 shadow-md">
                <File className="h-12 w-12 text-teal-500 shrink-0" />
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

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-center mb-4">Choose Compression Level</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    {
                      id: "extreme",
                      label: "Extreme Compression",
                      desc: "Less quality, high compression",
                      activeColor: "border-red-500 bg-red-500/10",
                    },
                    {
                      id: "recommended",
                      label: "Recommended Compression",
                      desc: "Good quality, good compression",
                      activeColor: "border-teal-500 bg-teal-500/10",
                    },
                    {
                      id: "less",
                      label: "Less Compression",
                      desc: "High quality, less compression",
                      activeColor: "border-blue-500 bg-blue-500/10",
                    },
                  ].map((option) => (
                    <div
                      key={option.id}
                      onClick={() => setLevel(option.id)}
                      className={`cursor-pointer border-2 rounded-xl p-4 transition-all duration-200 text-center flex flex-col justify-center items-center ${
                        level === option.id
                          ? option.activeColor
                          : "border-border hover:border-border/80 bg-card/40"
                      }`}
                    >
                      <p className="font-semibold">{option.label}</p>
                      <p className="text-xs text-muted-foreground mt-1">{option.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {error && (
                <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm text-center font-medium">
                  {error}
                </div>
              )}

              <div className="flex justify-center pt-4">
                <Button
                  size="lg"
                  onClick={handleCompress}
                  disabled={isCompressing}
                  className="rounded-full px-8 h-12 shadow-lg shadow-teal-500/25 bg-teal-500 hover:bg-teal-600 text-white text-base"
                >
                  {isCompressing ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Compressing PDF...
                    </>
                  ) : (
                    <>
                      <Minimize2 className="mr-2 h-5 w-5" />
                      Compress PDF Now
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <Card className="p-12 text-center animate-in zoom-in-95 duration-500 bg-card/50 border-teal-500/20 shadow-xl shadow-teal-500/10">
          <div className="flex flex-col items-center justify-center space-y-6">
            <div className="bg-green-500/20 p-4 rounded-full">
              <Download className="h-12 w-12 text-green-500" />
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-2">PDF Compressed Successfully!</h2>
              <p className="text-muted-foreground">
                Your compressed document has been downloaded automatically.
              </p>
            </div>
            <div className="flex gap-4">
              <Button onClick={removeFile} variant="outline" className="rounded-full px-6 border-teal-500/20 hover:bg-teal-500/10">
                Compress Another File
              </Button>
              <a href={compressedUrl} download="compressed-mergemaster.pdf" className={cn(buttonVariants({ variant: "default" }), "rounded-full px-6 shadow-lg shadow-teal-500/20 bg-teal-500 hover:bg-teal-600")}>
                Download Again
              </a>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
