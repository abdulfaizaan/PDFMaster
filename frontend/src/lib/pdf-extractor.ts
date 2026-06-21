export async function extractTextFromPdf(file: File): Promise<string> {
  // Dynamically import to prevent SSR DOMMatrix errors
  const pdfjsLib = await import('pdfjs-dist');
  
  // Define the worker source to match the installed version
  pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

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
