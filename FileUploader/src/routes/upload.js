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

        let urls;
        const isMediaFile = req.file.mimetype.startsWith('video/') || req.file.mimetype.startsWith('audio/');

        if (isMediaFile) {
            // Convert and upload media files
            const outputDir = await convertToHLS(req.file.buffer, os.tmpdir());
            urls = await uploadToFirebase(outputDir, req.body);
            fs.rmSync(outputDir, { recursive: true, force: true });
        } else {
            // Directly upload non-media files
            urls = await uploadToFirebase(req.file.buffer, req.body);
        }
        
        res.json({
            success: true,
            message: 'File uploaded successfully',
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