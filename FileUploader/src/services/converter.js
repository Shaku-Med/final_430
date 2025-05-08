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
            // First, probe the input file to get its information
            ffmpeg.ffprobe(tempInputPath, (err, metadata) => {
                if (err) {
                    fs.unlinkSync(tempInputPath);
                    return reject(new Error(`Failed to probe input file: ${err.message}`));
                }

                // Check if the input is a valid video file
                if (!metadata.streams || !metadata.streams.some(stream => stream.codec_type === 'video')) {
                    fs.unlinkSync(tempInputPath);
                    return reject(new Error('Input file is not a valid video file'));
                }

                // Get video stream information
                const videoStream = metadata.streams.find(stream => stream.codec_type === 'video');
                if (!videoStream) {
                    fs.unlinkSync(tempInputPath);
                    return reject(new Error('No video stream found in input file'));
                }

                // Calculate appropriate bitrate based on resolution
                const width = videoStream.width || 1280;
                const height = videoStream.height || 720;
                const targetBitrate = Math.min(2000, Math.max(1000, Math.floor((width * height * 30) / 1000)));

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
                        `-b:v ${targetBitrate}k`,
                        `-maxrate ${targetBitrate}k`,
                        `-bufsize ${targetBitrate * 2}k`,
                        '-preset veryfast',
                        '-movflags +faststart'
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
                        reject(new Error(`FFmpeg conversion failed: ${err.message}`));
                    })
                    .run();
            });
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