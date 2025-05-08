import { useRef } from 'react';

export type MediaChunk = {
  blob: Blob;
  objectUrl: string;
  start: number;
  end: number;
  index: number;
};

export class MediaChunker {
  private file: File;
  private chunkDuration: number;
  private mimeType: string;
  
  constructor(file: File, chunkDuration: number = 10) {
    this.file = file;
    this.chunkDuration = chunkDuration;
    this.mimeType = file.type || this.getMimeTypeFromExtension(file.name);
  }
  
  private getMimeTypeFromExtension(filename: string): string {
    const ext = filename.split('.').pop()?.toLowerCase();
    const mimeMap: {[key: string]: string} = {
      'mp4': 'video/mp4',
      'webm': 'video/webm',
      'ogg': 'video/ogg',
      'mp3': 'audio/mpeg',
      'wav': 'audio/wav',
      'aac': 'audio/aac'
    };
    return mimeMap[ext || ''] || 'video/mp4';
  }
  
  async getDuration(): Promise<number> {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(this.file);
      const media = this.file.type.startsWith('video') 
        ? document.createElement('video')
        : document.createElement('audio');
      
      media.muted = true;
      media.preload = 'metadata';
      
      media.onloadedmetadata = () => {
        URL.revokeObjectURL(url);
        resolve(media.duration);
      };
      
      media.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Failed to load media metadata'));
      };
      
      media.src = url;
    });
  }
  
  async chunkMedia(): Promise<MediaChunk[]> {
    try {
      const duration = await this.getDuration();
      const chunks: MediaChunk[] = [];
      const totalChunks = Math.ceil(duration / this.chunkDuration);
      
      if (this.file.type.startsWith('audio/')) {
        return await this.chunkAudio(duration, totalChunks);
      } else {
        return await this.chunkVideo(duration, totalChunks);
      }
    } catch (error) {
      console.error('Error chunking media:', error);
      throw error;
    }
  }

  private async chunkAudio(duration: number, totalChunks: number): Promise<MediaChunk[]> {
    const chunks: MediaChunk[] = [];
    const audioContext = new AudioContext();
    const arrayBuffer = await this.file.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

    for (let i = 0; i < totalChunks; i++) {
      const start = i * this.chunkDuration;
      const end = Math.min(start + this.chunkDuration, duration);
      
      const startSample = Math.floor(start * audioBuffer.sampleRate);
      const endSample = Math.floor(end * audioBuffer.sampleRate);
      const chunkLength = endSample - startSample;

      const chunkBuffer = audioContext.createBuffer(
        audioBuffer.numberOfChannels,
        chunkLength,
        audioBuffer.sampleRate
      );

      for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
        const channelData = audioBuffer.getChannelData(channel);
        const chunkData = chunkBuffer.getChannelData(channel);
        chunkData.set(channelData.subarray(startSample, endSample));
      }

      const blob = await this.audioBufferToBlob(chunkBuffer);
      const objectUrl = URL.createObjectURL(blob);

      chunks.push({
        blob,
        objectUrl,
        start,
        end,
        index: i
      });
    }

    return chunks;
  }

  private async chunkVideo(duration: number, totalChunks: number): Promise<MediaChunk[]> {
    const chunks: MediaChunk[] = [];
    const fileSize = this.file.size;
    const chunkSize = Math.floor(fileSize / totalChunks);

    for (let i = 0; i < totalChunks; i++) {
      const start = i * this.chunkDuration;
      const end = Math.min(start + this.chunkDuration, duration);
      
      const startByte = i * chunkSize;
      const endByte = Math.min(startByte + chunkSize, fileSize);
      
      const blob = this.file.slice(startByte, endByte);
      const objectUrl = URL.createObjectURL(blob);

      chunks.push({
        blob,
        objectUrl,
        start,
        end,
        index: i
      });
    }

    return chunks;
  }

  private async audioBufferToBlob(audioBuffer: AudioBuffer): Promise<Blob> {
    const wav = this.audioBufferToWav(audioBuffer);
    return new Blob([wav], { type: 'audio/wav' });
  }

  private audioBufferToWav(buffer: AudioBuffer): ArrayBuffer {
    const numChannels = buffer.numberOfChannels;
    const sampleRate = buffer.sampleRate;
    const format = 1; // PCM
    const bitDepth = 16;
    const bytesPerSample = bitDepth / 8;
    const blockAlign = numChannels * bytesPerSample;
    const byteRate = sampleRate * blockAlign;
    const dataSize = buffer.length * blockAlign;
    const headerSize = 44;
    const totalSize = headerSize + dataSize;
    const arrayBuffer = new ArrayBuffer(totalSize);
    const view = new DataView(arrayBuffer);

    // RIFF identifier
    this.writeString(view, 0, 'RIFF');
    // RIFF chunk length
    view.setUint32(4, totalSize - 8, true);
    // RIFF type
    this.writeString(view, 8, 'WAVE');
    // format chunk identifier
    this.writeString(view, 12, 'fmt ');
    // format chunk length
    view.setUint32(16, 16, true);
    // sample format (raw)
    view.setUint16(20, format, true);
    // channel count
    view.setUint16(22, numChannels, true);
    // sample rate
    view.setUint32(24, sampleRate, true);
    // byte rate (sample rate * block align)
    view.setUint32(28, byteRate, true);
    // block align (channel count * bytes per sample)
    view.setUint16(32, blockAlign, true);
    // bits per sample
    view.setUint16(34, bitDepth, true);
    // data chunk identifier
    this.writeString(view, 36, 'data');
    // data chunk length
    view.setUint32(40, dataSize, true);

    // Write the PCM samples
    const offset = 44;
    const channelData = [];
    for (let i = 0; i < numChannels; i++) {
      channelData.push(buffer.getChannelData(i));
    }

    let pos = 0;
    while (pos < buffer.length) {
      for (let i = 0; i < numChannels; i++) {
        const sample = Math.max(-1, Math.min(1, channelData[i][pos]));
        const value = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
        view.setInt16(offset + (pos * blockAlign) + (i * bytesPerSample), value, true);
      }
      pos++;
    }

    return arrayBuffer;
  }

  private writeString(view: DataView, offset: number, string: string): void {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  }
}

export const useMediaChunker = (chunkDuration: number = 10) => {
  const chunkerRef = useRef<MediaChunker | null>(null);
  
  const chunkFile = async (file: File): Promise<MediaChunk[]> => {
    if (!file.type.startsWith('audio/') && !file.type.startsWith('video/')) {
      throw new Error('Not a media file');
    }
    
    chunkerRef.current = new MediaChunker(file, chunkDuration);
    return chunkerRef.current.chunkMedia();
  };
  
  return { chunkFile };
};