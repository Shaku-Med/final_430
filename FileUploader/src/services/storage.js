const fs = require('fs');
const path = require('path');
const { admin } = require('../config/firebase');
const os = require('os');

const uploadHLSFiles = async (outputDir, body) => {
    const bucket = admin.storage().bucket();
    const files = fs.readdirSync(outputDir);
    
    const uploadPromises = files.map(async (file) => {
        const filePath = path.join(outputDir, file);
        const destination = `hls/${new Date().toDateString().split('-').join('_')}/${body?.id}/${file}`;
        
        await bucket.upload(filePath, {
            destination,
            metadata: {
                contentType: file.endsWith('.m3u8') ? 'application/x-mpegURL' : 'video/MP2T'
            }
        });
        
        return bucket.file(destination).getSignedUrl({
            action: 'read',
            expires: '03-01-2500'
        });
    });

    return Promise.all(uploadPromises);
};

const uploadFile = async (file, body) => {
    const bucket = admin.storage().bucket();
    const fileName = body?.originalname || `file_${Date.now()}`;
    const destination = `files/${new Date().toDateString().split('-').join('_')}/${body?.id}/${fileName}`;
    
    // Create a temporary file
    const tempPath = path.join(os.tmpdir(), fileName);
    fs.writeFileSync(tempPath, file);
    
    await bucket.upload(tempPath, {
        destination,
        metadata: {
            contentType: body?.mimetype || 'application/octet-stream'
        }
    });
    
    // Clean up temporary file
    fs.unlinkSync(tempPath);
    
    const [url] = await bucket.file(destination).getSignedUrl({
        action: 'read',
        expires: '03-01-2500'
    });
    
    return [url];
};

module.exports = { 
    uploadHLSFiles,
    uploadFile
}; 