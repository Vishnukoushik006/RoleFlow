const express = require('express');
const path = require('path');
const { ZipArchive } = require('archiver');
const fs = require('fs');

const router = express.Router();

/**
 * GET /api/extension/download
 * Zips the extension/ folder on-the-fly and streams it as a .zip download.
 * No authentication required — anyone can download the extension.
 */
router.get('/download', (req, res) => {
  const extensionDir = path.join(__dirname, '../../extension');

  // Verify the extension directory exists
  if (!fs.existsSync(extensionDir)) {
    return res.status(404).json({
      success: false,
      message: 'Extension files not found on server.'
    });
  }

  // Set response headers for zip download
  res.setHeader('Content-Type', 'application/zip');
  res.setHeader('Content-Disposition', 'attachment; filename="jobtrack-extension.zip"');

  // Create a zip archive and pipe it to the response
  const archive = new ZipArchive({ zlib: { level: 9 } });

  archive.on('error', (err) => {
    console.error('[Extension Download] Archive error:', err);
    if (!res.headersSent) {
      res.status(500).json({ success: false, message: 'Failed to create extension archive.' });
    }
  });

  archive.pipe(res);

  // Add the entire extension directory into the zip under a "jobtrack-extension/" folder
  archive.directory(extensionDir, 'jobtrack-extension');

  archive.finalize();
});

module.exports = router;
