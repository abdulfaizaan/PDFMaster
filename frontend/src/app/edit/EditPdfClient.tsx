"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import {
  FileUp,
  X,
  Loader2,
  Download,
  Type,
  ChevronLeft,
  ChevronRight,
  MousePointer2,
  Eraser,
  Image as ImageIcon,
  Trash2,
} from "lucide-react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { motion } from "framer-motion";
import { PDFDocument, rgb } from "pdf-lib";

// Polyfill Promise.withResolvers for older browsers
if (typeof Promise.withResolvers === "undefined") {
  if (typeof window !== "undefined") {
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

type ToolType = "pointer" | "text" | "whiteout" | "image";

type AnnotationBase = {
  id: string;
  pageNumber: number;
  x: number; // percentage (0 to 1)
  y: number; // percentage (0 to 1)
};

type TextAnnotation = AnnotationBase & {
  type: "text";
  text: string;
  fontSize: number;
  color: string;
  fontFamily?: string;
};

type WhiteoutAnnotation = AnnotationBase & {
  type: "whiteout";
  width: number; // percentage (0 to 1)
  height: number; // percentage (0 to 1)
};

type ImageAnnotation = AnnotationBase & {
  type: "image";
  width: number; // percentage
  height: number; // percentage
  imageUrl: string;
  fileType: "png" | "jpeg";
  imageBytes: ArrayBuffer;
};

type Annotation = TextAnnotation | WhiteoutAnnotation | ImageAnnotation;

export default function EditPdfClient() {
  const [file, setFile] = useState<File | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [exportedUrl, setExportedUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // PDF Viewer State
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const pageRef = useRef<HTMLDivElement>(null);

  // Tools & Annotations State
  const [activeTool, setActiveTool] = useState<ToolType>("pointer");
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [selectedAnnId, setSelectedAnnId] = useState<string | null>(null);

  // Text styling defaults
  const [currentColor, setCurrentColor] = useState<string>("#000000");
  const [currentFontSize, setCurrentFontSize] = useState<number>(16);

  // Hidden file input for images
  const imageInputRef = useRef<HTMLInputElement>(null);
  // Store click position for image placement
  const pendingImagePos = useRef<{ x: number; y: number } | null>(null);

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

  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (activeTool === "pointer") {
      // Deselect if clicking on canvas
      if (e.target === pageRef.current || (e.target as Element).classList.contains("react-pdf__Page__canvas")) {
        setSelectedAnnId(null);
      }
      return;
    }

    if (!pageRef.current) return;
    const rect = pageRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));

    if (activeTool === "text") {
      const newAnn: TextAnnotation = {
        id: Math.random().toString(36).substr(2, 9),
        type: "text",
        pageNumber,
        x,
        y,
        text: "", // Empty so they can start typing
        fontSize: currentFontSize,
        color: currentColor,
      };
      setAnnotations((prev) => [...prev, newAnn]);
      setSelectedAnnId(newAnn.id);
      setActiveTool("pointer"); // switch back to pointer to allow typing and moving
    } else if (activeTool === "whiteout") {
      const newAnn: WhiteoutAnnotation = {
        id: Math.random().toString(36).substr(2, 9),
        type: "whiteout",
        pageNumber,
        x,
        y,
        width: 0.15, // Default 15% width
        height: 0.05, // Default 5% height
      };
      setAnnotations((prev) => [...prev, newAnn]);
      setSelectedAnnId(newAnn.id);
      setActiveTool("pointer");
    } else if (activeTool === "image") {
      pendingImagePos.current = { x, y };
      imageInputRef.current?.click();
      setActiveTool("pointer");
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !pendingImagePos.current) return;

    const fileType = file.type === "image/png" ? "png" : file.type === "image/jpeg" ? "jpeg" : null;
    if (!fileType) {
      setError("Only PNG and JPEG images are supported.");
      return;
    }

    try {
      const arrayBuffer = await file.arrayBuffer();
      const imageUrl = URL.createObjectURL(file);
      
      const newAnn: ImageAnnotation = {
        id: Math.random().toString(36).substr(2, 9),
        type: "image",
        pageNumber,
        x: pendingImagePos.current.x,
        y: pendingImagePos.current.y,
        width: 0.2, // default 20% width
        height: 0.2,
        imageUrl,
        fileType,
        imageBytes: arrayBuffer,
      };
      setAnnotations((prev) => [...prev, newAnn]);
      setSelectedAnnId(newAnn.id);
    } catch (err) {
      setError("Failed to load image.");
    } finally {
      pendingImagePos.current = null;
      if (imageInputRef.current) imageInputRef.current.value = "";
    }
  };

  const updateAnnotation = (id: string, updates: Partial<Annotation>) => {
    setAnnotations((prev) =>
      prev.map((ann) => (ann.id === id ? { ...ann, ...updates } : ann) as Annotation)
    );
  };

  const removeAnnotation = (id: string) => {
    setAnnotations((prev) => prev.filter((ann) => ann.id !== id));
    if (selectedAnnId === id) setSelectedAnnId(null);
  };

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
    setSelectedAnnId(null); // deselect all so UI looks clean

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
      const pages = pdfDoc.getPages();

      for (let i = 0; i < pages.length; i++) {
        const targetPage = pages[i];
        const pageAnns = annotations.filter((a) => a.pageNumber === i + 1);

        if (pageAnns.length > 0) {
          const { width: pdfWidth, height: pdfHeight } = targetPage.getSize();

          for (const ann of pageAnns) {
            const x = ann.x * pdfWidth;
            
            if (ann.type === "text") {
              const { r, g, b } = hexToRgbRatio(ann.color);
              // Invert Y for pdf-lib text (bottom-left origin) and subtract font size for visual match
              const y = (1 - ann.y) * pdfHeight - ann.fontSize;
              targetPage.drawText(ann.text, {
                x,
                y,
                size: ann.fontSize,
                color: rgb(r, g, b),
              });
            } else if (ann.type === "whiteout") {
              const width = ann.width * pdfWidth;
              const height = ann.height * pdfHeight;
              const y = (1 - ann.y) * pdfHeight - height; // Invert Y
              targetPage.drawRectangle({
                x,
                y,
                width,
                height,
                color: rgb(1, 1, 1), // White
              });
            } else if (ann.type === "image") {
              const width = ann.width * pdfWidth;
              const height = ann.height * pdfHeight;
              const y = (1 - ann.y) * pdfHeight - height; // Invert Y
              
              let embeddedImage;
              if (ann.fileType === "png") {
                embeddedImage = await pdfDoc.embedPng(ann.imageBytes);
              } else {
                embeddedImage = await pdfDoc.embedJpg(ann.imageBytes);
              }
              
              targetPage.drawImage(embeddedImage, {
                x,
                y,
                width,
                height,
              });
            }
          }
        }
      }

      const exportedPdfBytes = await pdfDoc.save();
      const blob = new Blob([exportedPdfBytes as any], { type: "application/pdf" });
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

  const currentPageAnnotations = annotations.filter((a) => a.pageNumber === pageNumber);

  return (
    <div className="flex flex-col min-h-[calc(100vh-64px)] bg-[#f3f4f6]">
      <input
        type="file"
        accept="image/png, image/jpeg"
        className="hidden"
        ref={imageInputRef}
        onChange={handleImageUpload}
      />

      {!file ? (
        <div className="flex-1 container mx-auto max-w-4xl px-4 py-24 flex flex-col items-center">
          <div className="text-center mb-10">
            <h1 className="text-[40px] font-[600] tracking-tight mb-4 text-ink text-balance">
              Edit PDF Document
            </h1>
            <p className="text-[21px] text-ink-muted-80 mb-4 max-w-2xl text-balance">
              Add text, images, and erase content entirely in your browser.
            </p>
          </div>

          <Card
            {...getRootProps()}
            className={`w-full max-w-2xl border-2 border-dashed p-16 text-center cursor-pointer transition-all duration-300 rounded-2xl ${
              isDragActive
                ? "border-primary bg-primary/5 shadow-xl scale-[1.02]"
                : "border-hairline hover:border-primary/50 hover:bg-white shadow-sm"
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
        <div className="flex flex-col flex-1 overflow-hidden h-[calc(100vh-64px)]">
          {/* Top Toolbar (Sejda Style) */}
          <div className="w-full bg-white border-b border-hairline shadow-sm z-20 px-4 py-2 flex items-center justify-between">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
              <Button
                variant={activeTool === "pointer" ? "default" : "ghost"}
                size="sm"
                onClick={() => setActiveTool("pointer")}
                className={cn("gap-1.5", activeTool === "pointer" && "bg-primary/10 text-primary hover:bg-primary/20")}
              >
                <MousePointer2 className="h-4 w-4" />
                <span className="hidden sm:inline">Select</span>
              </Button>
              <div className="w-px h-6 bg-border mx-1" />
              <Button
                variant={activeTool === "text" ? "default" : "ghost"}
                size="sm"
                onClick={() => setActiveTool("text")}
                className={cn("gap-1.5", activeTool === "text" && "bg-primary/10 text-primary hover:bg-primary/20")}
                title="Add Text"
              >
                <Type className="h-4 w-4" />
                <span className="hidden sm:inline">Text</span>
              </Button>
              <Button
                variant={activeTool === "whiteout" ? "default" : "ghost"}
                size="sm"
                onClick={() => setActiveTool("whiteout")}
                className={cn("gap-1.5", activeTool === "whiteout" && "bg-primary/10 text-primary hover:bg-primary/20")}
                title="Whiteout (Erase)"
              >
                <Eraser className="h-4 w-4" />
                <span className="hidden sm:inline">Whiteout</span>
              </Button>
              <Button
                variant={activeTool === "image" ? "default" : "ghost"}
                size="sm"
                onClick={() => setActiveTool("image")}
                className={cn("gap-1.5", activeTool === "image" && "bg-primary/10 text-primary hover:bg-primary/20")}
                title="Add Image"
              >
                <ImageIcon className="h-4 w-4" />
                <span className="hidden sm:inline">Image</span>
              </Button>
            </div>

            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => { setFile(null); setAnnotations([]); }} className="text-muted-foreground hover:text-destructive shrink-0">
                <X className="h-5 w-5" />
              </Button>
              <Button
                onClick={handleExport}
                disabled={isExporting}
                className="gap-2 rounded-full px-6 shadow-sm shrink-0"
              >
                {isExporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                Apply changes
              </Button>
            </div>
          </div>

          {/* Context Toolbar for Selected Annotation */}
          {selectedAnnId && annotations.find((a) => a.id === selectedAnnId)?.type === "text" && (
            <div className="w-full bg-white border-b border-hairline px-4 py-2 flex items-center justify-center gap-4 animate-in slide-in-from-top-2 duration-200 z-10 shadow-sm">
              <span className="text-sm text-muted-foreground font-medium">Text Style:</span>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={(annotations.find((a) => a.id === selectedAnnId) as TextAnnotation).fontSize}
                  onChange={(e) => updateAnnotation(selectedAnnId, { fontSize: Number(e.target.value) })}
                  className="w-16 px-2 py-1 border border-hairline rounded bg-gray-50 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                  title="Font Size"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={(annotations.find((a) => a.id === selectedAnnId) as TextAnnotation).color}
                  onChange={(e) => updateAnnotation(selectedAnnId, { color: e.target.value })}
                  className="w-8 h-8 p-0 border-0 rounded cursor-pointer shrink-0"
                  title="Text Color"
                />
              </div>
              <div className="w-px h-6 bg-border mx-2" />
              <Button variant="ghost" size="sm" onClick={() => removeAnnotation(selectedAnnId)} className="text-destructive hover:bg-destructive/10 hover:text-destructive">
                <Trash2 className="h-4 w-4 mr-1" /> Delete
              </Button>
            </div>
          )}

          {/* PDF Viewer Workspace */}
          <div className="flex-1 overflow-auto flex flex-col relative" style={{ cursor: activeTool !== "pointer" ? "crosshair" : "default" }}>
            {error && (
              <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 p-3 bg-red-500 text-white rounded-lg shadow-lg text-sm flex items-center gap-2">
                {error}
                <X className="h-4 w-4 cursor-pointer" onClick={() => setError(null)} />
              </div>
            )}
            
            <div className="sticky top-0 z-10 flex items-center justify-center p-2 bg-transparent pointer-events-none">
              <div className="bg-white/90 backdrop-blur border shadow-sm rounded-full px-4 py-1.5 flex items-center gap-3 pointer-events-auto">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 rounded-full"
                  onClick={() => setPageNumber(p => Math.max(1, p - 1))}
                  disabled={pageNumber <= 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-xs font-medium text-muted-foreground w-20 text-center">
                  Page {pageNumber} / {numPages || '-'}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 rounded-full"
                  onClick={() => setPageNumber(p => Math.min(numPages || 1, p + 1))}
                  disabled={pageNumber >= numPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="flex-1 p-8 flex justify-center items-start min-h-max" onClick={handleCanvasClick}>
              <div 
                className="relative bg-white shadow-xl select-none transition-shadow duration-300 ring-1 ring-black/5" 
                ref={pageRef}
              >
                <Document
                  file={file}
                  onLoadSuccess={onDocumentLoadSuccess}
                  loading={<div className="h-[800px] w-[600px] flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}
                >
                  <Page 
                    pageNumber={pageNumber} 
                    renderTextLayer={false}
                    renderAnnotationLayer={false}
                    className="max-w-full"
                  />
                </Document>

                {/* Annotation Overlays */}
                {currentPageAnnotations.map((ann) => {
                  const isSelected = selectedAnnId === ann.id;
                  
                  return (
                  <motion.div
                    key={ann.id}
                    drag={activeTool === "pointer"}
                    dragMomentum={false}
                    dragConstraints={pageRef}
                    onClick={(e) => {
                      if (activeTool === "pointer") {
                        e.stopPropagation();
                        setSelectedAnnId(ann.id);
                      }
                    }}
                    onDragEnd={(e, info) => {
                      if (!pageRef.current || activeTool !== "pointer") return;
                      const rect = pageRef.current.getBoundingClientRect();
                      const newX = (info.point.x - rect.left) / rect.width;
                      const newY = (info.point.y - rect.top) / rect.height;
                      updateAnnotation(ann.id, { 
                        x: Math.max(0, Math.min(1, newX)), 
                        y: Math.max(0, Math.min(1, newY))
                      });
                    }}
                    className={cn(
                      "absolute z-10 group/ann",
                      activeTool === "pointer" && "cursor-move",
                      isSelected && "ring-2 ring-primary/50"
                    )}
                    style={{
                      left: `${ann.x * 100}%`,
                      top: `${ann.y * 100}%`,
                      transform: 'translate(0, 0)',
                    }}
                  >
                    {ann.type === "text" && (
                      <textarea
                        autoFocus={isSelected}
                        value={ann.text}
                        placeholder="Type here"
                        onChange={(e) => updateAnnotation(ann.id, { text: e.target.value })}
                        className="bg-transparent border-none outline-none resize-none overflow-hidden m-0 p-1 font-sans placeholder:text-gray-400/50"
                        style={{
                          fontSize: `${ann.fontSize}px`,
                          color: ann.color,
                          width: `${Math.max(100, ann.text.length * ann.fontSize * 0.6 + 20)}px`,
                          height: `${ann.fontSize * 1.5 + 10}px`,
                          lineHeight: '1.2'
                        }}
                        onMouseDown={(e) => activeTool === "pointer" && e.stopPropagation()}
                      />
                    )}

                    {ann.type === "whiteout" && (
                      <div
                        className="bg-white"
                        style={{
                          width: `${ann.width * (pageRef.current?.offsetWidth || 800)}px`,
                          height: `${ann.height * (pageRef.current?.offsetHeight || 1100)}px`,
                          resize: activeTool === "pointer" ? "both" : "none",
                          overflow: "hidden",
                          boxShadow: isSelected ? "inset 0 0 0 1px #cbd5e1" : "none" // Subtle border when selected to see it
                        }}
                        onMouseUp={(e) => {
                          // Handle native CSS resize
                          if (activeTool === "pointer" && pageRef.current) {
                            const el = e.currentTarget;
                            const newPctWidth = el.offsetWidth / pageRef.current.offsetWidth;
                            const newPctHeight = el.offsetHeight / pageRef.current.offsetHeight;
                            updateAnnotation(ann.id, { width: newPctWidth, height: newPctHeight });
                          }
                        }}
                      />
                    )}

                    {ann.type === "image" && (
                      <div
                        style={{
                          width: `${ann.width * (pageRef.current?.offsetWidth || 800)}px`,
                          height: `${ann.height * (pageRef.current?.offsetHeight || 1100)}px`,
                          resize: activeTool === "pointer" ? "both" : "none",
                          overflow: "hidden",
                        }}
                        onMouseUp={(e) => {
                          if (activeTool === "pointer" && pageRef.current) {
                            const el = e.currentTarget;
                            const newPctWidth = el.offsetWidth / pageRef.current.offsetWidth;
                            const newPctHeight = el.offsetHeight / pageRef.current.offsetHeight;
                            updateAnnotation(ann.id, { width: newPctWidth, height: newPctHeight });
                          }
                        }}
                      >
                        <img src={ann.imageUrl} className="w-full h-full object-fill pointer-events-none" alt="PDF overlay" />
                      </div>
                    )}

                    {/* Delete button (shows on hover if pointer tool active) */}
                    {activeTool === "pointer" && (
                      <div 
                        className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full p-1 cursor-pointer opacity-0 group-hover/ann:opacity-100 transition-opacity shadow-sm" 
                        onClick={(e) => {
                          e.stopPropagation();
                          removeAnnotation(ann.id);
                        }}
                      >
                        <X className="h-3 w-3" />
                      </div>
                    )}
                  </motion.div>
                )})}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 container mx-auto flex items-center justify-center p-4">
          <Card className="max-w-md w-full p-10 text-center shadow-2xl bg-white border-hairline animate-in zoom-in-95 duration-500">
            <div className="flex flex-col items-center justify-center space-y-6">
              <div className="bg-green-500/10 p-5 rounded-full">
                <Download className="h-12 w-12 text-green-500" />
              </div>
              <div>
                <h2 className="text-[28px] font-[600] text-ink mb-2">Task Complete!</h2>
                <p className="text-[17px] text-ink-muted-80">
                  Your updated document is ready.
                </p>
              </div>
              <div className="flex gap-4 w-full mt-4">
                <Button onClick={() => {
                  setExportedUrl(null);
                  setFile(null);
                  setAnnotations([]);
                }} variant="outline" className="flex-1 rounded-full">
                  Edit Another
                </Button>
                <a href={exportedUrl} download={`edited-${file?.name}`} className={cn(buttonVariants({ variant: "default" }), "flex-1 rounded-full shadow-lg shadow-primary/20")}>
                  Download
                </a>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
