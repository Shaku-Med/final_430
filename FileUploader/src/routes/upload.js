const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const { convertToHLS } = require('../services/converter');
const { uploadToFirebase } = require('../services/storage');
const fs = require('fs');
const os = require('os');

router.post('/', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const outputDir = await convertToHLS(req.file.buffer, os.tmpdir());
        const urls = await uploadToFirebase(outputDir);
        
        fs.rmSync(outputDir, { recursive: true, force: true });
        
        res.json({
            success: true,
            message: 'File uploaded and converted successfully',
            urls
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({
            success: false,
            message: 'Error processing file',
        });
    }
});

module.exports = router; 