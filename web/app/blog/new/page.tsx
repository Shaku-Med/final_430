'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import dynamic from 'next/dynamic';
import { FileUpload } from '@/app/dashboard/projects/components/FileUpload';
import Logo from '@/app/Home/Icons/Logo';
import { X } from 'lucide-react';

const MDEditor = dynamic(() => import('@uiw/react-md-editor'), { 
  ssr: false,
  loading: () => <div className="h-[200px] w-full animate-pulse bg-muted rounded-md" />
});

interface UploadedFile {
  id: string;
  file: File;
  progress: number;
  status: 'uploading' | 'completed' | 'error';
  error?: string;
  customName?: string;
  url?: string;
  path?: string;
}

const isValidUrl = (urlString: string): boolean => {
  try {
    // Remove all spaces from the URL
    const cleanUrl = urlString.replace(/\s+/g, '');
    // Add https:// if no protocol is specified
    const urlToCheck = cleanUrl.startsWith('http') ? cleanUrl : `https://${cleanUrl}`;
    const url = new URL(urlToCheck);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
};

const formatUrl = (urlString: string): string => {
  // Remove all spaces from the URL
  const cleanUrl = urlString.replace(/\s+/g, '');
  // Add https:// if no protocol is specified
  return cleanUrl.startsWith('http') ? cleanUrl : `https://${cleanUrl}`;
};

const CreateBlogPage = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    information: '',
  });
  const [slugInput, setSlugInput] = useState('');
  const [slugs, setSlugs] = useState<string[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [urlError, setUrlError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddSlug = () => {
    setUrlError('');
    const trimmedUrl = slugInput.trim();
    
    if (!trimmedUrl) {
      setUrlError('Please enter a URL');
      return;
    }

    // Remove all spaces from the URL before validation
    const cleanUrl = trimmedUrl.replace(/\s+/g, '');

    if (!isValidUrl(cleanUrl)) {
      setUrlError('Please enter a valid URL (e.g., example.com or https://example.com)');
      return;
    }

    const formattedUrl = formatUrl(cleanUrl);
    
    if (slugs.includes(formattedUrl)) {
      setUrlError('This research URL already exists');
      return;
    }

    setSlugs(prev => [...prev, formattedUrl]);
    setSlugInput('');
  };

  const handleRemoveSlug = (slugToRemove: string) => {
    setSlugs(prev => prev.filter(slug => slug !== slugToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddSlug();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.title.trim()) {
      toast.error('Please enter a title');
      return;
    }
    if (!formData.excerpt.trim()) {
      toast.error('Please enter an excerpt');
      return;
    }
    if (!formData.information.trim()) {
      toast.error('Please enter content');
      return;
    }

    setLoading(true);

    try {
        console.log(uploadedFiles)
      const response = await fetch('/api/blogs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          slugs: slugs.length > 0 ? slugs : undefined,
          imageUrl: uploadedFiles[0]?.url || undefined,

          created_at: new Date().toISOString(),
          date: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create blog');
      }

      toast.success('Blog post created successfully!');
      router.push('/blog');
      router.refresh();
    } catch (error) {
      console.error('Error creating blog:', error);
      toast.error('Failed to create blog post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="max-w-4xl w-full mb-8 text-center">
        <div className="flex flex-col items-center gap-4">
          <Logo svgClassName="w-[200px] h-[200px]" pathClassName="fill-foreground"/>
          <h1 className="text-4xl font-bold">Create a New Blog Post</h1>
        </div>
      </div>

      <Card className="w-full max-w-4xl">
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Title <span className="text-destructive">*</span></Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                placeholder="Enter blog title"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="excerpt">Excerpt <span className="text-destructive">*</span></Label>
              <Textarea
                id="excerpt"
                name="excerpt"
                value={formData.excerpt}
                onChange={handleChange}
                required
                placeholder="Enter a brief excerpt"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="information">Content <span className="text-destructive">*</span></Label>
              <div data-color-mode="system" className="[&_.w-md-editor]:bg-background [&_.w-md-editor]:text-foreground [&_.w-md-editor-toolbar]:bg-muted [&_.w-md-editor-toolbar]:border-border">
                <MDEditor
                  value={formData.information}
                  onChange={(value) => setFormData(prev => ({ ...prev, information: value || '' }))}
                  height={400}
                  preview="edit"
                  fullscreen={false}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Blog Poster (Optional)</Label>
              <FileUpload
                onFilesChange={setUploadedFiles}
                maxFiles={1}
                accept={{
                  'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp']
                }}
              />
            </div>

            <div className="space-y-2">
              <Label>Research URLs (Optional)</Label>
              <div className="flex flex-col gap-2">
                <div className="flex gap-2">
                  <Input
                    type="text"
                    value={slugInput}
                    onChange={(e) => {
                      setSlugInput(e.target.value);
                      setUrlError('');
                    }}
                    onKeyDown={handleKeyDown}
                    placeholder="Enter research URL (e.g., example.com or https://example.com)"
                    className={urlError ? "border-destructive" : ""}
                  />
                  <Button 
                    type="button" 
                    onClick={handleAddSlug}
                    variant="secondary"
                  >
                    Add
                  </Button>
                </div>
                {urlError && (
                  <p className="text-sm text-destructive">{urlError}</p>
                )}
                <div className="flex flex-wrap gap-2 mt-2">
                  {slugs.map((slug) => (
                    <Badge 
                      key={slug} 
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      {slug}
                      <button
                        type="button"
                        onClick={() => handleRemoveSlug(slug)}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Creating...' : 'Create Blog Post'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateBlogPage;
