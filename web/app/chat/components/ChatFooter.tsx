"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Send, Plus, File as FileIcon, X, Image as ImageIcon, Video as VideoIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { FileUpload } from "./ChatComponents/FileUpload";
import { toast } from "sonner";

interface ChatFooterProps {
  onSendMessage: (message: string, attachments?: File[]) => void;
  onTyping?: (isTyping: boolean) => void;
}

export function ChatFooter({
  onSendMessage,
  onTyping,
}: ChatFooterProps) {
  const [message, setMessage] = useState("");
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showToolbar, setShowToolbar] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
      setIsExpanded(textarea.scrollHeight > 60);
    }
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [message]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() || attachments.length > 0) {
      onSendMessage(message, attachments);
      setMessage("");
      setAttachments([]);
      setShowToolbar(false);
    }
  };

  const handleFilesSelected = (files: File[]) => {
    const remainingSlots = 30 - attachments.length;
    if (remainingSlots <= 0) {
      toast.error("Maximum file limit reached (30 files)");
      return;
    }

    const MAX_FILE_SIZE = 200 * 1024 * 1024; // 200MB in bytes
    const validFiles = files.filter(file => {
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`File "${file.name}" exceeds the 200MB size limit`);
        return false;
      }
      return true;
    });

    const filesToAdd = validFiles.slice(0, remainingSlots);
    setAttachments((prev) => [...prev, ...filesToAdd]);
    
    if (files.length > remainingSlots) {
      alert(`Only ${remainingSlots} more file(s) can be added`);
    }
  };

  const handleRemoveFile = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const toggleToolbar = () => {
    setShowToolbar(!showToolbar);
  };

  return (
    <div className="border-t bg-gradient-to-b from-background to-background/80 backdrop-blur-sm p-4 sticky bottom-0">
      <AnimatePresence>
        {attachments.length > 0 && (
          <motion.div 
            className="flex flex-wrap gap-2 mb-3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
          >
            {attachments.map((file, index) => (
              <motion.div
                key={index}
                className="flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-3 py-1.5"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.15 }}
              >
                <span className="text-xs font-medium truncate max-w-[150px]">
                  {file.name}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4 rounded-full hover:bg-primary/20"
                  onClick={() => handleRemoveFile(index)}
                >
                  <X className="h-2.5 w-2.5" />
                </Button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSubmit} className="relative">
        <div className="flex items-end gap-2 relative z-10">
          <TooltipProvider>
            <div className="flex-1 flex gap-2 items-end">
              <AnimatePresence>
                {showToolbar && (
                  <motion.div 
                    className="absolute bottom-full mb-2 left-0 flex gap-1.5"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 rounded-full bg-background border-primary/20 hover:bg-primary/10 hover:text-primary"
                          onClick={() => {
                            const input = document.createElement('input');
                            input.type = 'file';
                            input.accept = 'image/*';
                            input.multiple = true;
                            input.onchange = (e) => {
                              const files = Array.from((e.target as HTMLInputElement).files || []);
                              handleFilesSelected(files);
                            };
                            input.click();
                          }}
                        >
                          <ImageIcon className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Images</TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 rounded-full bg-background border-primary/20 hover:bg-primary/10 hover:text-primary"
                          onClick={() => {
                            const input = document.createElement('input');
                            input.type = 'file';
                            input.accept = 'video/*';
                            input.multiple = true;
                            input.onchange = (e) => {
                              const files = Array.from((e.target as HTMLInputElement).files || []);
                              handleFilesSelected(files);
                            };
                            input.click();
                          }}
                        >
                          <VideoIcon className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Videos</TooltipContent>
                    </Tooltip>

                    <FileUpload
                      onFilesSelected={handleFilesSelected}
                      onRemoveFile={handleRemoveFile}
                      files={attachments}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className={cn(
                      "h-10 w-10 rounded-full hover:bg-primary/10 transition-colors",
                      showToolbar && "text-primary"
                    )}
                    onClick={toggleToolbar}
                  >
                    <Plus className={cn(
                      "h-5 w-5 transition-transform duration-200",
                      showToolbar && "rotate-45"
                    )} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Attachments</TooltipContent>
              </Tooltip>
              
              <div className="flex-1 relative">
                <Textarea
                  ref={textareaRef}
                  value={message}
                  onChange={(e) => {
                    setMessage(e.target.value);
                    onTyping?.(e.target.value.length > 0);
                  }}
                  placeholder="Type a message..."
                  className={cn(
                    "min-h-[40px] max-h-[200px] resize-none rounded-2xl pl-4 pr-12 py-3",
                    "border-muted bg-muted/30 focus-visible:ring-1 focus-visible:ring-primary",
                    "transition-all duration-200 overflow-hidden",
                    "text-sm placeholder:text-muted-foreground/70"
                  )}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmit(e);
                    }
                  }}
                  rows={1}
                />
                <AnimatePresence>
                  {message.trim() && (
                    <motion.div
                      className="absolute right-2 bottom-0 top-0 flex items-center"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Button 
                        type="submit" 
                        size="icon"
                        className="h-8 w-8 rounded-full bg-primary hover:bg-primary/90 transition-colors shadow-sm"
                      >
                        <Send className="h-4 w-4 text-primary-foreground" />
                      </Button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </TooltipProvider>
        </div>
        
        {/* Subtle background glow effect */}
        <div 
          className={cn(
            "absolute inset-0 bg-gradient-to-r from-primary/5 via-secondary/5 to-primary/5 rounded-2xl opacity-0 transition-opacity duration-500",
            (isExpanded || message.length > 0) && "opacity-100"
          )}
          style={{
            filter: "blur(8px)",
            zIndex: -1
          }}
        />
      </form>
    </div>
  );
}