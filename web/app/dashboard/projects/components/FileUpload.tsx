import { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, Pencil, Check, RefreshCw, Loader2 } from 'lucide-react';
import { FilePreviewDialog } from './FilePreviewDialog';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import SetQuickToken from '@/app/account/Actions/SetQuickToken';
import Cookies from 'js-cookie';

interface UploadedFile {
  id: string;
  file: File;
  progress: number;
  status: 'uploading' | 'completed' | 'error';
  error?: string;
  customName?: string;
  url?: string;
  retryCount?: number;
  chunks: {
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
  }[];
  chunkingProgress?: number;
  path?: string;
}

interface FileUploadProps {
  onFilesChange: (files: UploadedFile[]) => void;
  maxFiles?: number;
  maxSize?: number;
  autoUpload?: boolean;
  accept?: {
    [key: string]: string[];
  };
  onProcessing?: (isProcessing: boolean) => void;
}

export function FileUpload({
  onFilesChange,
  maxFiles = 15,
  maxSize = 1024 * 1024 * 1024,
  autoUpload = true,
  accept,
  onProcessing
}: FileUploadProps) {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [editingFileId, setEditingFileId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const uploadFile = async (file: File, existingFileId?: string) => {
    const fileId = existingFileId || crypto.randomUUID();
    
    if (!existingFileId) {
      setUploadedFiles(prev => [
        ...prev,
        {
          id: fileId,
          file,
          progress: 0,
          status: 'uploading',
          customName: file.name,
          chunks: [],
          chunkingProgress: 0
        }
      ]);
    } else {
      setUploadedFiles(prev =>
        prev.map(f =>
          f.id === fileId ? {
            ...f,
            status: 'uploading',
            progress: 0,
            error: undefined,
            retryCount: (f.retryCount || 0) + 1
          } : f
        )
      );
    }

    try {
      let q = await SetQuickToken(`file_token`)
      if(!q) {
        toast.error(`Failed to upload file.`)
        setUploadedFiles(prev =>
          prev.map(f =>
            f.id === fileId ? { ...f, status: 'error', error: 'Failed to upload file' } : f
          )
        );
        return;
      }
      let f = await fetch(`/api/upload`, {
        headers: new Headers({
          'Authorization': Cookies.get(`session`) || ''
        })
      })
      if(!f.ok) {
        toast.error(`Failed to complete your upload.`)
        setUploadedFiles(prev =>
          prev.map(f =>
            f.id === fileId ? { ...f, status: 'error', error: 'Failed to upload file' } : f
          )
        );
        return;
      }

      let d = await f.json()

      const formData = new FormData();
      formData.append('file', file);
      formData.append('fileName', file.name);
      formData.append('id', fileId);

      const response = await fetch('https://medzyaamara.com/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'Authorization': `${d?.token}`,
          'access-token': `${d?.uploadToken}`
        }
      });

      if (!response.ok) {
        throw new Error(`Upload failed with status ${response.status}`);
      }

      // Get the response data first
      const data = await response.json();

      // Update the file status and add URL
      setUploadedFiles(prevFiles => {
        const updatedFiles = prevFiles.map(f =>
          f.id === fileId ? {
            ...f,
            status: 'completed' as const,
            progress: 100,
            url: data.urls,
            path: data.path
          } : f
        );

        // Notify parent component of completed files
        onFilesChange(updatedFiles.filter(f => f.status === 'completed'));
        
        return updatedFiles;
      });

      toast.success(`Successfully uploaded ${file.name}`);
    } catch (error) {
      console.error('Error uploading file:', error);
      setUploadedFiles(prev =>
        prev.map(f =>
          f.id === fileId ? { ...f, status: 'error', error: 'Failed to upload file' } : f
        )
      );
      toast.error(`Failed to upload ${file.name}`);
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
      await uploadFile(file);
    }
    
    setIsProcessing(false);
  }, [maxFiles, maxSize, uploadedFiles, autoUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles,
    maxSize,
    disabled: isProcessing,
    accept
  });

  const removeFile = (id: string) => {
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

  const retryUpload = async (fileId: string) => {
    const fileToRetry = uploadedFiles.find(f => f.id === fileId);
    if (!fileToRetry) return;

    await uploadFile(fileToRetry.file, fileId);
  };

  useEffect(() => {
    onProcessing?.(isProcessing)
  }, [isProcessing])

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

      {
            isProcessing && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3, ease: "easeOut" }} className='text-blue-500 flex items-center gap-2'>
                <Loader2 className='w-4 h-4 animate-spin' />
                <p>
                  Please wait while we process your files.
                </p>
              </motion.div>

            )
      }

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
                      disabled={uploadedFile.status === 'uploading'}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </div>
                )}
                <div className="flex items-center text-xs text-muted-foreground gap-2">
                  <span>{(uploadedFile.file.size / 1024 / 1024).toFixed(2)} MB</span>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeFile(uploadedFile.id)}
                  disabled={uploadedFile.status === 'uploading'}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">
                  {uploadedFile.status === 'error' ? 'Failed' : 
                   uploadedFile.status === 'completed' ? 'Complete' : 
                   `${Math.round(uploadedFile.progress)}%`}
                </span>
              </div>
              <Progress value={uploadedFile.progress} />
            </div>
            
            {uploadedFile.status === 'error' && (
              <div className="flex items-center gap-2 text-destructive text-sm">
                <p>{uploadedFile.error}</p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => retryUpload(uploadedFile.id)}
                  className="text-primary hover:text-primary/80"
                >
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Retry
                </Button>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}