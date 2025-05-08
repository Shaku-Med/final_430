const fs = require('fs');
const path = require('path');
const { admin } = require('../config/firebase');

const uploadToFirebase = async (outputDir) => {
    const bucket = admin.storage().bucket();
    const files = fs.readdirSync(outputDir);
    
    const uploadPromises = files.map(async (file) => {
        const filePath = path.join(outputDir, file);
        console.log(file)
        const destination = `hls/${new Date().toLocaleDateString().split('-').join('_')}/${file}`;
        
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

module.exports = { uploadToFirebase }; 