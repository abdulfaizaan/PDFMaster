"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { FileUp, File, X, Loader2, Download, Layers, RotateCw, Trash2, GripVertical, ShieldCheck } from "lucide-react";

import { Document, Page, pdfjs } from "react-pdf";
import { PDFDocument, degrees } from "pdf-lib";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// Setup pdf.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

type PageData = {
  id: string;
  originalIndex: number;
  rotation: number;
};

// Sortable Thumbnail Component
function SortablePage({
  page,
  onRotate,
  onDelete,
}: {
  page: PageData;
  onRotate: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: page.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "relative group flex flex-col items-center bg-card border rounded-xl p-3 transition-all",
        isDragging ? "shadow-2xl border-indigo-500 scale-105 opacity-80" : "shadow-sm border-border hover:border-indigo-500/50 hover:shadow-md"
      )}
    >
      <div
        className="cursor-grab active:cursor-grabbing w-full flex justify-center pb-2 mb-2 border-b border-border/50 text-muted-foreground hover:text-foreground"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-5 w-5" />
      </div>

      <div
        style={{ transform: `rotate(${page.rotation}deg)`, transition: "transform 0.3s ease" }}
        className="flex justify-center items-center overflow-hidden rounded bg-white w-[150px] h-[200px] border border-gray-100 shadow-inner pointer-events-none"
      >
        <Page
          pageNumber={page.originalIndex + 1}
          width={150}
          renderTextLayer={false}
          renderAnnotationLayer={false}
          loading={
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
            </div>
          }
        />
      </div>

      {/* Overlays */}
      <div className="absolute top-12 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRotate(page.id);
          }}
          className="bg-white/90 p-1.5 rounded-full text-indigo-500 hover:bg-indigo-100 shadow-sm border border-indigo-100 transition-colors"
          title="Rotate"
        >
          <RotateCw className="h-4 w-4" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(page.id);
          }}
          className="bg-white/90 p-1.5 rounded-full text-destructive hover:bg-destructive/10 shadow-sm border border-destructive/20 transition-colors"
          title="Delete"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-surface-dark text-on-dark-soft text-xs px-2.5 py-1 rounded-full font-medium shadow-sm">
        {page.originalIndex + 1}
      </div>
    </div>
  );
}

