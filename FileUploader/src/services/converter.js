const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const os = require('os');
const fs = require('fs');

const convertToHLS = async (inputBuffer, outputDir) => {
    const tempInputPath = path.join(os.tmpdir(), `input-${Date.now()}`);
    const tempOutputPath = path.join(os.tmpdir(), `output-${Date.now()}`);
    
    try {
        // Create output directory
        fs.mkdirSync(tempOutputPath, { recursive: true });
        
        // Write input file
        fs.writeFileSync(tempInputPath, inputBuffer);
        
        return new Promise((resolve, reject) => {
            ffmpeg(tempInputPath)
                .outputOptions([
                    '-profile:v baseline',
                    '-level 3.0',
                    '-start_number 0',
                    '-hls_time 10',
                    '-hls_list_size 0',
                    '-f hls',
                    '-c:v libx264',
                    '-c:a aac',
                    '-b:a 128k',
                    '-b:v 1000k',
                    '-maxrate 1000k',
                    '-bufsize 2000k'
                ])
                .output(path.join(tempOutputPath, 'stream.m3u8'))
                .on('start', (commandLine) => {
                    console.log('FFmpeg started:', commandLine);
                })
                .on('progress', (progress) => {
                    console.log('Processing: ' + Math.floor(progress.percent) + '% done');
                })
                .on('end', () => {
                    // Clean up input file
                    fs.unlinkSync(tempInputPath);
                    resolve(tempOutputPath);
                })
                .on('error', (err) => {
                    // Clean up input file
                    fs.unlinkSync(tempInputPath);
                    reject(err);
                })
                .run();
        });
    } catch (error) {
        // Clean up input file if it exists
        if (fs.existsSync(tempInputPath)) {
            fs.unlinkSync(tempInputPath);
        }
        throw error;
    }
};

module.exports = { convertToHLS }; 