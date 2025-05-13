import { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { File } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogOverlay,
} from "@/components/ui/dialog";

interface FileUploadProps {
  onFilesSelected: (files: File[]) => void;
  onRemoveFile: (index: number) => void;
  files: File[];
}

export function FileUpload({ onFilesSelected, onRemoveFile, files }: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    onFilesSelected(selectedFiles);
    setIsOpen(false);
  };

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="h-8 w-8 rounded-full bg-background border-primary/20 hover:bg-primary/10 hover:text-primary"
        onClick={() => setIsOpen(true)}
      >
        <File className="h-4 w-4" />
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogOverlay className="bg-black/50 backdrop-blur-sm" />
        <DialogContent className="sm:max-w-[425px]">
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => fileInputRef.current?.click()}
              >
                Select Files
              </Button>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                multiple
                onChange={handleFileSelect}
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
} 