import type { HttpContext } from '@adonisjs/core/http'
import { PDFDocument } from 'pdf-lib'
import fs from 'node:fs/promises'

export default class JpgToPdfController {
  async handle({ request, response }: HttpContext) {
    try {
      // 1. Validate and get uploaded files
      const images = request.files('images', {
        extnames: ['jpg', 'jpeg', 'png'],
        size: '10mb',
      })

      if (!images || images.length === 0) {
        return response.badRequest({ message: 'No images provided or invalid format.' })
      }

      // Check for validation errors
      const invalidImage = images.find((img) => img.hasErrors)
      if (invalidImage) {
        return response.badRequest({ 
          message: 'One or more images are invalid.',
          errors: invalidImage.errors
        })
      }

      // 2. Create a new PDF Document
      const pdfDoc = await PDFDocument.create()

      // 3. Process each image sequentially
      for (const image of images) {
        if (!image.tmpPath) continue

        // Read image bytes
        const imageBytes = await fs.readFile(image.tmpPath)

        let embeddedImage
        const ext = image.extname?.toLowerCase()
        
        // Embed the image based on its type
        if (ext === 'png') {
          embeddedImage = await pdfDoc.embedPng(imageBytes)
        } else {
          // Assume jpg/jpeg
          embeddedImage = await pdfDoc.embedJpg(imageBytes)
        }

        const dims = embeddedImage.scale(1)

        // Create a new page with the exact dimensions of the image
        const page = pdfDoc.addPage([dims.width, dims.height])

        // Draw the image onto the page
        page.drawImage(embeddedImage, {
          x: 0,
          y: 0,
          width: dims.width,
          height: dims.height,
        })
      }

      // 4. Serialize the PDFDocument to bytes
      const pdfBytes = await pdfDoc.save()

      // 5. Send back the PDF as a downloadable attachment
      response.header('Content-Type', 'application/pdf')
      response.header('Content-Disposition', 'attachment; filename="converted-images.pdf"')
      response.header('Content-Length', pdfBytes.length.toString())

      return response.send(Buffer.from(pdfBytes))

    } catch (error: any) {
      console.error('JPG to PDF Error:', error)
      return response.internalServerError({ message: 'Failed to convert images to PDF', error: error.message })
    }
  }
}
