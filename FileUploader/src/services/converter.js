const { createFFmpeg, fetchFile } = require('@ffmpeg/ffmpeg');
const path = require('path');
const fs = require('fs');

class VideoConverter {
    constructor() {
        this.outputDir = path.join(__dirname, '../../uploads/hls');
        if (!fs.existsSync(this.outputDir)) {
            fs.mkdirSync(this.outputDir, { recursive: true });
        }
        this.ffmpeg = createFFmpeg({ log: true });
    }

    async convertToHLS(inputPath, outputFileName) {
        try {
            if (!this.ffmpeg.isLoaded()) {
                await this.ffmpeg.load();
            }

            const inputData = await fetchFile(inputPath);
            const outputPath = path.join(this.outputDir, outputFileName);
            
            this.ffmpeg.FS('writeFile', 'input.mp4', inputData);
            
            await this.ffmpeg.run(
                '-i', 'input.mp4',
                '-profile:v', 'baseline',
                '-level', '3.0',
                '-start_number', '0',
                '-hls_time', '10',
                '-hls_list_size', '0',
                '-f', 'hls',
                'output.m3u8'
            );

            const m3u8Data = this.ffmpeg.FS('readFile', 'output.m3u8');
            fs.writeFileSync(`${outputPath}.m3u8`, Buffer.from(m3u8Data.buffer));

            const segmentFiles = this.ffmpeg.FS('readdir', '/');
            for (const file of segmentFiles) {
                if (file.endsWith('.ts')) {
                    const segmentData = this.ffmpeg.FS('readFile', file);
                    fs.writeFileSync(path.join(this.outputDir, file), Buffer.from(segmentData.buffer));
                }
            }

            this.ffmpeg.FS('unlink', 'input.mp4');
            this.ffmpeg.FS('unlink', 'output.m3u8');
            segmentFiles.forEach(file => {
                if (file.endsWith('.ts')) {
                    this.ffmpeg.FS('unlink', file);
                }
            });

            return {
                success: true,
                outputPath: `${outputPath}.m3u8`,
                message: 'Conversion completed successfully'
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }
}

module.exports = new VideoConverter();
