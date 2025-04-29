'use client'
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { SearchIcon, CalendarIcon, TrendingUpIcon, BookmarkIcon, LanguagesIcon } from "lucide-react";
import { useState } from "react";
import Nav from "./Home/Nav/Nav";
import Hero from "./Home/Hero/Hero";
import KFeatures from "./Home/Features/KFeatures";
import Events from "./Home/Events/Events";
import Team from "./Home/Team/Team";
import CTA from "./Home/CTA/CTA";
import Footer from "./Home/Footer/Footer";

export default function Home() {

  return (
    <div className="flex flex-col min-h-screen">
      {/* Navigation */}
      <Nav/>
      <main className="flex-1">
        {/* Hero Section */}
        <Hero/>
        {/* Features Section */}
        <KFeatures/>

        {/* Events Section */}
        <Events/>

        {/* Team Section */}
        <Team/>
        {/* CTA Section */}
        <CTA/>
      </main>

      {/* Footer */}
      <Footer/>
    </div>
  );
}