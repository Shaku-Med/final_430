const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const fs = require('fs');
const os = require('os');

class Converter {
    constructor() {
        // Ensure ffmpeg is available
        ffmpeg.setFfmpegPath(require('@ffmpeg-installer/ffmpeg').path);
    }

    /**
     * Convert video file to different format
     * @param {string} inputPath - Path to input file
     * @param {string} outputPath - Path to output file
     * @param {string} format - Target format (e.g., 'mp4', 'webm', 'avi')
     * @returns {Promise} - Promise that resolves when conversion is complete
     */
    async convertVideo(inputPath, outputPath, format) {
        return new Promise((resolve, reject) => {
            if (!fs.existsSync(inputPath)) {
                reject(new Error('Input file does not exist'));
                return;
            }

            ffmpeg(inputPath)
                .output(outputPath)
                .format(format)
                .on('end', () => {
                    resolve({
                        success: true,
                        outputPath: outputPath
                    });
                })
                .on('error', (err) => {
                    reject(new Error(`Conversion failed: ${err.message}`));
                })
                .run();
        });
    }

    /**
     * Extract audio from video file
     * @param {string} inputPath - Path to input video file
     * @param {string} outputPath - Path to output audio file
     * @param {string} format - Audio format (e.g., 'mp3', 'wav', 'aac')
     * @returns {Promise} - Promise that resolves when extraction is complete
     */
    async extractAudio(inputPath, outputPath, format) {
        return new Promise((resolve, reject) => {
            if (!fs.existsSync(inputPath)) {
                reject(new Error('Input file does not exist'));
                return;
            }

            ffmpeg(inputPath)
                .output(outputPath)
                .noVideo()
                .format(format)
                .on('end', () => {
                    resolve({
                        success: true,
                        outputPath: outputPath
                    });
                })
                .on('error', (err) => {
                    reject(new Error(`Audio extraction failed: ${err.message}`));
                })
                .run();
        });
    }

    /**
     * Get video information
     * @param {string} inputPath - Path to input file
     * @returns {Promise} - Promise that resolves with video information
     */
    async getVideoInfo(inputPath) {
        return new Promise((resolve, reject) => {
            if (!fs.existsSync(inputPath)) {
                reject(new Error('Input file does not exist'));
                return;
            }

            ffmpeg.ffprobe(inputPath, (err, metadata) => {
                if (err) {
                    reject(new Error(`Failed to get video info: ${err.message}`));
                    return;
                }
                resolve(metadata);
            });
        });
    }

    async convertToHLS(buffer, outputDir) {
        const tempDir = path.join(os.tmpdir(), `hls-${Date.now()}`);
        fs.mkdirSync(tempDir, { recursive: true });

        try {
            const inputPath = path.join(tempDir, 'input.mp4');
            fs.writeFileSync(inputPath, buffer);

            const outputPath = path.join(tempDir, 'output.m3u8');
            
            await new Promise((resolve, reject) => {
                ffmpeg(inputPath)
                    .outputOptions([
                        '-profile:v baseline',
                        '-level 3.0',
                        '-start_number 0',
                        '-hls_time 10',
                        '-hls_list_size 0',
                        '-f hls'
                    ])
                    .output(outputPath)
                    .on('end', () => {
                        resolve();
                    })
                    .on('error', (err) => {
                        reject(new Error(`HLS conversion failed: ${err.message}`));
                    })
                    .run();
            });

            return tempDir;
        } catch (error) {
            // Cleanup on error
            try {
                fs.rmSync(tempDir, { recursive: true, force: true });
            } catch (cleanupError) {
                console.error('Cleanup error:', cleanupError);
            }
            throw error;
        }
    }
}

module.exports = new Converter();
