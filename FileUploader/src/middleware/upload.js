const multer = require('multer');

const upload = multer({
    storage: multer.memoryStorage(),
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('video/') || file.mimetype.startsWith('audio/')) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only audio and video files are allowed.'));
        }
    },
    limits: {
        fileSize: 200 * 1024 * 1024
    }
});

module.exports = upload; 