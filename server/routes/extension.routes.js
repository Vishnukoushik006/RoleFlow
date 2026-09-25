const express = require('express');
const path = require('path');
const fs = require('fs');

const router = express.Router();

/**
 * GET /api/extension/download
 * Serves the pre-built extension zip as a download.
 */
router.get('/download', (req, res) => {
  const zipPath = path.join(__dirname, '../public/roleflow-extension.zip');

  if (!fs.existsSync(zipPath)) {
    return res.status(404).json({ success: false, message: 'Extension zip not found.' });
  }

  res.setHeader('Content-Type', 'application/zip');
  res.setHeader('Content-Disposition', 'attachment; filename="roleflow-extension.zip"');
  res.sendFile(zipPath);
});

module.exports = router;
