import React, { useState, useEffect, useRef, JSX } from 'react';
import Hls from 'hls.js';
import type { LoaderContext, LoaderConfiguration, LoaderCallbacks, HlsConfig } from 'hls.js';

interface Attachment {
  id: string;
  url: string;
  file: {
    path: string;
    relativePath: string;
  };
  chunks: any[];
  status: string;
  progress: number;
  customName: string;
  chunkingProgress: number;
}

interface FileTypeIcons {
  [key: string]: JSX.Element;
}

interface FileTypeCategories {
  image: string[];
  audio: string[];
  video: string[];
  document: string[];
  spreadsheet: string[];
  compressed: string[];
}

const Attachments = ({ attachments }: { attachments: Attachment[] }) => {
  const [activeMedia, setActiveMedia] = useState<string | null>(null);
  const videoRefs = useRef<{ [key: string]: HTMLVideoElement | null }>({});
  const audioRefs = useRef<{ [key: string]: HTMLAudioElement | null }>({});
  const hlsInstances = useRef<{ [key: string]: Hls }>({});

  const extractUrl = (urlString: string, forApi: boolean = false): string => {
    try {
      let url = "";
      if (urlString.startsWith('[[')) {
        const parsed = JSON.parse(urlString);
        url = parsed[1][0]; // Use the m3u8 URL for HLS streaming
      } else {
        const parsed = JSON.parse(urlString);
        url = parsed[0];
      }
      
      return forApi ? `/api/load/?url=${encodeURIComponent(url)}` : url;
    } catch (e) {
      return "";
    }
  };

  const getFileExtension = (path: string): string => {
    return path.split('.').pop()?.toLowerCase() || '';
  };

  const toggleMedia = (id: string, type: 'audio' | 'video'): void => {
    if (activeMedia === id) {
      if (type === 'video' && videoRefs.current[id]) {
        videoRefs.current[id]?.pause();
      } else if (type === 'audio' && audioRefs.current[id]) {
        audioRefs.current[id]?.pause();
      }
      setActiveMedia(null);
    } else {
      if (type === 'video' && videoRefs.current[id]) {
        videoRefs.current[id]?.play();
      } else if (type === 'audio' && audioRefs.current[id]) {
        audioRefs.current[id]?.play();
      }
      setActiveMedia(id);
    }
  };

  const fileTypeCategories: FileTypeCategories = {
    image: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'tiff'],
    audio: ['mp3', 'wav', 'ogg', 'm4a', 'flac', 'aac'],
    video: ['mp4', 'avi', 'mov', 'wmv', 'flv', 'mkv', 'webm', 'ts'],
    document: ['pdf', 'doc', 'docx', 'txt', 'rtf', 'ppt', 'pptx'],
    spreadsheet: ['xls', 'xlsx', 'csv'],
    compressed: ['zip', 'rar', 'tar', 'gz', '7z']
  };

  const getFileType = (fileExt: string): string => {
    for (const [category, extensions] of Object.entries(fileTypeCategories)) {
      if (extensions.includes(fileExt)) {
        return category;
      }
    }
    return 'other';
  };

  const iconTypes: FileTypeIcons = {
    document: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
        <polyline points="14 2 14 8 20 8"></polyline>
        <line x1="16" y1="13" x2="8" y2="13"></line>
        <line x1="16" y1="17" x2="8" y2="17"></line>
        <polyline points="10 9 9 9 8 9"></polyline>
      </svg>
    ),
    image: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-500">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
        <circle cx="8.5" cy="8.5" r="1.5"></circle>
        <polyline points="21 15 16 10 5 21"></polyline>
      </svg>
    ),
    audio: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500">
        <path d="M9 18V5l12-2v13"></path>
        <circle cx="6" cy="18" r="3"></circle>
        <circle cx="18" cy="16" r="3"></circle>
      </svg>
    ),
    video: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500">
        <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"></rect>
        <line x1="7" y1="2" x2="7" y2="22"></line>
        <line x1="17" y1="2" x2="17" y2="22"></line>
        <line x1="2" y1="12" x2="22" y2="12"></line>
        <line x1="2" y1="7" x2="7" y2="7"></line>
        <line x1="2" y1="17" x2="7" y2="17"></line>
        <line x1="17" y1="17" x2="22" y2="17"></line>
        <line x1="17" y1="7" x2="22" y2="7"></line>
      </svg>
    ),
    spreadsheet: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
        <line x1="3" y1="9" x2="21" y2="9"></line>
        <line x1="3" y1="15" x2="21" y2="15"></line>
        <line x1="9" y1="3" x2="9" y2="21"></line>
        <line x1="15" y1="3" x2="15" y2="21"></line>
      </svg>
    ),
    compressed: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-yellow-500">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
        <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
        <line x1="12" y1="22.08" x2="12" y2="12"></line>
      </svg>
    ),
    other: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500">
        <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
        <polyline points="13 2 13 9 20 9"></polyline>
      </svg>
    )
  };

  // Cleanup function to destroy HLS instances
  useEffect(() => {
    return () => {
      // Cleanup HLS instances on component unmount
      Object.values(hlsInstances.current).forEach(hls => {
        hls.destroy();
      });
    };
  }, []);

  useEffect(() => {
    attachments.forEach(attachment => {
      const fileExt = getFileExtension(attachment.file.path);
      const fileType = getFileType(fileExt);
      
      if (fileType === 'video' || fileType === 'audio') {
        const baseUrl = extractUrl(attachment.url, false); // Original URL without API
        const manifestUrl = extractUrl(attachment.url, true); // API route for manifest
        const element = fileType === 'video' ? 
          videoRefs.current[attachment.id] : 
          audioRefs.current[attachment.id];
        
        if (element && manifestUrl && Hls.isSupported()) {
          // Destroy previous HLS instance if it exists
          if (hlsInstances.current[attachment.id]) {
            hlsInstances.current[attachment.id].destroy();
          }
          
          const hls = new Hls({
            // Custom loader function to route all segment requests through our API
            loader: class CustomLoader extends Hls.DefaultConfig.loader {
              constructor(config: HlsConfig) {
                super(config);
                const load = this.load.bind(this);
                this.load = function(context: LoaderContext & { type: string }, config: LoaderConfiguration, callbacks: LoaderCallbacks<LoaderContext>) {
                  // Check if this is a segment URL (not the manifest)
                  if (context.type === 'fragment' || context.type === 'key') {
                    // Original URL from HLS.js
                    const originalUrl = context.url;
                    
                    // Route through our API
                    context.url = `/api/load/?url=${encodeURIComponent(originalUrl)}`;
                  }
                  
                  // Call the original loader with our modified context
                  load(context, config, callbacks);
                };
              }
            }
          });
          
          // Store the HLS instance for later cleanup
          hlsInstances.current[attachment.id] = hls;
          
          hls.loadSource(manifestUrl);
          hls.attachMedia(element);
          hls.on(Hls.Events.MANIFEST_PARSED, () => {
            if (activeMedia === attachment.id) {
              element.play().catch(error => {
                console.error("Playback failed:", error);
              });
            }
          });
          
          // Error handling
          hls.on(Hls.Events.ERROR, (event, data) => {
            if (data.fatal) {
              console.error('Fatal HLS error:', data);
              switch(data.type) {
                case Hls.ErrorTypes.NETWORK_ERROR:
                  // Try to recover network error
                  console.log('Network error, trying to recover...');
                  hls.startLoad();
                  break;
                case Hls.ErrorTypes.MEDIA_ERROR:
                  console.log('Media error, trying to recover...');
                  hls.recoverMediaError();
                  break;
                default:
                  // Cannot recover
                  hls.destroy();
                  break;
              }
            }
          });
        }
      }
    });
  }, [attachments, activeMedia]);

  const renderAttachment = (attachment: Attachment) => {
    const { id, url, file, customName } = attachment;
    const fileUrl = extractUrl(url);
    const apiUrl = extractUrl(url, true);
    const fileExt = getFileExtension(file.path);
    const fileType = getFileType(fileExt);
    
    return (
      <div key={id} className="mb-4 border rounded-lg overflow-hidden shadow-sm">
        <div className="bg-gray-100 px-4 py-2 border-b flex justify-between items-center">
          <h3 className="font-medium text-gray-800 truncate">{customName}</h3>
          <a 
            href={fileUrl} 
            download={customName}
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-blue-500 hover:text-blue-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
          </a>
        </div>
        
        <div className="p-4">
          {fileType === 'image' && (
            <img 
              src={apiUrl} // Use API URL for images too to avoid CORS
              alt={customName}
              className="max-w-full h-auto rounded mx-auto"
              style={{ maxHeight: '300px' }}
            />
          )}
          
          {fileType === 'audio' && (
            <div className="flex items-center">
              <button
                onClick={() => toggleMedia(id, 'audio')}
                className="bg-blue-500 hover:bg-blue-600 text-white rounded-full w-10 h-10 flex items-center justify-center mr-3"
              >
                {activeMedia === id ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="6" y="4" width="4" height="16"></rect>
                    <rect x="14" y="4" width="4" height="16"></rect>
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="5 3 19 12 5 21 5 3"></polygon>
                  </svg>
                )}
              </button>
              <div className="flex-1">
                <div className="h-2 bg-gray-200 rounded-full">
                  <div className="h-2 bg-blue-500 rounded-full" style={{ width: activeMedia === id ? '45%' : '0%' }}></div>
                </div>
              </div>
              <audio 
                ref={el => { audioRefs.current[id] = el; }}
                className="hidden" 
                controls 
              />
            </div>
          )}
          
          {fileType === 'video' && (
            <div className="video-container">
              <video 
                ref={el => { videoRefs.current[id] = el; }}
                className="max-w-full h-auto rounded mx-auto" 
                style={{ maxHeight: '300px' }}
                controls
                playsInline
              />
              <button
                onClick={() => toggleMedia(id, 'video')}
                className="mt-2 bg-blue-500 hover:bg-blue-600 text-white rounded px-4 py-1 flex items-center"
              >
                {activeMedia === id ? 'Pause' : 'Play'}
              </button>
            </div>
          )}
          
          <div className="flex items-center mt-2">
            {iconTypes[fileType] || iconTypes.other}
            <div className="ml-3">
              <span className="block text-sm font-medium text-gray-900">{customName}</span>
              <span className="block text-xs text-gray-500">{fileExt.toUpperCase()} {fileType.toUpperCase()}</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (!attachments || attachments.length === 0) {
    return <div className="p-4 text-gray-500">No attachments available</div>;
  }

  return (
    <div className="attachments-container">
      <h2 className="text-lg font-semibold mb-4">Attachments ({attachments.length})</h2>
      {attachments.map(renderAttachment)}
    </div>
  );
};

export default Attachments;