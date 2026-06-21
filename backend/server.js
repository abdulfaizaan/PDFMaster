const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(cors());

// Configure multer for file uploads
const upload = multer({ dest: 'uploads/' });

// Ensure uploads directory exists
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

app.post('/api/compress', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }

  const { level } = req.body;
  let dPDFSETTINGS = '/ebook'; // default recommended

  if (level === 'extreme') {
    dPDFSETTINGS = '/screen';
  } else if (level === 'less') {
    dPDFSETTINGS = '/printer';
  }

  const inputPath = req.file.path;
  const outputPath = path.join('uploads', `compressed_${req.file.filename}.pdf`);

  // Execute ghostscript
  // Use gswin64c on Windows, and gs on Linux (Render Docker container)
  const isWindows = process.platform === 'win32';
  const gsExe = isWindows ? 'gswin64c' : 'gs';
  const gsCommand = `${gsExe} -sDEVICE=pdfwrite -dCompatibilityLevel=1.5 -dPDFSETTINGS=${dPDFSETTINGS} -dNOPAUSE -dQUIET -dBATCH -sOutputFile="${outputPath}" "${inputPath}"`;

  exec(gsCommand, (error, stdout, stderr) => {
    if (error) {
      console.error('Ghostscript error:', error);
      if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
      return res.status(500).send('Compression failed.');
    }

    // Send the compressed file back
    res.download(outputPath, 'compressed.pdf', (err) => {
      // Clean up both files after sending
      if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
      if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
    });
  });
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});
