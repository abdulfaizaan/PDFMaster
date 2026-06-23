"use client";

import { useState, useCallback, useRef } from "react";
import { useDropzone } from "react-dropzone";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { FileUp, X, Loader2, Download, Type, ChevronLeft, ChevronRight, Settings } from "lucide-react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { motion } from "framer-motion";
import { PDFDocument, rgb } from "pdf-lib";

// Polyfill Promise.withResolvers for older browsers
if (typeof Promise.withResolvers === 'undefined') {
  if (typeof window !== 'undefined') {
    // @ts-expect-error polyfill
    window.Promise.withResolvers = function () {
      let resolve, reject;
      const promise = new Promise((res, rej) => {
        resolve = res;
        reject = rej;
      });
      return { promise, resolve, reject };
    };
  }
}

// Initialize pdfjs worker
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

type TextAnnotation = {
  id: string;
  pageNumber: number;
  text: string;
  x: number; // percentage (0 to 1)
  y: number; // percentage (0 to 1)
  fontSize: number;
  color: string;
};

export default function EditPdfClient() {
  const [file, setFile] = useState<File | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [exportedUrl, setExportedUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // PDF Viewer State
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const pageRef = useRef<HTMLDivElement>(null);

  // Annotations State
  const [annotations, setAnnotations] = useState<TextAnnotation[]>([]);

  // Toolbar state
  const [currentColor, setCurrentColor] = useState<string>("#000000");
  const [currentFontSize, setCurrentFontSize] = useState<number>(16);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setError(null);
    setExportedUrl(null);
    setAnnotations([]);
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    maxFiles: 1,
  });

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setPageNumber(1);
  };

  const handleAddText = () => {
    const newAnnotation: TextAnnotation = {
      id: Math.random().toString(36).substr(2, 9),
      pageNumber,
      text: "Double-click to edit",
      x: 0.5,
      y: 0.5,
      fontSize: currentFontSize,
      color: currentColor,
    };
    setAnnotations((prev) => [...prev, newAnnotation]);
  };

  const updateAnnotation = (id: string, updates: Partial<TextAnnotation>) => {
    setAnnotations((prev) =>
      prev.map((ann) => (ann.id === id ? { ...ann, ...updates } : ann))
    );
  };

  const removeAnnotation = (id: string) => {
    setAnnotations((prev) => prev.map((ann) => ann.id !== id ? ann : null).filter(Boolean) as TextAnnotation[]);
  };

  // Convert hex color to rgb ratios for pdf-lib
  const hexToRgbRatio = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16) / 255,
          g: parseInt(result[2], 16) / 255,
          b: parseInt(result[3], 16) / 255,
        }
      : { r: 0, g: 0, b: 0 };
  };

  const handleExport = async () => {
    if (!file) return;

    setIsExporting(true);
    setError(null);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
      const pages = pdfDoc.getPages();

      // For each page, draw its annotations
      for (let i = 0; i < pages.length; i++) {
        const targetPage = pages[i];
        const pageAnns = annotations.filter((a) => a.pageNumber === i + 1);

        if (pageAnns.length > 0) {
          const { width: pdfWidth, height: pdfHeight } = targetPage.getSize();

          pageAnns.forEach((ann) => {
            const { r, g, b } = hexToRgbRatio(ann.color);
            
            // pdf-lib origin is bottom-left, our drag coordinates origin is top-left
            // Invert the Y axis mapping
            const x = ann.x * pdfWidth;
            // Since we use textarea, the text originates from top-left, pdf-lib draws from bottom-left of the text baseline
            // Adjust y slightly so it visually matches what they saw.
            const y = (1 - ann.y) * pdfHeight - ann.fontSize;

            targetPage.drawText(ann.text, {
              x,
              y,
              size: ann.fontSize,
              color: rgb(r, g, b),
              // we don't handle multi-line perfectly without extra library support, 
              // but we can pass line heights if needed.
            });
          });
        }
      }

      const signedPdfBytes = await pdfDoc.save();
      const blob = new Blob([signedPdfBytes as any], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      setExportedUrl(url);

      const a = document.createElement("a");
      a.href = url;
      a.download = `edited-${file.name}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      const message = err instanceof Error ? err.message : "An unexpected error occurred.";
      setError(message);
    } finally {
      setIsExporting(false);
    }
  };

  // Filter annotations for the current page
  const currentPageAnnotations = annotations.filter(a => a.pageNumber === pageNumber);

  return (
    <div className="flex flex-col min-h-[calc(100vh-64px)] bg-canvas">
      {!file ? (
        <div className="flex-1 container mx-auto max-w-4xl px-4 py-24 flex flex-col items-center">
          <div className="text-center mb-10">
            <h1 className="text-[40px] font-[600] tracking-tight mb-4 text-ink text-balance">
              Edit PDF Document
            </h1>
            <p className="text-[21px] text-ink-muted-80 mb-4 max-w-2xl text-balance">
              Add text annotations, change fonts, and securely edit your PDF entirely in your browser.
            </p>
          </div>

          <Card
            {...getRootProps()}
            className={`w-full max-w-2xl border-2 border-dashed p-16 text-center cursor-pointer transition-all duration-300 rounded-2xl ${
              isDragActive
                ? "border-primary bg-primary/5 shadow-xl scale-[1.02]"
                : "border-hairline hover:border-primary/50 hover:bg-surface-soft"
            }`}
          >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="bg-primary/10 p-5 rounded-full">
                <FileUp className="h-10 w-10 text-primary" />
              </div>
              <div>
                <p className="text-[21px] font-[600] text-ink">
                  {isDragActive ? "Drop your PDF here" : "Drag & drop your PDF here"}
                </p>
                <p className="text-[17px] text-ink-muted-48 mt-1">
                  or click to select a file from your computer
                </p>
              </div>
            </div>
          </Card>
        </div>
      ) : !exportedUrl ? (
        <div className="flex flex-col lg:flex-row flex-1 overflow-hidden h-[calc(100vh-64px)]">
          {/* Controls Sidebar */}
          <div className="w-full lg:w-80 border-r border-hairline bg-surface-soft p-6 flex flex-col overflow-y-auto">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-[21px] font-[600] text-ink">PDF Editor</h2>
              <Button variant="ghost" size="icon" onClick={() => { setFile(null); setAnnotations([]); }}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="space-y-8 flex-1">
              {/* Tool: Add Text */}
              <div className="space-y-4">
                <h3 className="text-[14px] font-[600] text-ink uppercase tracking-wider">Tools</h3>
                <Button onClick={handleAddText} className="w-full gap-2 py-6 text-[17px]">
                  <Type className="h-5 w-5" />
                  Add Text Field
                </Button>
              </div>

              {/* Text Properties */}
              <div className="space-y-4">
                <h3 className="text-[14px] font-[600] text-ink uppercase tracking-wider">Text Style</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="text-[14px] text-ink-muted-80">Font Size</label>
                    <input 
                      type="number" 
                      value={currentFontSize} 
                      onChange={(e) => setCurrentFontSize(Number(e.target.value))}
                      className="w-20 px-2 py-1 border border-hairline rounded bg-canvas text-ink text-sm"
                    />
                  </div>
                  <div className="flex justify-between items-center">
                    <label className="text-[14px] text-ink-muted-80">Color</label>
                    <input 
                      type="color" 
                      value={currentColor} 
                      onChange={(e) => setCurrentColor(e.target.value)}
                      className="w-10 h-10 p-0 border-0 rounded cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-hairline mt-auto">
              {error && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-600 text-sm">
                  {error}
                </div>
              )}
              <Button
                onClick={handleExport}
                disabled={isExporting}
                className="w-full rounded-pill py-6 text-[17px]"
              >
                {isExporting ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Exporting...
                  </>
                ) : (
                  "Export PDF"
                )}
              </Button>
            </div>
          </div>

          {/* PDF Viewer */}
          <div className="flex-1 bg-canvas-parchment overflow-auto flex flex-col relative">
            <div className="sticky top-0 z-10 flex items-center justify-center p-3 bg-canvas/90 backdrop-blur border-b border-hairline gap-4 shadow-sm">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPageNumber(p => Math.max(1, p - 1))}
                disabled={pageNumber <= 1}
              >
                <ChevronLeft className="h-4 w-4 mr-1" /> Prev
              </Button>
              <span className="text-[14px] font-[600] text-ink">
                Page {pageNumber} of {numPages || '-'}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPageNumber(p => Math.min(numPages || 1, p + 1))}
                disabled={pageNumber >= numPages}
              >
                Next <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>

            <div className="flex-1 p-8 flex justify-center items-start min-h-max">
              <div 
                className="relative bg-white shadow-lg select-none" 
                ref={pageRef}
                style={{ 
                  boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
                }}
              >
                <Document
                  file={file}
                  onLoadSuccess={onDocumentLoadSuccess}
                  loading={<Loader2 className="h-8 w-8 animate-spin text-primary m-12" />}
                >
                  <Page 
                    pageNumber={pageNumber} 
                    renderTextLayer={false}
                    renderAnnotationLayer={false}
                    className="max-w-full"
                  />
                </Document>

                {/* Annotation Overlays */}
                {currentPageAnnotations.map((ann) => (
                  <motion.div
                    key={ann.id}
                    drag
                    dragMomentum={false}
                    dragConstraints={pageRef}
                    onDragEnd={(e, info) => {
                      if (!pageRef.current) return;
                      // Update percentage position
                      const rect = pageRef.current.getBoundingClientRect();
                      // Info point is absolute client coordinates. We need relative to page.
                      // Wait, Framer motion gives us `x` and `y` offsets from initial layout.
                      // We can just calculate the new percentage based on the drop event coordinates relative to the page.
                      const newX = (info.point.x - rect.left) / rect.width;
                      const newY = (info.point.y - rect.top) / rect.height;
                      
                      updateAnnotation(ann.id, { 
                        x: Math.max(0, Math.min(1, newX)), 
                        y: Math.max(0, Math.min(1, newY))
                      });
                    }}
                    className="absolute z-10 cursor-move border border-transparent hover:border-primary/50 group/ann"
                    style={{
                      left: `${ann.x * 100}%`,
                      top: `${ann.y * 100}%`,
                      transform: 'translate(0, 0)', // Reset framer motion default translation visually since we use left/top percentages
                    }}
                  >
                    {/* The textarea for editing text inline */}
                    <textarea
                      value={ann.text}
                      onChange={(e) => updateAnnotation(ann.id, { text: e.target.value })}
                      className="bg-transparent border-none outline-none resize-none overflow-hidden m-0 p-1 font-sans"
                      style={{
                        fontSize: `${ann.fontSize}px`,
                        color: ann.color,
                        width: `${Math.max(150, ann.text.length * ann.fontSize * 0.6)}px`, // Auto expanding rough estimate
                        height: `${ann.fontSize * 1.5 + 10}px`,
                      }}
                      onMouseDown={(e) => e.stopPropagation()} // Allow clicking inside to type without dragging
                    />
                    
                    {/* Delete button (shows on hover) */}
                    <div 
                      className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full p-1 cursor-pointer opacity-0 group-hover/ann:opacity-100 transition-opacity" 
                      onClick={() => removeAnnotation(ann.id)}
                    >
                      <X className="h-3 w-3" />
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 container mx-auto flex items-center justify-center p-4">
          <Card className="max-w-md w-full p-10 text-center shadow-2xl bg-canvas border-hairline animate-in zoom-in-95 duration-500">
            <div className="flex flex-col items-center justify-center space-y-6">
              <div className="bg-green-500/10 p-5 rounded-full">
                <Download className="h-12 w-12 text-green-500" />
              </div>
              <div>
                <h2 className="text-[28px] font-[600] text-ink mb-2">Export Complete!</h2>
                <p className="text-[17px] text-ink-muted-80">
                  Your edited PDF should have downloaded automatically.
                </p>
              </div>
              <div className="flex gap-4 w-full">
                <Button onClick={() => {
                  setExportedUrl(null);
                  setFile(null);
                  setAnnotations([]);
                }} variant="outline" className="flex-1">
                  Edit Another
                </Button>
                <a href={exportedUrl} download={`edited-${file?.name}`} className={cn(buttonVariants({ variant: "default" }), "flex-1")}>
                  Download Again
                </a>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
