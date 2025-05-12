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
import { Mail, Phone, MapPin } from 'lucide-react';
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
  
  // Form errors state
  const [generalErrors, setGeneralErrors] = useState<any>({});
  
  // Form loading states
  const [generalLoading, setGeneralLoading] = useState(false);

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

  // Validate email format
  const isValidEmail = (email: any) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };
  
  // Submit general form
  const handleGeneralSubmit = async (e: any) => {
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
    
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          formType: 'general',
          ...generalForm
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to submit form');
      }

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
    } catch (error: any) {
      toast.error('Failed to send message', {
        description: error.message || 'Please try again later.',
        position: 'top-center',
        duration: 3000
      });
    } finally {
      setGeneralLoading(false);
    }
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
                <Card>
                    <CardHeader>
                    <CardTitle>Contact Us</CardTitle>
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
                        <a target='_blank' href="mailto:fakeemail@gmail.com" className="text-blue-600 hover:underline block mt-1">
                            fakeemail@gmail.com
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
                        <p className="text-blue-600 block mt-1">(999) 999-9999</p>
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
                        <p className="text-muted-foreground">College of Staten Island</p>
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