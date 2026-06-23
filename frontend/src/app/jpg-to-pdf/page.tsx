"use client";

import { useState, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Image as ImageIcon, X, Loader2, Download, GripVertical, FileUp } from "lucide-react";
import Image from "next/image";

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

type SortableImageFile = {
  id: string;
  file: File;
  preview: string;
};

function SortableThumbnail({
  image,
  onDelete,
  index
}: {
  image: SortableImageFile;
  onDelete: (id: string) => void;
  index: number;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: image.id,
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
        isDragging ? "shadow-2xl border-primary scale-105 opacity-80" : "shadow-sm border-border hover:border-primary/50 hover:shadow-md"
      )}
    >
      <div
        className="cursor-grab active:cursor-grabbing w-full flex justify-center pb-2 mb-2 border-b border-border/50 text-muted-foreground hover:text-foreground"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-5 w-5" />
      </div>

      <div className="relative w-[150px] h-[150px] overflow-hidden rounded bg-canvas border border-hairline flex items-center justify-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={image.preview} alt="preview" className="object-cover w-full h-full pointer-events-none" />
      </div>

      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete(image.id);
        }}
        className="absolute top-12 right-2 opacity-0 group-hover:opacity-100 bg-white/90 p-1.5 rounded-full text-destructive hover:bg-destructive/10 shadow-sm border border-destructive/20 transition-all"
        title="Delete"
      >
        <X className="h-4 w-4" />
      </button>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-surface-dark text-on-dark-soft text-xs px-2.5 py-1 rounded-full font-medium shadow-sm">
        {index + 1}
      </div>
    </div>
  );
}

export default function JpgToPdfPage() {
  const [images, setImages] = useState<SortableImageFile[]>([]);
  const [isConverting, setIsConverting] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // Cleanup object URLs to avoid memory leaks
  useEffect(() => {
    return () => images.forEach((img) => URL.revokeObjectURL(img.preview));
  }, [images]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setError(null);
    setPdfUrl(null);

    const newImages = acceptedFiles.map((file) => ({
      id: `${file.name}-${Date.now()}-${Math.random()}`,
      file,
      preview: URL.createObjectURL(file),
    }));

    setImages((prev) => [...prev, ...newImages]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
    },
  });

  const removeAll = () => {
    setImages([]);
    setPdfUrl(null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setImages((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleDelete = (id: string) => {
    setImages((current) => {
      const target = current.find((img) => img.id === id);
      if (target) URL.revokeObjectURL(target.preview);
      return current.filter((img) => img.id !== id);
    });
  };

  const handleConvert = async () => {
    if (images.length === 0) {
      setError("Please add at least one image.");
      return;
    }

    setIsConverting(true);
    setError(null);

    try {
      // Dynamically import PDFDocument to avoid SSR issues if any, but it's fine since it's a click handler
      const { PDFDocument } = await import("pdf-lib");
      const pdfDoc = await PDFDocument.create();

      for (const imgObj of images) {
        const fileBytes = await imgObj.file.arrayBuffer();
        
        let pdfImage;
        if (imgObj.file.type === 'image/jpeg' || imgObj.file.type === 'image/jpg') {
          pdfImage = await pdfDoc.embedJpg(fileBytes);
        } else if (imgObj.file.type === 'image/png') {
          pdfImage = await pdfDoc.embedPng(fileBytes);
        } else {
          continue; // Skip unsupported formats
        }

        const { width, height } = pdfImage.scale(1);
        const page = pdfDoc.addPage([width, height]);
        
        page.drawImage(pdfImage, {
          x: 0,
          y: 0,
          width,
          height,
        });
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      setPdfUrl(url);

      // Auto-download
      const a = document.createElement("a");
      a.href = url;
      a.download = "images-to-pdf.pdf";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setIsConverting(false);
    }
  };

  return (
    <div className="flex-1 container mx-auto max-w-5xl px-4 py-12">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-display font-medium tracking-tight mb-4 text-ink">
          JPG to PDF
        </h1>
        <p className="text-lg text-muted-foreground">
          Convert JPG and PNG images into a single PDF document. Drag to reorder your pages.
        </p>
      </div>

      {!pdfUrl ? (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
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
              <div className="bg-primary/20 p-5 rounded-full">
                <FileUp className="h-10 w-10 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-medium">
                  {isDragActive ? "Drop images here" : "Drag & drop images here"}
                </p>
                <p className="text-muted-foreground mt-2">
                  or click to select JPG/PNG files from your computer
                </p>
              </div>
            </div>
          </Card>

          {images.length > 0 && (
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-ink">Selected Images ({images.length})</h3>
                <Button variant="ghost" onClick={removeAll} className="text-muted-foreground">
                  Clear All
                </Button>
              </div>

              {/* DND Area */}
              <div className="bg-surface-soft border border-hairline rounded-2xl p-6 min-h-[300px]">
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                  <SortableContext items={images} strategy={rectSortingStrategy}>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                      {images.map((img, index) => (
                        <SortableThumbnail
                          key={img.id}
                          image={img}
                          index={index}
                          onDelete={handleDelete}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              </div>

              {error && (
                <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm text-center font-medium">
                  {error}
                </div>
              )}

              <div className="flex justify-center">
                <Button
                  size="lg"
                  onClick={handleConvert}
                  disabled={isConverting || images.length === 0}
                  className="rounded-full px-10 h-14 shadow-lg text-base"
                >
                  {isConverting ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Converting...
                    </>
                  ) : (
                    "Convert to PDF"
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <Card className="p-12 text-center animate-in zoom-in-95 duration-500 bg-surface-card border-hairline shadow-sm rounded-xl">
          <div className="flex flex-col items-center justify-center space-y-6">
            <div className="bg-green-500/20 p-4 rounded-full">
              <Download className="h-12 w-12 text-green-500" />
            </div>
            <div>
              <h2 className="text-2xl font-display font-medium tracking-tight mb-2 text-ink">PDF Converted Successfully!</h2>
              <p className="text-muted-foreground">
                Your images have been combined and downloaded automatically.
              </p>
            </div>
            <div className="flex gap-4">
              <Button onClick={removeAll} variant="outline" className="rounded-full px-6">
                Convert More Images
              </Button>
              <a href={pdfUrl} download="images-to-pdf.pdf" className={cn(buttonVariants({ variant: "default" }), "rounded-full px-6 shadow-sm")}>
                Download Again
              </a>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
