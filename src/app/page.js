"use client";
import Navbar from "@/app/components/Navbar";
import HomeSection from "./components/HomeSection";
import Image from "next/image";
import Contact from "./components/Contact";
import About from "./components/About";
import BackgroundAnimation from "./components/BackgroundAnimation";
import Project from "./components/Project";
import Footer from "./components/Footer";
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
