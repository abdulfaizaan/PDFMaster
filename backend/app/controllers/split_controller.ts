import type { HttpContext } from '@adonisjs/core/http'
import { PDFDocument } from 'pdf-lib'
import fs from 'node:fs/promises'

export default class SplitController {
  public async handle({ request, response }: HttpContext) {
    const pdf = request.file('pdf', {
      extnames: ['pdf'],
      size: '50mb',
    })
    
    const rangeStr = request.input('range', '')

    if (!pdf) {
      return response.badRequest({ error: 'Please upload a PDF file.' })
    }
    
    if (pdf.hasErrors) {
      return response.badRequest({ error: pdf.errors })
    }

    if (!rangeStr) {
      return response.badRequest({ error: 'Please provide a valid page range (e.g., "1-3" or "2,4,5-7").' })
    }

    try {
      if (!pdf.tmpPath) throw new Error('Missing tmpPath')
      
      const pdfBytes = await fs.readFile(pdf.tmpPath)
      const document = await PDFDocument.load(pdfBytes)
      const totalPages = document.getPageCount()

      // Parse range string
      const pagesToExtract = new Set<number>()
      const parts = rangeStr.split(',')
      for (const part of parts) {
        if (part.includes('-')) {
          const [startStr, endStr] = part.split('-')
          let start = parseInt(startStr.trim(), 10)
          let end = parseInt(endStr.trim(), 10)
          if (!isNaN(start) && !isNaN(end)) {
            if (start < 1) start = 1
            if (end > totalPages) end = totalPages
            for (let i = start; i <= end; i++) {
              pagesToExtract.add(i - 1)
            }
          }
        } else {
          const num = parseInt(part.trim(), 10)
          if (!isNaN(num) && num >= 1 && num <= totalPages) {
            pagesToExtract.add(num - 1)
          }
        }
      }

      const indices = Array.from(pagesToExtract).sort((a, b) => a - b)
      
      if (indices.length === 0) {
        return response.badRequest({ error: 'The provided range did not match any valid pages in the document.' })
      }

      const splitPdf = await PDFDocument.create()
      const copiedPages = await splitPdf.copyPages(document, indices)
      
      for (const page of copiedPages) {
        splitPdf.addPage(page)
      }

      const splitPdfBytes = await splitPdf.save()
      
      response.header('Content-Type', 'application/pdf')
      response.header('Content-Disposition', 'attachment; filename="split-pdfmaster.pdf"')
      
      return response.send(Buffer.from(splitPdfBytes))
    } catch (error) {
      console.error('Split error:', error)
      return response.internalServerError({ error: 'Failed to split PDF' })
    }
  }
}
