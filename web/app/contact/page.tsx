'use client';

import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Mail, Phone, MapPin, Users, Calendar, School } from 'lucide-react';
import { toast } from 'sonner';
import Footer from '../Home/Footer/Footer';
import Nav from '../Home/Nav/Nav';

const ContactPage = () => {
  // State for general form
  const [generalForm, setGeneralForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    subject: '',
    message: ''
  });
  
  // State for events form
  const [eventsForm, setEventsForm] = useState({
    name: '',
    role: '',
    email: '',
    issue: '',
    details: ''
  });
  
  // State for projects form
  const [projectsForm, setProjectsForm] = useState({
    name: '',
    projectId: '',
    email: '',
    issue: '',
    details: ''
  });
  
  // Form errors state
  const [generalErrors, setGeneralErrors] = useState<any>({});
  const [eventsErrors, setEventsErrors] = useState<any>({});
  const [projectsErrors, setProjectsErrors] = useState<any>({});
  
  // Form loading states
  const [generalLoading, setGeneralLoading] = useState(false);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [projectsLoading, setProjectsLoading] = useState(false);

  // Handle general form input changes
  const handleGeneralChange = (e: any) => {
    const { id, value } = e.target;
    setGeneralForm((prev: any) => ({
      ...prev,
      [id]: value
    }));
    
    // Clear error for this field if it exists
    if (generalErrors[id]) {
      setGeneralErrors((prev: any) => ({
        ...prev,
        [id]: ''
      }));
    }
  };
  
  // Handle select change for general form
  const handleGeneralSelectChange = (value: any) => {
    setGeneralForm((prev: any) => ({
      ...prev,
      subject: value
    }));
    
    // Clear error for this field if it exists
    if (generalErrors.subject) {
      setGeneralErrors((prev: any) => ({
        ...prev,
        subject: ''
      }));
    }
  };
  
  // Handle events form input changes
  const handleEventsChange = (e: any) => {
    const { id, value } = e.target;
    const fieldName = id.replace('event-', '');
    setEventsForm((prev: any) => ({
      ...prev,
      [fieldName]: value
    }));
    
    // Clear error for this field if it exists
    if (eventsErrors[fieldName]) {
      setEventsErrors((prev: any) => ({
        ...prev,
        [fieldName]: ''
      }));
    }
  };
  
  // Handle select change for events form
  const handleEventsSelectChange = (value: any) => {
    setEventsForm((prev: any) => ({
      ...prev,
      issue: value
    }));
    
    // Clear error for this field if it exists
    if (eventsErrors.issue) {
      setEventsErrors((prev: any) => ({
        ...prev,
        issue: ''
      }));
    }
  };
  
  // Handle projects form input changes
  const handleProjectsChange = (e: any) => {
    const { id, value } = e.target;
    const fieldName = id.replace('project-', '');
    setProjectsForm((prev: any) => ({
      ...prev,
      [fieldName]: value
    }));
    
    // Clear error for this field if it exists
    if (projectsErrors[fieldName]) {
      setProjectsErrors((prev: any) => ({
        ...prev,
        [fieldName]: ''
      }));
    }
  };
  
  // Handle select change for projects form
  const handleProjectsSelectChange = (value: any) => {
    setProjectsForm((prev: any) => ({
      ...prev,
      issue: value
    }));
    
    // Clear error for this field if it exists
    if (projectsErrors.issue) {
      setProjectsErrors((prev: any) => ({
        ...prev,
        issue: ''
      }));
    }
  };

  // Validate email format
  const isValidEmail = (email: any) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };
  
  // Submit general form
  const handleGeneralSubmit = (e: any) => {
    e.preventDefault();
    const errors: any = {};
    
    // Validate fields
    if (!generalForm.firstName.trim()) errors.firstName = 'First name is required';
    if (!generalForm.lastName.trim()) errors.lastName = 'Last name is required';
    
    if (!generalForm.email.trim()) {
      errors.email = 'Email is required';
    } else if (!isValidEmail(generalForm.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    if (!generalForm.subject) errors.subject = 'Please select a subject';
    if (!generalForm.message.trim()) errors.message = 'Message is required';
    
    // If there are errors, update the errors state and return
    if (Object.keys(errors).length > 0) {
      setGeneralErrors(errors);
      return;
    }
    
    // Proceed with form submission
    setGeneralLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setGeneralLoading(false);
      // Show success message
      toast.success('Your message has been sent successfully!', {
        description: 'We will get back to you soon.',
        position: 'top-center',
        duration: 3000
      });
      
      // Reset form
      setGeneralForm({
        firstName: '',
        lastName: '',
        email: '',
        subject: '',
        message: ''
      });
    }, 1500);
  };
  
  // Submit events form
  const handleEventsSubmit = (e: any) => {
    e.preventDefault();
    const errors: any = {};
    
    // Validate fields
    if (!eventsForm.name.trim()) errors.name = 'Your name is required';
    if (!eventsForm.role.trim()) errors.role = 'Your role is required';
    
    if (!eventsForm.email.trim()) {
      errors.email = 'Email is required';
    } else if (!isValidEmail(eventsForm.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    if (!eventsForm.issue) errors.issue = 'Please select an issue';
    if (!eventsForm.details.trim()) errors.details = 'Event details are required';
    
    // If there are errors, update the errors state and return
    if (Object.keys(errors).length > 0) {
      setEventsErrors(errors);
      return;
    }
    
    // Proceed with form submission
    setEventsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setEventsLoading(false);
      // Show success message
      toast.success('Your event support request has been submitted!', {
        description: 'Our events team will contact you shortly.',
        position: 'top-center',
        duration: 3000
      });
      
      // Reset form
      setEventsForm({
        name: '',
        role: '',
        email: '',
        issue: '',
        details: ''
      });
    }, 1500);
  };
  
  // Submit projects form
  const handleProjectsSubmit = (e: any) => {
    e.preventDefault();
    const errors: any = {};
    
    // Validate fields
    if (!projectsForm.name.trim()) errors.name = 'Your name is required';
    // Project ID is optional
    
    if (!projectsForm.email.trim()) {
      errors.email = 'Email is required';
    } else if (!isValidEmail(projectsForm.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    if (!projectsForm.issue) errors.issue = 'Please select an issue';
    if (!projectsForm.details.trim()) errors.details = 'Project details are required';
    
    // If there are errors, update the errors state and return
    if (Object.keys(errors).length > 0) {
      setProjectsErrors(errors);
      return;
    }
    
    // Proceed with form submission
    setProjectsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setProjectsLoading(false);
      // Show success message
      toast.success('Your project support request has been submitted!', {
        description: 'Our projects team will review your request soon.',
        position: 'top-center',
        duration: 3000
      });
      
      // Reset form
      setProjectsForm({
        name: '',
        projectId: '',
        email: '',
        issue: '',
        details: ''
      });
    }, 1500);
  };

  return (
    <>
        <Nav/>
        <div className="max-w-7xl mt-10 mx-auto py-10 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Contact Us</h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Get in touch with the CSI Spotlight team
            </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div>
            <Tabs defaultValue="general">
                <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="general">General</TabsTrigger>
                <TabsTrigger value="events">Events</TabsTrigger>
                <TabsTrigger value="projects">Projects</TabsTrigger>
                </TabsList>
                
                <TabsContent value="general" className="mt-6">
                <Card>
                    <CardHeader>
                    <CardTitle>General Inquiries</CardTitle>
                    <CardDescription>
                        For questions about CSI Spotlight or the CS Department
                    </CardDescription>
                    </CardHeader>
                    <CardContent>
                    <form className="space-y-4" onSubmit={handleGeneralSubmit}>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="firstName">First name</Label>
                            <Input 
                              id="firstName" 
                              placeholder="Enter your first name"
                              value={generalForm.firstName}
                              onChange={handleGeneralChange}
                              className={generalErrors.firstName ? "border-red-500" : ""}
                            />
                            {generalErrors.firstName && (
                              <p className="text-red-500 text-sm mt-1">{generalErrors.firstName}</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="lastName">Last name</Label>
                            <Input 
                              id="lastName" 
                              placeholder="Enter your last name"
                              value={generalForm.lastName}
                              onChange={handleGeneralChange}
                              className={generalErrors.lastName ? "border-red-500" : ""}
                            />
                            {generalErrors.lastName && (
                              <p className="text-red-500 text-sm mt-1">{generalErrors.lastName}</p>
                            )}
                        </div>
                        </div>
                        
                        <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input 
                          id="email" 
                          type="email" 
                          placeholder="you@example.com"
                          value={generalForm.email}
                          onChange={handleGeneralChange}
                          className={generalErrors.email ? "border-red-500" : ""}
                        />
                        {generalErrors.email && (
                          <p className="text-red-500 text-sm mt-1">{generalErrors.email}</p>
                        )}
                        </div>
                        
                        <div className="space-y-2">
                        <Label htmlFor="subject">Subject</Label>
                        <Select onValueChange={handleGeneralSelectChange} value={generalForm.subject}>
                            <SelectTrigger className={generalErrors.subject ? "border-red-500" : ""}>
                              <SelectValue placeholder="Select a topic" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="general">General Question</SelectItem>
                              <SelectItem value="technical">Technical Support</SelectItem>
                              <SelectItem value="feedback">Feedback</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                        </Select>
                        {generalErrors.subject && (
                          <p className="text-red-500 text-sm mt-1">{generalErrors.subject}</p>
                        )}
                        </div>
                        
                        <div className="space-y-2">
                        <Label htmlFor="message">Message</Label>
                        <Textarea 
                          id="message" 
                          placeholder="Enter your message here" 
                          rows={5}
                          value={generalForm.message}
                          onChange={handleGeneralChange}
                          className={generalErrors.message ? "border-red-500" : ""}
                        />
                        {generalErrors.message && (
                          <p className="text-red-500 text-sm mt-1">{generalErrors.message}</p>
                        )}
                        </div>
                    </form>
                    </CardContent>
                    <CardFooter>
                      <Button 
                        className="w-full" 
                        onClick={handleGeneralSubmit}
                        disabled={generalLoading}
                      >
                        {generalLoading ? "Sending..." : "Send Message"}
                      </Button>
                    </CardFooter>
                </Card>
                </TabsContent>
                
                <TabsContent value="events" className="mt-6">
                <Card>
                    <CardHeader>
                    <CardTitle>Event Support</CardTitle>
                    <CardDescription>
                        For questions related to CS events or event submission
                    </CardDescription>
                    </CardHeader>
                    <CardContent>
                    <form className="space-y-4" onSubmit={handleEventsSubmit}>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="event-name">Your name</Label>
                            <Input 
                              id="event-name" 
                              placeholder="Enter your name"
                              value={eventsForm.name}
                              onChange={handleEventsChange}
                              className={eventsErrors.name ? "border-red-500" : ""}
                            />
                            {eventsErrors.name && (
                              <p className="text-red-500 text-sm mt-1">{eventsErrors.name}</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="event-role">Your role</Label>
                            <Input 
                              id="event-role" 
                              placeholder="Faculty/Student/Staff"
                              value={eventsForm.role}
                              onChange={handleEventsChange}
                              className={eventsErrors.role ? "border-red-500" : ""}
                            />
                            {eventsErrors.role && (
                              <p className="text-red-500 text-sm mt-1">{eventsErrors.role}</p>
                            )}
                        </div>
                        </div>
                        
                        <div className="space-y-2">
                        <Label htmlFor="event-email">Email</Label>
                        <Input 
                          id="event-email" 
                          type="email" 
                          placeholder="you@example.com"
                          value={eventsForm.email}
                          onChange={handleEventsChange}
                          className={eventsErrors.email ? "border-red-500" : ""}
                        />
                        {eventsErrors.email && (
                          <p className="text-red-500 text-sm mt-1">{eventsErrors.email}</p>
                        )}
                        </div>
                        
                        <div className="space-y-2">
                        <Label htmlFor="event-topic">Event Issue</Label>
                        <Select onValueChange={handleEventsSelectChange} value={eventsForm.issue}>
                            <SelectTrigger className={eventsErrors.issue ? "border-red-500" : ""}>
                              <SelectValue placeholder="Select an issue" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="create">Event Creation</SelectItem>
                              <SelectItem value="update">Event Updates</SelectItem>
                              <SelectItem value="delete">Event Deletion</SelectItem>
                              <SelectItem value="permissions">Permission Issues</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                        </Select>
                        {eventsErrors.issue && (
                          <p className="text-red-500 text-sm mt-1">{eventsErrors.issue}</p>
                        )}
                        </div>
                        
                        <div className="space-y-2">
                        <Label htmlFor="event-details">Event Details</Label>
                        <Textarea 
                          id="event-details" 
                          placeholder="Please provide details about your event issue" 
                          rows={5}
                          value={eventsForm.details}
                          onChange={handleEventsChange}
                          className={eventsErrors.details ? "border-red-500" : ""}
                        />
                        {eventsErrors.details && (
                          <p className="text-red-500 text-sm mt-1">{eventsErrors.details}</p>
                        )}
                        </div>
                    </form>
                    </CardContent>
                    <CardFooter>
                      <Button 
                        className="w-full" 
                        onClick={handleEventsSubmit}
                        disabled={eventsLoading}
                      >
                        {eventsLoading ? "Submitting..." : "Submit Event Support Request"}
                      </Button>
                    </CardFooter>
                </Card>
                </TabsContent>
                
                <TabsContent value="projects" className="mt-6">
                <Card>
                    <CardHeader>
                    <CardTitle>Project Showcase Support</CardTitle>
                    <CardDescription>
                        For questions about project submissions and display
                    </CardDescription>
                    </CardHeader>
                    <CardContent>
                    <form className="space-y-4" onSubmit={handleProjectsSubmit}>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="project-name">Your name</Label>
                            <Input 
                              id="project-name" 
                              placeholder="Enter your name"
                              value={projectsForm.name}
                              onChange={handleProjectsChange}
                              className={projectsErrors.name ? "border-red-500" : ""}
                            />
                            {projectsErrors.name && (
                              <p className="text-red-500 text-sm mt-1">{projectsErrors.name}</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="project-projectId">Project ID (if applicable)</Label>
                            <Input 
                              id="project-projectId" 
                              placeholder="Project ID"
                              value={projectsForm.projectId}
                              onChange={handleProjectsChange}
                            />
                        </div>
                        </div>
                        
                        <div className="space-y-2">
                        <Label htmlFor="project-email">Email</Label>
                        <Input 
                          id="project-email" 
                          type="email" 
                          placeholder="you@example.com"
                          value={projectsForm.email}
                          onChange={handleProjectsChange}
                          className={projectsErrors.email ? "border-red-500" : ""}
                        />
                        {projectsErrors.email && (
                          <p className="text-red-500 text-sm mt-1">{projectsErrors.email}</p>
                        )}
                        </div>
                        
                        <div className="space-y-2">
                        <Label htmlFor="project-topic">Project Issue</Label>
                        <Select onValueChange={handleProjectsSelectChange} value={projectsForm.issue}>
                            <SelectTrigger className={projectsErrors.issue ? "border-red-500" : ""}>
                              <SelectValue placeholder="Select an issue" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="submission">Project Submission</SelectItem>
                              <SelectItem value="updates">Project Updates</SelectItem>
                              <SelectItem value="visibility">Visibility Issues</SelectItem>
                              <SelectItem value="feedback">Feedback System</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                        </Select>
                        {projectsErrors.issue && (
                          <p className="text-red-500 text-sm mt-1">{projectsErrors.issue}</p>
                        )}
                        </div>
                        
                        <div className="space-y-2">
                        <Label htmlFor="project-details">Project Details</Label>
                        <Textarea 
                          id="project-details" 
                          placeholder="Please describe your project issue" 
                          rows={5}
                          value={projectsForm.details}
                          onChange={handleProjectsChange}
                          className={projectsErrors.details ? "border-red-500" : ""}
                        />
                        {projectsErrors.details && (
                          <p className="text-red-500 text-sm mt-1">{projectsErrors.details}</p>
                        )}
                        </div>
                    </form>
                    </CardContent>
                    <CardFooter>
                      <Button 
                        className="w-full" 
                        onClick={handleProjectsSubmit}
                        disabled={projectsLoading}
                      >
                        {projectsLoading ? "Submitting..." : "Submit Project Support Request"}
                      </Button>
                    </CardFooter>
                </Card>
                </TabsContent>
            </Tabs>
            </div>
            
            <div className="space-y-8">
            <div>
                <h2 className="text-2xl font-bold mb-6">Other Ways to Connect</h2>
                <div className="grid grid-cols-1 gap-4">
                <Card>
                    <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                        <div className="p-2 rounded-lg bg-blue-100 text-blue-700">
                        <Mail className="h-5 w-5" />
                        </div>
                        <div>
                        <h3 className="font-semibold text-lg">Email Us</h3>
                        <p className="text-muted-foreground mt-1">For general inquiries</p>
                        <a href="mailto:contact@csispotlight.edu" className="text-blue-600 hover:underline block mt-1">
                            contact@csispotlight.edu
                        </a>
                        </div>
                    </div>
                    </CardContent>
                </Card>
                
                <Card>
                    <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                        <div className="p-2 rounded-lg bg-blue-100 text-blue-700">
                        <Phone className="h-5 w-5" />
                        </div>
                        <div>
                        <h3 className="font-semibold text-lg">Call Us</h3>
                        <p className="text-muted-foreground mt-1">CS Department Office</p>
                        <p className="text-blue-600 block mt-1">(555) 123-4567</p>
                        </div>
                    </div>
                    </CardContent>
                </Card>
                
                <Card>
                    <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                        <div className="p-2 rounded-lg bg-blue-100 text-blue-700">
                        <MapPin className="h-5 w-5" />
                        </div>
                        <div>
                        <h3 className="font-semibold text-lg">Visit Us</h3>
                        <p className="text-muted-foreground mt-1">Computer Science Department</p>
                        <p className="text-muted-foreground">Room 3010, Tech Building</p>
                        <p className="text-muted-foreground">University Campus</p>
                        </div>
                    </div>
                    </CardContent>
                </Card>
                </div>
            </div>
            
            <div>
                <h2 className="text-2xl font-bold mb-6">Department Contacts</h2>
                <div className="grid grid-cols-1 gap-4">
                <Card>
                    <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                        <div className="p-2 rounded-lg bg-blue-100 text-blue-700">
                        <Users className="h-5 w-5" />
                        </div>
                        <div>
                        <h3 className="font-semibold text-lg">Student Support</h3>
                        <p className="text-muted-foreground mt-1">For academic advising and student resources</p>
                        <a href="mailto:students@csispotlight.edu" className="text-blue-600 hover:underline block mt-1">
                            students@csispotlight.edu
                        </a>
                        </div>
                    </div>
                    </CardContent>
                </Card>
                
                <Card>
                    <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                        <div className="p-2 rounded-lg bg-blue-100 text-blue-700">
                        <Calendar className="h-5 w-5" />
                        </div>
                        <div>
                        <h3 className="font-semibold text-lg">Events Team</h3>
                        <p className="text-muted-foreground mt-1">For CS event planning and coordination</p>
                        <a href="mailto:events@csispotlight.edu" className="text-blue-600 hover:underline block mt-1">
                            events@csispotlight.edu
                        </a>
                        </div>
                    </div>
                    </CardContent>
                </Card>
                
                <Card>
                    <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                        <div className="p-2 rounded-lg bg-blue-100 text-blue-700">
                        <School className="h-5 w-5" />
                        </div>
                        <div>
                        <h3 className="font-semibold text-lg">Faculty Office</h3>
                        <p className="text-muted-foreground mt-1">For faculty and administrative inquiries</p>
                        <a href="mailto:faculty@csispotlight.edu" className="text-blue-600 hover:underline block mt-1">
                            faculty@csispotlight.edu
                        </a>
                        </div>
                    </div>
                    </CardContent>
                </Card>
                </div>
            </div>
            </div>
        </div>
        </div>
        <Footer/>
    </>
  );
};

export default ContactPage;