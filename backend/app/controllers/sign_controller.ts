import type { HttpContext } from '@adonisjs/core/http'
import { PDFDocument } from 'pdf-lib'
import fs from 'node:fs/promises'

export default class SignController {
  public async handle({ request, response }: HttpContext) {
    const pdf = request.file('pdf', {
      extnames: ['pdf'],
      size: '50mb',
    })

    const signatureBase64 = request.input('signatureBase64')
    const pageIndex = Number.parseInt(request.input('pageIndex', '0'), 10)
    const x = Number.parseFloat(request.input('x', '0'))
    const y = Number.parseFloat(request.input('y', '0'))
    const width = Number.parseFloat(request.input('width', '100'))
    const height = Number.parseFloat(request.input('height', '50'))

    if (!pdf || pdf.hasErrors) {
      return response.badRequest({ error: 'Please upload a valid PDF file.' })
    }

    if (!signatureBase64) {
      return response.badRequest({ error: 'Signature is required.' })
    }

    try {
      if (!pdf.tmpPath) {
        return response.badRequest({ error: 'Failed to process PDF upload.' })
      }

      const isPercentage = request.input('isPercentage') === 'true'

      const pdfBytes = await fs.readFile(pdf.tmpPath)
      const document = await PDFDocument.load(pdfBytes)

      // Parse the base64 string (remove data:image/png;base64, prefix if present)
      const base64Data = signatureBase64.replace(/^data:image\/(png|jpeg);base64,/, '')
      const signatureBytes = Buffer.from(base64Data, 'base64')

      // We assume the signature is PNG for simplicity, as react-signature-canvas outputs PNG by default
      const signatureImage = await document.embedPng(signatureBytes)

      const pages = document.getPages()
      if (pageIndex < 0 || pageIndex >= pages.length) {
        return response.badRequest({ error: 'Invalid page index.' })
      }

      const targetPage = pages[pageIndex]
      const { width: pageWidth, height: pageHeight } = targetPage.getSize()

      let finalX = x
      let finalY = y
      let finalWidth = width
      let finalHeight = height

      if (isPercentage) {
        finalX = x * pageWidth
        finalY = y * pageHeight
        finalWidth = width * pageWidth
        finalHeight = height * pageHeight
      }

      // The frontend coordinates (x, y) are usually relative to the top-left corner.
      // pdf-lib's coordinate system has the origin (0, 0) at the bottom-left corner.
      // We need to convert the top-left y coordinate to a bottom-left y coordinate.
      // Additionally, the drawing coordinate for pdf-lib specifies the bottom-left corner of the image.
      // If the frontend y is the top of the image, the bottom of the image is at frontend y + height.
      // In bottom-left coordinates, the top is pageHeight - y, and the bottom is pageHeight - (y + height).
      const pdfY = pageHeight - finalY - finalHeight

      targetPage.drawImage(signatureImage, {
        x: finalX,
        y: pdfY,
        width: finalWidth,
        height: finalHeight,
      })

      const signedPdfBytes = await document.save()

      response.header('Content-Type', 'application/pdf')
      response.header('Content-Disposition', 'attachment; filename="signed.pdf"')

      return response.send(Buffer.from(signedPdfBytes))
    } catch (error) {
      console.error('Sign error:', error)
      return response.internalServerError({ error: 'Failed to sign PDF' })
    }
  }
}
