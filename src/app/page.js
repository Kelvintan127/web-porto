"use client";
import Navbar from "@/app/components/Navbar.jsx";
import HomeSection from "./components/HomeSection.jsx";
import Image from "next/image";
import Contact from "./components/Contact.jsx";
import About from "./components/About.jsx";
import Project from "./components/Project.jsx";
import Footer from "./components/Footer.jsx";
export default function Home() {
  return (
    <main className="min-h-screen w-full relative">
      <Navbar />
      <div className='flex w-full  items-center mx-auto flex-col'>
        <HomeSection />
        <About />
        <Project />
        <Contact />
        <Footer />
      </div>
    </main>
  );
}
