'use client'
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