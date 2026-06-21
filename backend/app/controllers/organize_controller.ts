import type { HttpContext } from '@adonisjs/core/http'
import { PDFDocument, degrees } from 'pdf-lib'
import fs from 'node:fs/promises'

export default class OrganizeController {
  public async handle({ request, response }: HttpContext) {
    const file = request.file('pdf', {
      extnames: ['pdf'],
      size: '50mb',
    })
    
    const pagesJson = request.input('pages')

    if (!file) {
      return response.badRequest({ error: 'Please upload a PDF file.' })
    }

    if (file.hasErrors) {
      return response.badRequest({ error: file.errors })
    }
    
    if (!pagesJson) {
      return response.badRequest({ error: 'Missing pages configuration.' })
    }

    try {
      if (!file.tmpPath) throw new Error('Missing tmpPath')

      // Parse the pages array
      // Expected format: [{ index: 0, rotation: 90 }, { index: 2, rotation: 0 }]
      const pagesConfig: { index: number; rotation: number }[] = JSON.parse(pagesJson)

      const pdfBytes = await fs.readFile(file.tmpPath)
      const originalPdf = await PDFDocument.load(pdfBytes)
      
      const newPdf = await PDFDocument.create()

      for (const config of pagesConfig) {
        // Copy the specific page
        const [copiedPage] = await newPdf.copyPages(originalPdf, [config.index])
        
        // Apply absolute rotation (overriding existing rotation)
        // Note: pdf-lib sets rotation relative to the page's coordinate system
        // The frontend calculates the final absolute rotation (0, 90, 180, 270)
        copiedPage.setRotation(degrees(config.rotation))
        
        newPdf.addPage(copiedPage)
      }
      
      const organizedPdfBytes = await newPdf.save()

      response.header('Content-Type', 'application/pdf')
      response.header('Content-Disposition', 'attachment; filename="organized-pdfmaster.pdf"')
      
      return response.send(Buffer.from(organizedPdfBytes))
    } catch (error) {
      console.error('Organize PDF error:', error)
      return response.internalServerError({ error: 'Failed to organize PDF' })
    }
  }
}
