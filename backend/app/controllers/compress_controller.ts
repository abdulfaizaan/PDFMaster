import type { HttpContext } from '@adonisjs/core/http'
import fs from 'node:fs/promises'
import path from 'node:path'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import crypto from 'node:crypto'

const execFileAsync = promisify(execFile)

export default class CompressController {
  public async handle({ request, response }: HttpContext) {
    const pdf = request.file('pdf', {
      extnames: ['pdf'],
      size: '50mb',
    })
    
    const level = request.input('level', 'recommended')

    if (!pdf) {
      return response.badRequest({ error: 'Please upload a PDF file.' })
    }
    
    if (pdf.hasErrors) {
      return response.badRequest({ error: pdf.errors })
    }

    try {
      if (!pdf.tmpPath) throw new Error('Missing tmpPath')
      
      // Determine ghostscript settings based on requested level
      let gsSetting = '/ebook' // recommended (150 dpi)
      if (level === 'extreme') gsSetting = '/screen' // extreme (72 dpi)
      if (level === 'less') gsSetting = '/printer' // less (300 dpi)

      // Ghostscript executable path (from env or fallback)
      let gsPath = process.env.GS_PATH || 'gs'
      // Basic fallback for local Windows dev if nothing is provided
      if (process.platform === 'win32' && !process.env.GS_PATH) {
        gsPath = 'gswin64c'
      }
      
      // Temporary output path
      const outputFilename = `${crypto.randomUUID()}.pdf`
      const outputPath = path.join(path.dirname(pdf.tmpPath), outputFilename)

      // Execute Ghostscript to compress the PDF safely
      const args = [
        '-sDEVICE=pdfwrite',
        '-dCompatibilityLevel=1.4',
        `-dPDFSETTINGS=${gsSetting}`,
        '-dNOPAUSE',
        '-dQUIET',
        '-dBATCH',
        `-sOutputFile=${outputPath}`,
        pdf.tmpPath
      ]
      
      await execFileAsync(gsPath, args)

      // Read compressed file
      const compressedPdfBytes = await fs.readFile(outputPath)
      
      // Clean up temporary output file
      await fs.unlink(outputPath).catch(console.error)
      
      response.header('Content-Type', 'application/pdf')
      response.header('Content-Disposition', 'attachment; filename="compressed-pdfmaster.pdf"')
      
      return response.send(Buffer.from(compressedPdfBytes))
    } catch (error) {
      console.error('Compress error:', error)
      return response.internalServerError({ error: 'Failed to compress PDF using Ghostscript' })
    }
  }
}
