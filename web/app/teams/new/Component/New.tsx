'use client'
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';
import dynamic from 'next/dynamic';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import { FileUpload } from '@/app/dashboard/projects/components/FileUpload';

const MDEditor = dynamic(() => import('@uiw/react-md-editor'), { ssr: false });

interface TeamMember {
  id: string;
  name: string;
  role: string;
  description: string;
  expertise: string[];
  information: string;
  user_id: string;
  attachments: any[];
  socialLinks: { platform: string; url: string }[];
}

const suggestedRoles = [
  "Software Engineer",
  "Frontend Developer",
  "Backend Developer",
  "Full Stack Developer",
  "DevOps Engineer",
  "UI/UX Designer",
  "Product Manager",
  "Project Manager",
  "QA Engineer",
  "Data Scientist",
  "Machine Learning Engineer",
  "System Administrator",
  "Technical Lead",
  "Architect",
  "Mobile Developer"
];

const New = ({id, isEdit, editData}: {id?: string, isEdit?: boolean, editData?: TeamMember}) => {
  const router = useRouter();
  const [formData, setFormData] = useState<TeamMember>({
    id: isEdit && editData ? editData.id : uuidv4(),
    name: isEdit && editData ? editData.name : '',
    role: isEdit && editData ? editData.role : '',
    description: isEdit && editData ? editData.description : '',
    expertise: isEdit && editData ? editData.expertise : [],
    information: isEdit && editData ? editData.information : '',
    user_id: isEdit && editData ? editData.user_id : '', // This should be set based on the logged-in user
    attachments: [],
    socialLinks: isEdit && editData ? editData.socialLinks : [],
  });

  const [expertiseInput, setExpertiseInput] = useState('');
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const [wordCount, setWordCount] = useState(0);
  const [isloading, setisloading] = useState(false);
  const [newSocialLink, setNewSocialLink] = useState({ platform: '', url: '' });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === 'description') {
      const words = value.trim().split(/\s+/).filter(word => word.length > 0);
      const count = words.length;
      
      if (count <= 500) {
        setWordCount(count);
        setFormData(prev => ({
          ...prev,
          [name]: value
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleAddExpertise = () => {
    if (expertiseInput.trim()) {
      const newExpertise = expertiseInput
        .split(',')
        .map(item => item.trim())
        .filter(item => item && !formData.expertise.includes(item));
      
      if (newExpertise.length > 0) {
        setFormData(prev => ({
          ...prev,
          expertise: [...prev.expertise, ...newExpertise]
        }));
        setExpertiseInput('');
      }
    }
  };

  const handleRemoveExpertise = (index: number) => {
    setFormData(prev => ({
      ...prev,
      expertise: prev.expertise.filter((_, i) => i !== index)
    }));
  };

  const handleFilesChange = (files: any[]) => {
    setFormData(prev => ({
      ...prev,
      attachments: files
    }));
  };

  const handleAddSocialLink = () => {
    if (newSocialLink.platform.trim() && newSocialLink.url.trim()) {
      setFormData(prev => ({
        ...prev,
        socialLinks: [...prev.socialLinks, { ...newSocialLink }]
      }));
      setNewSocialLink({ platform: '', url: '' });
    }
  };

  const handleRemoveSocialLink = (index: number) => {
    setFormData(prev => ({
      ...prev,
      socialLinks: prev.socialLinks.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all required fields
    if (!formData.name.trim()) {
      alert('Please enter a name');
      return;
    }

    if (!formData.role.trim()) {
      alert('Please select a role');
      return;
    }
    
    // Validate word count for description
    const words = formData.description.trim().split(/\s+/).filter(word => word.length > 0);
    if (words.length < 10) {
      alert('Description must be at least 10 words long');
      return;
    }
    if (words.length > 500) {
      alert('Description cannot exceed 500 words');
      return;
    }

    // Validate expertise
    if (formData.expertise.length === 0) {
      alert('Please add at least one expertise');
      return;
    }
    
    try {
      const response = await fetch(`/api/team/new${isEdit ? `/edit` : ''}`, {
        method: isEdit ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          name: formData.name.trim(),
          role: formData.role.trim(),
          description: formData.description.trim(),
          information: formData.information.trim(),
          attachments: formData.attachments,
          user_id: id,
          socialLinks: formData.socialLinks
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create team member');
      }

      const data = await response.json();
      router.push('/teams');
    } catch (error) {
      console.error('Error creating team member:', error);
      alert(error instanceof Error ? error.message : 'Failed to create team member. Please try again.');
    }
  };

  const handleRoleSelect = (currentValue: string) => {
    setFormData(prev => ({ ...prev, role: currentValue }));
    setOpen(false);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <Card>
        <CardHeader>
          <CardTitle>Join Our Team</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  type="text"
                  name="name"
                  id="name"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label>Role</Label>
                <Popover open={open} onOpenChange={setOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={open}
                      className="w-full justify-between"
                    >
                      {formData.role || "Select role..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0">
                    <Command>
                      <CommandInput 
                        placeholder="Search role..." 
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && e.currentTarget.value) {
                            e.preventDefault();
                            handleRoleSelect(e.currentTarget.value);
                          }
                        }}
                      />
                      <CommandEmpty>
                        <div className="p-2">
                          <p className="text-sm text-muted-foreground mb-2">No role found. Press Enter to add:</p>
                          <Button
                            variant="secondary"
                            className="w-full justify-start"
                            onClick={() => {
                              const input = document.querySelector('input[cmdk-input]') as HTMLInputElement;
                              if (input?.value) {
                                handleRoleSelect(input.value);
                              }
                            }}
                          >
                            Add "{value}"
                          </Button>
                        </div>
                      </CommandEmpty>
                      <CommandGroup>
                        {suggestedRoles.map((role) => (
                          <CommandItem
                            key={role}
                            value={role}
                            onSelect={handleRoleSelect}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                formData.role === role ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {role}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="description">Description</Label>
                <span className={cn(
                  "text-sm",
                  wordCount < 10 ? "text-destructive" : 
                  wordCount > 500 ? "text-destructive" : 
                  "text-muted-foreground"
                )}>
                  {wordCount}/500 words
                </span>
              </div>
              <Textarea
                name="description"
                id="description"
                required
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Enter a description (minimum 10 words, maximum 500 words)"
                className="min-h-[150px]"
              />
              {wordCount < 10 && (
                <p className="text-sm text-destructive">
                  Description must be at least 10 words long
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Expertise</Label>
              <div className="flex gap-2">
                <Input
                  type="text"
                  value={expertiseInput}
                  onChange={(e) => setExpertiseInput(e.target.value)}
                  placeholder="Add expertise (comma-separated)"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddExpertise();
                    }
                  }}
                />
                <Button
                  type="button"
                  onClick={handleAddExpertise}
                  variant="secondary"
                >
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.expertise.map((exp, index) => (
                  <div
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-secondary text-secondary-foreground"
                  >
                    {exp}
                    <button
                      type="button"
                      onClick={() => handleRemoveExpertise(index)}
                      className="ml-2 hover:text-destructive"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="information">Additional Information</Label>
              <div data-color-mode="system" className="[&_.w-md-editor]:bg-background [&_.w-md-editor]:text-foreground [&_.w-md-editor-toolbar]:bg-muted [&_.w-md-editor-toolbar]:border-border">
                <MDEditor
                  value={formData.information}
                  onChange={(value) => setFormData(prev => ({ ...prev, information: value || '' }))}
                  height={200}
                  preview="edit"
                  fullscreen={false}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Attachments</Label>
              <FileUpload
                onFilesChange={handleFilesChange}
                maxFiles={20}
                maxSize={50 * 1024 * 1024} // 50MB per file
                onProcessing={setisloading}
              />
            </div>

            <div className="space-y-2">
              <Label>Social Links</Label>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    type="text"
                    placeholder="Platform (e.g., LinkedIn, GitHub)"
                    value={newSocialLink.platform}
                    onChange={(e) => setNewSocialLink(prev => ({ ...prev, platform: e.target.value }))}
                  />
                  <Input
                    type="url"
                    placeholder="URL"
                    value={newSocialLink.url}
                    onChange={(e) => setNewSocialLink(prev => ({ ...prev, url: e.target.value }))}
                  />
                  <Button
                    type="button"
                    onClick={handleAddSocialLink}
                    variant="secondary"
                  >
                    Add
                  </Button>
                </div>
                <div className="space-y-2">
                  {formData.socialLinks.map((link, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="flex-1 flex gap-2">
                        <Input
                          type="text"
                          value={link.platform}
                          readOnly
                          className="bg-muted"
                        />
                        <Input
                          type="url"
                          value={link.url}
                          readOnly
                          className="bg-muted"
                        />
                      </div>
                      <Button
                        type="button"
                        onClick={() => handleRemoveSocialLink(index)}
                        variant="ghost"
                        size="icon"
                        className="text-destructive"
                      >
                        ×
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <Button type="submit">
                Create Team Member
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default New;
