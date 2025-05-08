const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const os = require('os');
const fs = require('fs');

const convertToHLS = async (inputBuffer, outputDir) => {
    const tempInputPath = path.join(os.tmpdir(), `input-${Date.now()}`);
    const tempOutputPath = path.join(os.tmpdir(), `output-${Date.now()}`);
    
    fs.writeFileSync(tempInputPath, inputBuffer);
    
    return new Promise((resolve, reject) => {
        ffmpeg(tempInputPath)
            .outputOptions([
                '-profile:v baseline',
                '-level 3.0',
                '-start_number 0',
                '-hls_time 10',
                '-hls_list_size 0',
                '-f hls'
            ])
            .output(path.join(tempOutputPath, 'stream.m3u8'))
            .on('end', () => {
                resolve(tempOutputPath);
            })
            .on('error', (err) => {
                reject(err);
            })
            .run();
    });
};

module.exports = { convertToHLS }; 