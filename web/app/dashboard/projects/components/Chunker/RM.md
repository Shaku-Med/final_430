# I might need this. Writing this code took time. So I"m not gonna just waste it like that. DO NOT DELETE THIS FILE.

```javascript
import { useState, useCallback, useEffect, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, Pencil, Check } from 'lucide-react';
import { FilePreviewDialog } from './FilePreviewDialog';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { MediaChunker, MediaChunk } from './Chunker/FileChunker';

const MAX_CHUNK_SIZE = 200 * 1024;
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 1000; // 1 second

// Cross-browser compatibility checks
const isMobileDevice = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

const getOptimalChunkSize = (fileSize: number) => {
  if (isMobileDevice()) {
    // Smaller chunks for mobile devices
    return Math.min(50 * 1024, MAX_CHUNK_SIZE); // 50KB for mobile
  }
  return MAX_CHUNK_SIZE;
};

const getConcurrentUploadLimit = () => {
  if (isMobileDevice()) {
    return 2; // Limit concurrent uploads on mobile
  }
  return 4; // More concurrent uploads on desktop
};

interface FileChunk {
  id: string;
  blob: Blob;
  name: string;
  index: number;
  totalChunks: number;
  objectUrl: string;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  error?: string;
  path?: string;
  url?: string;
}

interface UploadedFile {
  id: string;
  file: File;
  progress: number;
  status: 'chunking' | 'uploading' | 'completed' | 'error';
  error?: string;
  customName?: string;
  chunks: FileChunk[];
  chunkingProgress?: number;
  path?: string;
  url?: string;
}

interface FileUploadProps {
  onFilesChange: (files: UploadedFile[]) => void;
  maxFiles?: number;
  maxSize?: number;
  autoUpload?: boolean;
}

export function FileUpload({
  onFilesChange,
  maxFiles = 15,
  maxSize = 1024 * 1024 * 1024,
  autoUpload = true
}: FileUploadProps) {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [editingFileId, setEditingFileId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const abortControllersRef = useRef<Map<string, AbortController>>(new Map());

  const chunkBinaryFile = async (file: File, chunkSize = getOptimalChunkSize(file.size)): Promise<FileChunk[]> => {
    const fileId = crypto.randomUUID();
    const chunks: FileChunk[] = [];
    let offset = 0;
    let index = 0;
    const totalSize = file.size;
    const totalChunks = Math.ceil(totalSize / chunkSize);
    
    while (offset < totalSize) {
      const end = Math.min(offset + chunkSize, totalSize);
      const slice = file.slice(offset, end);
      const chunkId = crypto.randomUUID();
      const objectUrl = URL.createObjectURL(slice);
      
      chunks.push({
        id: chunkId,
        blob: slice,
        name: `${file.name}.part${index + 1}`,
        index,
        totalChunks,
        objectUrl,
        progress: 0,
        status: 'pending'
      });
      
      const progress = Math.round(((index + 1) / totalChunks) * 100);
      setUploadedFiles(prev =>
        prev.map(f =>
          f.id === fileId ? { ...f, chunkingProgress: progress } : f
        )
      );
      
      offset += chunkSize;
      index++;
    }
    
    return chunks;
  };

  const processMediaFile = async (file: File): Promise<FileChunk[]> => {
    try {
      const mediaChunker = new MediaChunker(file);
      const mediaChunks = await mediaChunker.chunkMedia();
      
      return mediaChunks.map((chunk, index) => ({
        id: crypto.randomUUID(),
        blob: chunk.blob,
        name: `${file.name}.part${index + 1}`,
        index: chunk.index,
        totalChunks: mediaChunks.length,
        objectUrl: chunk.objectUrl,
        progress: 0,
        status: 'pending'
      }));
    } catch (error) {
      console.error('Error processing media file:', error);
      throw error;
    }
  };

  const processFile = async (file: File) => {
    const fileId = crypto.randomUUID();
    
    setUploadedFiles(prev => [
      ...prev,
      {
        id: fileId,
        file,
        progress: 0,
        status: 'chunking',
        chunkingProgress: 0,
        customName: file.name,
        chunks: []
      }
    ]);

    try {
      let chunks: FileChunk[] = [];
      
      if (file.type.startsWith('audio/') || file.type.startsWith('video/')) {
        console.log(`Processing media file: ${file.name}`);
        chunks = await processMediaFile(file);
      } else {
        console.log(`Processing binary file: ${file.name}`);
        chunks = await chunkBinaryFile(file);
      }
      
      setUploadedFiles(prev =>
        prev.map(f =>
          f.id === fileId ? {
            ...f,
            status: 'uploading',
            chunkingProgress: 100,
            chunks
          } : f
        )
      );

      // Upload chunks immediately after creation
      const concurrentLimit = getConcurrentUploadLimit();
      const totalChunks = chunks.length;
      let completedChunks = 0;

      // Function to handle chunk completion
      const onChunkComplete = (chunkId: string, chunkIndex: number, chunkUrl: string) => {
        completedChunks++;
        const progress = (completedChunks / totalChunks) * 100;
        
        setUploadedFiles(prev =>
          prev.map(f =>
            f.id === fileId ? {
              ...f,
              progress,
              chunks: f.chunks.map(c => 
                c.id === chunkId ? { ...c, status: 'completed', url: chunkUrl } : c
              )
            } : f
          )
        );

        // If all chunks are completed, log the information
        if (completedChunks === totalChunks) {
          const uploadedFile = uploadedFiles.find(f => f.id === fileId);
          if (uploadedFile) {
            console.log('File upload completed:', {
              fileName: uploadedFile.customName || uploadedFile.file.name,
              fileId,
              chunks: uploadedFile.chunks.map(c => ({
                id: c.id,
                index: c.index,
                url: c.url
              }))
            });
          }
        }
      };

      // Upload chunks with concurrency limit
      for (let i = 0; i < chunks.length; i += concurrentLimit) {
        const chunkBatch = chunks.slice(i, i + concurrentLimit);
        await Promise.all(
          chunkBatch.map(async (chunk: FileChunk) => {
            try {
              const formData = new FormData();
              formData.append('file', chunk.blob, chunk.name);
              formData.append('fileName', file.name);
              formData.append('fileId', fileId);
              formData.append('chunkId', chunk.id);
              formData.append('chunkIndex', chunk.index.toString());
              formData.append('totalChunks', chunks.length.toString());

              const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData
              });

              if (!response.ok) {
                throw new Error(`Upload failed for chunk ${chunk.index}`);
              }

              const data = await response.json();
              onChunkComplete(chunk.id, chunk.index, data.url);
            } catch (error) {
              console.error(`Error uploading chunk ${chunk.index}:`, error);
              setUploadedFiles(prev =>
                prev.map(f =>
                  f.id === fileId ? {
                    ...f,
                    chunks: f.chunks.map(c =>
                      c.id === chunk.id ? { ...c, status: 'error', error: 'Upload failed' } : c
                    )
                  } : f
                )
              );
            }
          })
        );
      }
    } catch (error) {
      console.error('Error processing file:', error);
      setUploadedFiles(prev =>
        prev.map(f =>
          f.id === fileId ? { ...f, status: 'error', error: 'Failed to process file' } : f
        )
      );
      toast.error(`Failed to process ${file.name}`);
    }
  };

  const calculateRetryDelay = (retryCount: number) => {
    return Math.min(INITIAL_RETRY_DELAY * Math.pow(2, retryCount), 30000); // Max 30 seconds
  };

  const verifyChunkIntegrity = async (chunk: Blob): Promise<string> => {
    const buffer = await chunk.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  const uploadChunk = async (fileId: string, chunkId: string, retryCount = 0) => {
    const file = uploadedFiles.find(f => f.id === fileId);
    if (!file) return;
    
    const chunkIndex = file.chunks.findIndex(c => c.id === chunkId);
    if (chunkIndex === -1) return;
    
    const chunk = file.chunks[chunkIndex];
    
    setUploadedFiles(prev =>
      prev.map(f =>
        f.id === fileId ? {
          ...f,
          chunks: f.chunks.map((c, i) =>
            i === chunkIndex ? { ...c, status: 'uploading' } : c
          )
        } : f
      )
    );
    
    try {
      const controller = new AbortController();
      abortControllersRef.current.set(chunkId, controller);

      // Calculate chunk hash for integrity verification
      const chunkHash = await verifyChunkIntegrity(chunk.blob);
      
      const formData = new FormData();
      formData.append('file', chunk.blob, chunk.name);
      formData.append('fileName', file.customName || file.file.name);
      formData.append('fileId', file.id);
      formData.append('chunkId', chunk.id);
      formData.append('chunkIndex', chunk.index.toString());
      formData.append('totalChunks', chunk.totalChunks.toString());
      formData.append('chunkHash', chunkHash);
      formData.append('isTemporary', 'true'); // Add temporary flag

      const xhr = new XMLHttpRequest();
      
      // Add timeout
      xhr.timeout = 30000; // 30 seconds timeout
      
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100);
          
          setUploadedFiles(prev =>
            prev.map(f =>
              f.id === fileId ? {
                ...f,
                chunks: f.chunks.map((c, i) =>
                  i === chunkIndex ? { ...c, progress } : c
                )
              } : f
            )
          );
          
          const updatedFile = uploadedFiles.find(f => f.id === fileId);
          if (updatedFile) {
            const totalProgress = updatedFile.chunks.reduce((sum, c, i) => {
              return sum + (i === chunkIndex ? progress : c.progress);
            }, 0) / updatedFile.chunks.length;
            
            setUploadedFiles(prev =>
              prev.map(f =>
                f.id === fileId ? { ...f, progress: totalProgress } : f
              )
            );
          }
        }
      });

      xhr.onload = async () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText);
            
            // Verify server-side hash matches
            if (response.chunkHash !== chunkHash) {
              throw new Error('Chunk integrity verification failed');
            }
            
            abortControllersRef.current.delete(chunkId);
            
            setUploadedFiles(prev =>
              prev.map(f =>
                f.id === fileId ? {
                  ...f,
                  chunks: f.chunks.map((c, i) =>
                    i === chunkIndex ? { 
                      ...c, 
                      status: 'completed', 
                      progress: 100,
                      path: response.path,
                      url: response.url
                    } : c
                  )
                } : f
              )
            );
            
            const updatedFile = uploadedFiles.find(f => f.id === fileId);
            if (updatedFile && updatedFile.chunks.every(c => c.status === 'completed')) {
              // All chunks uploaded, finalize the upload
              try {
                const finalizeResponse = await fetch('/api/finalize-upload', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify({
                    files: [{
                      path: updatedFile.chunks[0].path,
                      name: updatedFile.customName || updatedFile.file.name
                    }],
                    type: 'projects',
                    id: fileId
                  })
                });

                if (!finalizeResponse.ok) {
                  throw new Error('Failed to finalize upload');
                }

                const finalizeData = await finalizeResponse.json();
                
                setUploadedFiles(prev =>
                  prev.map(f =>
                    f.id === fileId ? { 
                      ...f, 
                      status: 'completed', 
                      progress: 100,
                      path: finalizeData.results[0].permanentPath,
                      url: finalizeData.results[0].url
                    } : f
                  )
                );
                
                onFilesChange(uploadedFiles.filter(f => f.status === 'completed'));
              } catch (error) {
                console.error('Error finalizing upload:', error);
                toast.error('Failed to finalize upload');
              }
            }
          } catch (error) {
            throw new Error('Failed to verify chunk integrity');
          }
        } else {
          throw new Error(`Upload failed with status ${xhr.status}`);
        }
      };

      xhr.onerror = () => {
        abortControllersRef.current.delete(chunkId);
        
        if (retryCount < MAX_RETRIES) {
          const delay = calculateRetryDelay(retryCount);
          toast.error(`Retrying chunk ${chunk.index + 1} in ${delay/1000} seconds...`);
          
          setTimeout(() => {
            uploadChunk(fileId, chunkId, retryCount + 1);
          }, delay);
        } else {
          setUploadedFiles(prev =>
            prev.map(f =>
              f.id === fileId ? {
                ...f,
                chunks: f.chunks.map((c, i) =>
                  i === chunkIndex ? { ...c, status: 'error', error: 'Upload failed after retries' } : c
                )
              } : f
            )
          );
          toast.error(`Failed to upload chunk ${chunk.index + 1} of ${file.file.name} after ${MAX_RETRIES} retries`);
        }
      };

      xhr.ontimeout = () => {
        abortControllersRef.current.delete(chunkId);
        
        if (retryCount < MAX_RETRIES) {
          const delay = calculateRetryDelay(retryCount);
          toast.error(`Upload timeout. Retrying chunk ${chunk.index + 1} in ${delay/1000} seconds...`);
          
          setTimeout(() => {
            uploadChunk(fileId, chunkId, retryCount + 1);
          }, delay);
        } else {
          setUploadedFiles(prev =>
            prev.map(f =>
              f.id === fileId ? {
                ...f,
                chunks: f.chunks.map((c, i) =>
                  i === chunkIndex ? { ...c, status: 'error', error: 'Upload timeout after retries' } : c
                )
              } : f
            )
          );
          toast.error(`Upload timeout for chunk ${chunk.index + 1} of ${file.file.name} after ${MAX_RETRIES} retries`);
        }
      };

      xhr.open('POST', '/api/upload');
      
      xhr.addEventListener('abort', () => {
        abortControllersRef.current.delete(chunkId);
        
        setUploadedFiles(prev =>
          prev.map(f =>
            f.id === fileId ? {
              ...f,
              chunks: f.chunks.map((c, i) =>
                i === chunkIndex ? { ...c, status: 'pending', progress: 0 } : c
              )
            } : f
          )
        );
      });
      
      xhr.send(formData);
    } catch (error) {
      abortControllersRef.current.delete(chunkId);
      
      if (retryCount < MAX_RETRIES) {
        const delay = calculateRetryDelay(retryCount);
        toast.error(`Error uploading chunk ${chunk.index + 1}. Retrying in ${delay/1000} seconds...`);
        
        setTimeout(() => {
          uploadChunk(fileId, chunkId, retryCount + 1);
        }, delay);
      } else {
        setUploadedFiles(prev =>
          prev.map(f =>
            f.id === fileId ? {
              ...f,
              chunks: f.chunks.map((c, i) =>
                i === chunkIndex ? { ...c, status: 'error', error: 'Upload failed after retries' } : c
              )
            } : f
          )
        );
        toast.error(`Failed to upload chunk ${chunk.index + 1} of ${file.file.name} after ${MAX_RETRIES} retries`);
      }
    }
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const validFiles = acceptedFiles.filter(file => {
      if (file.size > maxSize) {
        toast.error(`File ${file.name} exceeds the size limit`);
        return false;
      }
      return true;
    });

    if (uploadedFiles.length + validFiles.length > maxFiles) {
      toast.error(`Maximum ${maxFiles} files allowed`);
      return;
    }

    setIsProcessing(true);
    
    for (const file of validFiles) {
      await processFile(file);
    }
    
    setIsProcessing(false);
  }, [maxFiles, maxSize, uploadedFiles, autoUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles,
    maxSize,
    disabled: isProcessing
  });

  const removeFile = (id: string) => {
    const file = uploadedFiles.find(f => f.id === id);
    if (file) {
      file.chunks.forEach(chunk => {
        if (chunk.objectUrl) {
          URL.revokeObjectURL(chunk.objectUrl);
        }
        
        if (chunk.status === 'uploading') {
          const controller = abortControllersRef.current.get(chunk.id);
          if (controller) {
            controller.abort();
            abortControllersRef.current.delete(chunk.id);
          }
        }
      });
    }
    
    setUploadedFiles(prev => prev.filter(file => file.id !== id));
    onFilesChange(uploadedFiles.filter(f => f.id !== id && f.status === 'completed'));
  };

  const startEditing = (file: UploadedFile) => {
    setEditingFileId(file.id);
    setEditName(file.customName || file.file.name);
  };

  const saveEdit = (id: string) => {
    setUploadedFiles(prev =>
      prev.map(f =>
        f.id === id ? { ...f, customName: editName } : f
      )
    );
    setEditingFileId(null);
  };

  const cancelEdit = () => {
    setEditingFileId(null);
  };

  const uploadAllChunks = (fileId: string) => {
    const file = uploadedFiles.find(f => f.id === fileId);
    if (!file) return;
    
    const pendingChunks = file.chunks.filter(chunk => chunk.status === 'pending');
    const concurrentLimit = getConcurrentUploadLimit();
    
    // Upload chunks with concurrency limit
    for (let i = 0; i < pendingChunks.length; i += concurrentLimit) {
      const chunkBatch = pendingChunks.slice(i, i + concurrentLimit);
      chunkBatch.forEach(chunk => uploadChunk(fileId, chunk.id));
    }
  };

  const retryChunk = (fileId: string, chunkId: string) => {
    uploadChunk(fileId, chunkId);
  };

  const retryAllFailedChunks = (fileId: string) => {
    const file = uploadedFiles.find(f => f.id === fileId);
    if (!file) return;
    
    file.chunks
      .filter(chunk => chunk.status === 'error')
      .forEach(chunk => uploadChunk(fileId, chunk.id));
  };

  useEffect(() => {
    return () => {
      uploadedFiles.forEach(file => {
        file.chunks.forEach(chunk => {
          if (chunk.objectUrl) {
            URL.revokeObjectURL(chunk.objectUrl);
          }
        });
      });
      
      abortControllersRef.current.forEach(controller => {
        controller.abort();
      });
      abortControllersRef.current.clear();
    };
  }, []);

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary'
        } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <input {...getInputProps()} />
        <p className="text-sm text-muted-foreground">
          {isProcessing
            ? 'Processing files...'
            : isDragActive
              ? 'Drop the files here'
              : 'Drag & drop files here, or click to select files'}
        </p>
      </div>

      <div className="">
        {uploadedFiles.map((uploadedFile, key) => (
          <motion.div
            key={uploadedFile.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className={`space-y-2 px-4 py-3 overflow-hidden hover:bg-muted/50 ${key < 1 ? uploadedFiles.length === 1 ? ` rounded-lg` : ` rounded-t-lg` : key === uploadedFiles.length - 1 ? ` rounded-b-lg` : ``} border`}
          >
            <div className="flex items-center gap-2">
              <FilePreviewDialog
                file={uploadedFile.file}
                onRemove={() => removeFile(uploadedFile.id)}
              />
              <div className="flex-1">
                {editingFileId === uploadedFile.id ? (
                  <div className="flex items-center gap-2">
                    <Input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="h-8"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          saveEdit(uploadedFile.id);
                        } else if (e.key === 'Escape') {
                          cancelEdit();
                        }
                      }}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => saveEdit(uploadedFile.id)}
                      className="text-green-500 hover:text-green-600"
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">{uploadedFile.customName || uploadedFile.file.name}</p>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => startEditing(uploadedFile)}
                      disabled={uploadedFile.status === 'chunking' || uploadedFile.status === 'uploading'}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </div>
                )}
                <div className="flex items-center text-xs text-muted-foreground gap-2">
                  <span>{(uploadedFile.file.size / 1024 / 1024).toFixed(2)} MB</span>
                  {uploadedFile.chunks.length > 0 && (
                    <span>({uploadedFile.chunks.length} chunks)</span>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {!autoUpload && uploadedFile.status !== 'completed' && uploadedFile.chunks.some(c => c.status === 'pending') && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => uploadAllChunks(uploadedFile.id)}
                    disabled={uploadedFile.status === 'chunking'}
                  >
                    Upload
                  </Button>
                )}
                
                {uploadedFile.chunks.some(c => c.status === 'error') && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => retryAllFailedChunks(uploadedFile.id)}
                    className="text-amber-500 border-amber-500 hover:bg-amber-50"
                  >
                    Retry Failed
                  </Button>
                )}
                
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeFile(uploadedFile.id)}
                  disabled={uploadedFile.status === 'chunking'}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="space-y-1">
              {uploadedFile.status === 'chunking' && (
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Chunking: {uploadedFile.chunkingProgress}%</span>
                  </div>
                  <Progress value={uploadedFile.chunkingProgress} />
                </div>
              )}
              
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">
                    {uploadedFile.status === 'chunking' ? 'Processing' : 
                     uploadedFile.status === 'error' ? 'Failed' : 
                     uploadedFile.status === 'completed' ? 'Complete' : 
                     `${Math.round(uploadedFile.progress)}%`}
                  </span>
                  <span className="text-muted-foreground">
                    {uploadedFile.chunks.filter(c => c.status === 'completed').length}/{uploadedFile.chunks.length} chunks
                  </span>
                </div>
                <Progress value={uploadedFile.progress} />
              </div>
            </div>
            
            {uploadedFile.status === 'error' && (
              <div className="flex items-center gap-2 text-destructive text-sm">
                <p>{uploadedFile.error}</p>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
```