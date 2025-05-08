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

                console.log('Input file metadata:', JSON.stringify(metadata, null, 2));

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

                // Log video stream details
                console.log('Video stream details:', JSON.stringify(videoStream, null, 2));

                // Use more conservative encoding parameters
                const width = videoStream.width || 1280;
                const height = videoStream.height || 720;
                const fps = videoStream.r_frame_rate ? eval(videoStream.r_frame_rate) : 30;
                
                // Calculate bitrate based on resolution and fps
                const targetBitrate = Math.min(1500, Math.max(800, Math.floor((width * height * fps) / 2000)));

                console.log(`Encoding parameters: width=${width}, height=${height}, fps=${fps}, bitrate=${targetBitrate}k`);

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
                        '-movflags +faststart',
                        '-pix_fmt yuv420p',  // Ensure compatible pixel format
                        '-g 30',             // Keyframe interval
                        '-sc_threshold 0',   // Scene change threshold
                        '-keyint_min 30',    // Minimum keyframe interval
                        '-r 30'              // Force output frame rate
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
                        console.error('FFmpeg error details:', err);
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
        console.error('Conversion error:', error);
        throw error;
    }
};

module.exports = { convertToHLS }; 