export default function OrganizePdfPage() {
  const [file, setFile] = useState<File | null>(null);
  const [pages, setPages] = useState<PageData[]>([]);
  const [isOrganizing, setIsOrganizing] = useState(false);
  const [organizedUrl, setOrganizedUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setError(null);
    setOrganizedUrl(null);
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
    setPages([]);
  };

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    const initialPages = Array.from(new Array(numPages), (_, index) => ({
      id: `page-${index}`,
      originalIndex: index,
      rotation: 0,
    }));
    setPages(initialPages);
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setPages((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleRotate = (id: string) => {
    setPages((current) =>
      current.map((p) => (p.id === id ? { ...p, rotation: (p.rotation + 90) % 360 } : p))
    );
  };

  const handleDelete = (id: string) => {
    setPages((current) => current.filter((p) => p.id !== id));
  };

  const handleOrganize = async () => {
    if (!file) {
      setError("Please select a PDF to organize.");
      return;
    }

    if (pages.length === 0) {
      setError("You cannot generate an empty PDF. Please keep at least one page.");
      return;
    }

    setIsOrganizing(true);
    setError(null);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
      const organizedPdf = await PDFDocument.create();

      // Copy pages in the new order
      const indicesToCopy = pages.map((p) => p.originalIndex);
      const copiedPages = await organizedPdf.copyPages(pdfDoc, indicesToCopy);

      copiedPages.forEach((page, index) => {
        const pageData = pages[index];
        if (pageData.rotation !== 0) {
          const currentRotation = page.getRotation().angle;
          page.setRotation(degrees(currentRotation + pageData.rotation));
        }
        organizedPdf.addPage(page);
      });

      const organizedPdfBytes = await organizedPdf.save();
      const blob = new Blob([organizedPdfBytes as any], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      setOrganizedUrl(url);

      // Auto-download
      const a = document.createElement("a");
      a.href = url;
      a.download = `organized-${file.name}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err: any) {
      setError(err.message || "An error occurred while organizing the PDF.");
    } finally {
      setIsOrganizing(false);
    }
  };

  return (
    <div className="flex-1 container mx-auto max-w-5xl px-4 py-12">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-extrabold tracking-tight mb-4 text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-blue-500">
          Organize PDF
        </h1>
        <p className="text-lg text-muted-foreground mb-4">
          Sort, delete, and rotate PDF pages easily. Drag and drop to reorder.
        </p>
        <div className="flex items-center justify-center gap-2 text-sm font-medium text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 dark:text-emerald-400 py-1.5 px-4 rounded-full max-w-fit mx-auto border border-emerald-200 dark:border-emerald-500/20">
          <ShieldCheck className="h-4 w-4" />
          <span>100% Private - Processed entirely on your device</span>
        </div>
      </div>

      {!organizedUrl ? (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {!file ? (
            <Card
              {...getRootProps()}
              className={`border-2 border-dashed p-16 text-center cursor-pointer transition-all duration-300 ${
                isDragActive
                  ? "border-indigo-500 bg-indigo-500/10 shadow-lg shadow-indigo-500/20 scale-[1.02]"
                  : "border-border hover:border-indigo-500/50 hover:bg-card/50"
              }`}
            >
              <input {...getInputProps()} />
              <div className="flex flex-col items-center justify-center space-y-4">
                <div className="bg-indigo-500/20 p-5 rounded-full">
                  <FileUp className="h-10 w-10 text-indigo-500" />
                </div>
                <div>
                  <p className="text-2xl font-medium">
                    {isDragActive ? "Drop your PDF here" : "Drag & drop a PDF here"}
                  </p>
                  <p className="text-muted-foreground mt-2">
                    or click to select a file from your computer
                  </p>
                </div>
              </div>
            </Card>
          ) : (
            <div className="space-y-8">
              <div className="relative group bg-card border border-indigo-500/30 p-4 rounded-xl flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="bg-indigo-500/10 p-2 rounded-lg">
                    <File className="h-8 w-8 text-indigo-500 shrink-0" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-lg font-medium truncate max-w-[300px] md:max-w-md">{file.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {(file.size / 1024 / 1024).toFixed(2)} MB • {pages.length} Pages remaining
                    </p>
                  </div>
                </div>
                <button
                  onClick={removeFile}
                  className="bg-destructive/10 text-destructive rounded-full p-2 hover:bg-destructive hover:text-white transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* PDF Document Loader and DND Area */}
              <div className="bg-muted/30 border border-border/50 rounded-2xl p-6 min-h-[400px]">
                <Document
                  file={file}
                  onLoadSuccess={onDocumentLoadSuccess}
                  loading={
                    <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground">
                      <Loader2 className="h-8 w-8 animate-spin mb-4 text-indigo-500" />
                      <p>Loading document pages...</p>
                    </div>
                  }
                  error={
                    <div className="text-destructive text-center p-8 bg-destructive/10 rounded-xl">
                      Failed to load PDF. Please try a different file.
                    </div>
                  }
                >
                  {pages.length > 0 && (
                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                      <SortableContext items={pages} strategy={rectSortingStrategy}>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                          {pages.map((page) => (
                            <SortablePage
                              key={page.id}
                              page={page}
                              onRotate={handleRotate}
                              onDelete={handleDelete}
                            />
                          ))}
                        </div>
                      </SortableContext>
                    </DndContext>
                  )}
                  {pages.length === 0 && (
                    <div className="text-center p-12 text-muted-foreground">
                      No pages left. Please reload the PDF.
                    </div>
                  )}
                </Document>
              </div>

              {error && (
                <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm text-center font-medium">
                  {error}
                </div>
              )}

              <div className="flex justify-center">
                <Button
                  size="lg"
                  onClick={handleOrganize}
                  disabled={isOrganizing || pages.length === 0}
                  className="rounded-full px-10 h-14 shadow-lg shadow-indigo-500/25 bg-indigo-500 hover:bg-indigo-600 text-white text-lg font-medium"
                >
                  {isOrganizing ? (
                    <>
                      <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                      Organizing PDF...
                    </>
                  ) : (
                    <>
                      <Layers className="mr-2 h-6 w-6" />
                      Organize and Save
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <Card className="p-12 text-center animate-in zoom-in-95 duration-500 bg-card/50 border-indigo-500/20 shadow-xl shadow-indigo-500/10">
          <div className="flex flex-col items-center justify-center space-y-6">
            <div className="bg-green-500/20 p-4 rounded-full">
              <Download className="h-12 w-12 text-green-500" />
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-2">PDF Organized Successfully!</h2>
              <p className="text-muted-foreground">
                Your modified document has been downloaded automatically.
              </p>
            </div>
            <div className="flex gap-4">
              <Button onClick={removeFile} variant="outline" className="rounded-full px-6 border-indigo-500/20 hover:bg-indigo-500/10">
                Organize Another File
              </Button>
              <a href={organizedUrl} download="organized-mergemaster.pdf" className={cn(buttonVariants({ variant: "default" }), "rounded-full px-6 shadow-lg shadow-indigo-500/20 bg-indigo-500 hover:bg-indigo-600")}>
                Download Again
              </a>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
