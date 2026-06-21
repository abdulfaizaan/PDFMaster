import type { HttpContext } from '@adonisjs/core/http'
import { PDFDocument } from 'pdf-lib'
import fs from 'node:fs/promises'

export default class MergeController {
  public async handle({ request, response }: HttpContext) {
    const pdfs = request.files('pdfs', {
      extnames: ['pdf'],
      size: '50mb',
    })

    if (!pdfs || pdfs.length < 2) {
      return response.badRequest({ error: 'Please upload at least 2 PDF files to merge.' })
    }

    for (const pdf of pdfs) {
      if (pdf.hasErrors) {
        return response.badRequest({ error: pdf.errors })
      }
    }

    try {
      const mergedPdf = await PDFDocument.create()

      for (const pdf of pdfs) {
        if (!pdf.tmpPath) continue
        
        const pdfBytes = await fs.readFile(pdf.tmpPath)
        const document = await PDFDocument.load(pdfBytes)
        const copiedPages = await mergedPdf.copyPages(document, document.getPageIndices())
        
        for (const page of copiedPages) {
          mergedPdf.addPage(page)
        }
      }

      const mergedPdfBytes = await mergedPdf.save()
      
      response.header('Content-Type', 'application/pdf')
      response.header('Content-Disposition', 'attachment; filename="merged.pdf"')
      
      return response.send(Buffer.from(mergedPdfBytes))
    } catch (error) {
      console.error('Merge error:', error)
      return response.internalServerError({ error: 'Failed to merge PDFs' })
    }
  }
}
