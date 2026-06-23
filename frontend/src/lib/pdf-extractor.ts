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

export async function extractTextFromPdf(file: File): Promise<string> {
  // Dynamically import to prevent SSR DOMMatrix errors
  const pdfjsLib = await import('pdfjs-dist');
  
  // Define the worker source to match the installed version locally
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.min.mjs",
    import.meta.url
  ).toString();

  const arrayBuffer = await file.arrayBuffer();
  
  // Load the document
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  const pdf = await loadingTask.promise;
  
  let fullText = "";
  
  // Extract text from each page (limit to first 15 pages to avoid massive token usage)
  const maxPages = Math.min(pdf.numPages, 15);
  
  for (let i = 1; i <= maxPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items.map((item: any) => item.str).join(" ");
    fullText += `[Page ${i}]\n${pageText}\n\n`;
  }
  
  return fullText;
}
