"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { FileUp, File, X, Loader2, Download, PenTool, ChevronLeft, ChevronRight } from "lucide-react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import SignatureCanvas from "react-signature-canvas";
import { motion } from "framer-motion";
import { PDFDocument } from "pdf-lib";
import { ShieldCheck } from "lucide-react";

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

export default function SignPdfPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isSigning, setIsSigning] = useState(false);
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // PDF Viewer State
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [pageScale, setPageScale] = useState<number>(1);
  const pageRef = useRef<HTMLDivElement>(null);

  // Signature State
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [signatureImage, setSignatureImage] = useState<string | null>(null);
  const sigCanvas = useRef<SignatureCanvas>(null);

  // Signature Position State
  const [signaturePos, setSignaturePos] = useState({ x: 50, y: 50 });
  const [signatureSize, setSignatureSize] = useState({ width: 200, height: 100 });

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setError(null);
    setSignedUrl(null);
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

  const handleSaveSignature = () => {
    if (sigCanvas.current) {
      if (sigCanvas.current.isEmpty()) {
        setError("Please draw a signature first.");
        return;
      }
      setSignatureImage(sigCanvas.current.getTrimmedCanvas().toDataURL("image/png"));
      setShowSignatureModal(false);
      setError(null);
    }
  };

  const clearSignature = () => {
    if (sigCanvas.current) {
      sigCanvas.current.clear();
    }
  };

  const handleSign = async () => {
    if (!file || !signatureImage) return;

    setIsSigning(true);
    setError(null);

    // Calculate actual PDF coordinates based on rendered page dimensions
    // The pageRef gives us the current rendered dimensions
    const pageElement = pageRef.current;
    if (!pageElement) {
      setError("Failed to get page dimensions.");
      setIsSigning(false);
      return;
    }

    const renderedWidth = pageElement.offsetWidth;
    // We pass relative percentages to be safer, or map them if we know standard PDF points.
    // Actually, `react-pdf` renders at 96 DPI. The standard PDF point is 72 DPI.
    // The safest way is to pass the x, y, width, height as percentages or scaled to actual PDF width
    // But since `react-pdf` allows us to just pass x, y we can scale it on backend.
    // For simplicity, let's pass the relative position (0 to 1) and calculate exact points on backend.
    
    // Wait, the backend already expects x, y, width, height in PDF points.
    // Let's modify the frontend to send the raw values, but the backend uses them directly.
    // Wait, let's just let backend handle scaling if we pass the *rendered* dimensions
    // We'll pass the percentages.
    
    // Let's calculate percentages:
    const pctX = signaturePos.x / renderedWidth;
    const pctY = signaturePos.y / pageElement.offsetHeight;
    const pctWidth = signatureSize.width / renderedWidth;
    const pctHeight = signatureSize.height / pageElement.offsetHeight;

    // Send original dimensions so backend can scale percentages
    // Wait, let's just calculate it assuming standard points, but easier: 
    // Modify backend to expect percentages or we calculate actual points here?
    // Actually, backend can just multiply pctX * pdfWidth, etc.
    // Let's update backend to expect percentages (0 to 1). I will do that in next step.
    // Let's pass pct as x, y, width, height.

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
      const pages = pdfDoc.getPages();
      
      if (pageNumber - 1 >= pages.length) {
        throw new Error("Invalid page number.");
      }
      const targetPage = pages[pageNumber - 1];

      // Convert data URL to ArrayBuffer
      const pngImageBytes = await fetch(signatureImage).then((res) => res.arrayBuffer());
      const pngImage = await pdfDoc.embedPng(pngImageBytes);

      const { width: pdfWidth, height: pdfHeight } = targetPage.getSize();

      const x = pctX * pdfWidth;
      // Invert Y axis because pdf-lib coordinates start from bottom-left
      const y = (1 - pctY - pctHeight) * pdfHeight;
      const width = pctWidth * pdfWidth;
      const height = pctHeight * pdfHeight;

      targetPage.drawImage(pngImage, {
        x,
        y,
        width,
        height,
      });

      const signedPdfBytes = await pdfDoc.save();
      const blob = new Blob([signedPdfBytes as any], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      setSignedUrl(url);

      const a = document.createElement("a");
      a.href = url;
      a.download = `signed-${file.name}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      const message = err instanceof Error ? err.message : "An unexpected error occurred.";
      setError(message);
    } finally {
      setIsSigning(false);
    }
  };

  return (
    <div className="flex-1 container mx-auto max-w-5xl px-4 py-12">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-extrabold tracking-tight mb-4 text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-500">
          Sign PDF Document
        </h1>
        <p className="text-lg text-muted-foreground mb-4">
          Draw your signature and place it anywhere on your PDF.
        </p>
        <div className="flex items-center justify-center gap-2 text-sm font-medium text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 dark:text-emerald-400 py-1.5 px-4 rounded-full max-w-fit mx-auto border border-emerald-200 dark:border-emerald-500/20">
          <ShieldCheck className="h-4 w-4" />
          <span>100% Private - Processed entirely on your device</span>
        </div>
      </div>

      {!signedUrl ? (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {!file ? (
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
                    {isDragActive ? "Drop your PDF here" : "Drag & drop your PDF here"}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    or click to select a file from your computer
                  </p>
                </div>
              </div>
            </Card>
          ) : (
            <div className="flex flex-col lg:flex-row gap-8 items-start">
              {/* PDF Viewer */}
              <div className="flex-1 w-full bg-muted/30 rounded-xl border overflow-hidden flex flex-col items-center p-4 relative">
                <div className="flex items-center justify-between w-full mb-4 bg-background p-2 rounded-lg border shadow-sm">
                  <span className="text-sm font-medium truncate max-w-[200px]">{file.name}</span>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setPageNumber(p => Math.max(1, p - 1))}
                      disabled={pageNumber <= 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm font-medium">
                      Page {pageNumber} of {numPages || '-'}
                    </span>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setPageNumber(p => Math.min(numPages || 1, p + 1))}
                      disabled={pageNumber >= numPages}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <Button variant="ghost" size="icon" onClick={() => { setFile(null); setSignatureImage(null); }} className="text-destructive">
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                {/* PDF Page Container */}
                <div className="relative border shadow-xl bg-white select-none" ref={pageRef} style={{ maxWidth: '100%', overflowX: 'auto' }}>
                  <Document
                    file={file}
                    onLoadSuccess={onDocumentLoadSuccess}
                    className="flex justify-center"
                    loading={<Loader2 className="h-8 w-8 animate-spin text-primary my-12" />}
                  >
                    <Page 
                      pageNumber={pageNumber} 
                      scale={pageScale} 
                      className="max-w-full"
                      renderTextLayer={false}
                      renderAnnotationLayer={false}
                    />
                  </Document>

                  {/* Signature Overlay */}
                  {signatureImage && (
                    <motion.div
                      drag
                      dragMomentum={false}
                      dragConstraints={pageRef}
                      onDragEnd={(e, info) => {
                        setSignaturePos({
                          x: signaturePos.x + info.offset.x,
                          y: signaturePos.y + info.offset.y
                        });
                      }}
                      className="absolute z-10 cursor-move border-2 border-primary/50 border-dashed rounded bg-white/10 hover:bg-white/30 transition-colors"
                      style={{
                        top: signaturePos.y,
                        left: signaturePos.x,
                        width: signatureSize.width,
                        height: signatureSize.height,
                        touchAction: "none"
                      }}
                    >
                      <img 
                        src={signatureImage} 
                        alt="Signature" 
                        className="w-full h-full object-contain pointer-events-none"
                      />
                      <div className="absolute -top-3 -right-3 bg-primary text-white rounded-full p-1 cursor-pointer shadow-md" onClick={() => setSignatureImage(null)}>
                        <X className="h-3 w-3" />
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>

              {/* Controls Sidebar */}
              <div className="w-full lg:w-80 space-y-6">
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Signature</h3>
                  
                  {!signatureImage ? (
                    <Button 
                      className="w-full gap-2" 
                      onClick={() => setShowSignatureModal(true)}
                    >
                      <PenTool className="h-4 w-4" />
                      Create Signature
                    </Button>
                  ) : (
                    <div className="space-y-4">
                      <div className="border rounded bg-white p-2">
                        <img src={signatureImage} alt="Your signature" className="w-full h-24 object-contain" />
                      </div>
                      <Button 
                        variant="outline" 
                        className="w-full" 
                        onClick={() => setShowSignatureModal(true)}
                      >
                        Redraw Signature
                      </Button>
                    </div>
                  )}
                </Card>

                {error && (
                  <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
                    {error}
                  </div>
                )}

                <Button
                  size="lg"
                  onClick={handleSign}
                  disabled={isSigning || !signatureImage}
                  className="w-full rounded-full shadow-lg text-base h-12"
                >
                  {isSigning ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Applying Signature...
                    </>
                  ) : (
                    "Sign & Download PDF"
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
              <h2 className="text-2xl font-bold mb-2">PDF Signed Successfully!</h2>
              <p className="text-muted-foreground">
                Your signed PDF should have downloaded automatically.
              </p>
            </div>
            <div className="flex gap-4">
              <Button onClick={() => {
                setSignedUrl(null);
                setFile(null);
                setSignatureImage(null);
              }} variant="outline" className="rounded-full px-6">
                Sign Another File
              </Button>
              <a href={signedUrl} download={`signed-${file?.name}`} className={cn(buttonVariants({ variant: "default" }), "rounded-full px-6 shadow-lg shadow-primary/20")}>
                Download Again
              </a>
            </div>
          </div>
        </Card>
      )}

      {/* Signature Draw Modal */}
      {showSignatureModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <Card className="w-full max-w-lg overflow-hidden flex flex-col shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-4 border-b flex justify-between items-center bg-muted/30">
              <h3 className="font-semibold text-lg">Draw Your Signature</h3>
              <Button variant="ghost" size="icon" onClick={() => setShowSignatureModal(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="p-4 bg-gray-50 flex justify-center">
              <div className="border bg-white rounded-lg shadow-inner w-full">
                <SignatureCanvas
                  ref={sigCanvas}
                  penColor="black"
                  canvasProps={{
                    className: "signature-canvas w-full h-48 cursor-crosshair rounded-lg"
                  }}
                />
              </div>
            </div>
            <div className="p-4 border-t flex justify-between bg-muted/30">
              <Button variant="outline" onClick={clearSignature}>
                Clear
              </Button>
              <div className="space-x-2">
                <Button variant="ghost" onClick={() => setShowSignatureModal(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveSignature}>
                  Save Signature
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
