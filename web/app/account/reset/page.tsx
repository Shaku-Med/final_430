'use client'
import Head from "../../dashboard/@auth/Components/Headers/Head";
import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { AlertCircle, ArrowRight, CheckCircle, MapPin, HelpCircle, RefreshCw } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import SetQuickToken from "../Actions/SetQuickToken";
import {toast} from 'sonner'
import Cookies from 'js-cookie';

const PasswordResetPage = () => {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [location, setLocation] = useState<{latitude: number; longitude: number} | null>(null);
  const [isLocationLoading, setIsLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState("");
  const [locationUpdatedAt, setLocationUpdatedAt] = useState<Date | null>(null);
  const [isAutoUpdating, setIsAutoUpdating] = useState(false);
  const locationIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Function to get user's current location
  const getLocation = () => {
    setIsLocationLoading(true);
    setLocationError("");
    
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser");
      setIsLocationLoading(false);
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
        setLocationUpdatedAt(new Date());
        setIsLocationLoading(false);
        
        // Start auto-updating if this is the first successful location fetch
        if (!isAutoUpdating && !locationIntervalRef.current) {
          startLocationTracking();
        }
      },
      (error) => {
        setLocationError("Unable to get your location. Please allow location access to reset your password.");
        setIsLocationLoading(false);
        stopLocationTracking();
      }
    );
  };

  // Start tracking location every 10 seconds
  const startLocationTracking = () => {
    setIsAutoUpdating(true);
    // Clear any existing interval first
    if (locationIntervalRef.current) {
      clearInterval(locationIntervalRef.current);
    }
    
    // Set up new interval
    locationIntervalRef.current = setInterval(() => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setLocation({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude
            });
            setLocationUpdatedAt(new Date());
          },
          (error) => {
            setLocationError("Location tracking was interrupted. Please share your location again.");
            stopLocationTracking();
          }
        );
      }
    }, 10000); // 10 seconds
  };

  // Stop tracking location
  const stopLocationTracking = () => {
    setIsAutoUpdating(false);
    if (locationIntervalRef.current) {
      clearInterval(locationIntervalRef.current);
      locationIntervalRef.current = null;
    }
  };

  // Clean up interval on component unmount
  useEffect(() => {
    return () => {
      if (locationIntervalRef.current) {
        clearInterval(locationIntervalRef.current);
      }
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // Get user's location first
      if (!location) {
        setError("Please allow location access to reset your password");
        setIsLoading(false);
        return;
      }

      let setSession = await SetQuickToken()

      if(!setSession){
        toast.error(`Sorry! we had troubles logging you in. Try refreshing and try again.`)
        setIsSubmitted(false)
        return;
      }

      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          userId: email,
          token: Cookies.get('_athk_'),
          location: {
            latitude: location.latitude,
            longitude: location.longitude,
            timestamp: locationUpdatedAt?.toISOString()
          }
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to request password reset');
      }

      setIsSubmitted(true);
      
      // Show location details to user
      if (data.location) {
        alert(`Password reset requested from:\nIP: ${data.location.ip}\nDevice: ${data.location.userAgent}\nTime: ${new Date(data.location.timestamp).toLocaleString()}`);
      }

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Format the time elapsed since last location update
  const getTimeElapsedText = () => {
    if (!locationUpdatedAt) return "";
    
    const seconds = Math.floor((new Date().getTime() - locationUpdatedAt.getTime()) / 1000);
    
    if (seconds < 5) return "just now";
    if (seconds < 60) return `${seconds} seconds ago`;
    
    return `${Math.floor(seconds / 60)} minute${Math.floor(seconds / 60) !== 1 ? 's' : ''} ago`;
  };

  return (
    <>
      <Head />
      <div className="flex items-center justify-center min-h-screen z-[10000000] fixed top-0 left-0 w-full p-4">
        <div className="w-full max-w-md px-4">
          <Card className="bg-card/80 backdrop-blur-md shadow-xl">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold text-center">Reset Password</CardTitle>
              <CardDescription className="text-center">
                {!isSubmitted ? "Enter your email to receive a password reset link" : "Check your email for reset instructions"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!isSubmitted ? (
                <form onSubmit={handleSubmit}>
                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="name@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                    
                    <div className="grid gap-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <Label>Your Location</Label>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                type="button" 
                                variant="ghost" 
                                size="icon" 
                                className="h-5 w-5 rounded-full p-0" 
                              >
                                <HelpCircle className="h-4 w-4 text-gray-500" />
                                <span className="sr-only">Why do we need your location?</span>
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-md z-[100000000]">
                              <DialogHeader>
                                <DialogTitle>Why we need your location</DialogTitle>
                                <DialogDescription>
                                  We use your location as an additional security measure to protect your account.
                                </DialogDescription>
                              </DialogHeader>
                              <div className="py-4">
                                <p className="mb-3">
                                  Your location helps us verify your identity and prevent unauthorized password reset attempts.
                                  Here's how it enhances your security:
                                </p>
                                <ul className="list-disc pl-5 space-y-2">
                                  <li>We can detect suspicious reset attempts from unusual locations</li>
                                  <li>It provides additional verification beyond just your email</li>
                                  <li>It helps us protect you from account takeover attempts</li>
                                  <li>Your location data is only used for verification and not stored permanently</li>
                                </ul>
                                <p className="mt-3">
                                  Your privacy is important to us. We use this information solely for account security purposes.
                                </p>
                              </div>
                              <DialogClose asChild>
                                <Button className="w-full">I understand</Button>
                              </DialogClose>
                            </DialogContent>
                          </Dialog>
                        </div>
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="sm" 
                          onClick={getLocation}
                          disabled={isLocationLoading}
                          className="text-xs"
                        >
                          {isLocationLoading ? "Getting location..." : location ? "Update location" : "Share location"}
                          <MapPin className="ml-1 h-3 w-3" />
                        </Button>
                      </div>
                      
                      {locationError && (
                        <div className="py-4 border px-4 rounded-lg text-yellow-500 text-center w-full">
                          <AlertCircle className="h-4 w-4" />
                          <div className="text-xs">{locationError}</div>
                        </div>
                      )}
                      
                      {location && (
                        <div className=" py-4 border px-4 rounded-lg text-green-500 text-center w-full">
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                              <CheckCircle className="h-4 w-4 text-green-600" />
                              <span className="text-xs">Location shared successfully</span>
                              {isAutoUpdating && (
                                <span className="flex items-center ml-auto text-xs text-green-600">
                                  <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                                  Auto-updating
                                </span>
                              )}
                            </div>
                            <Separator/>
                            {locationUpdatedAt && (
                              <div className="text-xs text-green-600 pl-6">
                                Last updated: {getTimeElapsedText()}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {!location && !locationError && (
                        <div className=" py-4 border px-4 rounded-lg text-yellow-500 text-center w-full">
                          <div className="flex items-center gap-2 justify-center">
                            <AlertCircle className="h-4 w-4" />
                            <div className="text-xs">Location sharing is required for security</div>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {error && (
                      <div className="py-4 border px-4 rounded-lg text-yellow-500 text-center w-full">
                        <AlertCircle className="h-4 w-4" />
                        <div>{error}</div>
                      </div>
                    )}
                    
                    <Button 
                      type="submit" 
                      disabled={isLoading || !location} 
                      className="w-full"
                    >
                      {isLoading ? "Sending..." : "Send Reset Link"}
                      {!isLoading && <ArrowRight className="ml-2 h-4 w-4" />}
                    </Button>
                    
                    {!location && (
                      <p className="text-xs text-center text-gray-500">
                        Please share your location to continue with password reset
                      </p>
                    )}
                  </div>
                </form>
              ) : (
                <div className="flex flex-col items-center justify-center text-center space-y-4">
                  <div className="bg-green-100 p-3 rounded-full">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p>We've sent a password reset link to:</p>
                    <p className="font-medium">{email}</p>
                    <p className="text-sm text-gray-500 mt-2">
                      Please check your inbox and spam folder
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex flex-col space-y-2">
              <div className="text-sm text-center text-gray-500">
                {!isSubmitted ? (
                  <span>Remember your password? <Link href="/account" className="text-blue-600 hover:underline">Back to login</Link></span>
                ) : (
                  <span>Didn't receive the email? <Button variant="link" onClick={() => setIsSubmitted(false)} className="p-0 h-auto">Try again</Button></span>
                )}
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </>
  );
};

export default PasswordResetPage;