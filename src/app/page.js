"use client";
import Navbar from "@/app/components/Navbar.jsx";
import HomeSection from "./components/HomeSection.jsx";
import Image from "next/image";
import Contact from "./components/Contact.jsx";
import About from "./components/About.jsx";
import Project from "./components/Project.jsx";
import Footer from "./components/Footer.jsx";
import { useEffect } from "react";
import { generatePDF } from "./utils/generateCV.jsx";

export default function Home() {
  // Uncomment when ready to download CV
  // useEffect(() => {
  //   async function download() {
  //     const blob = await generatePDF()
  //     // download blob
  //     const url = URL.createObjectURL(blob)
  //     const a = document.createElement("a")
  //     a.href = url
  //     a.download = "Kelvin_Tan_CV.pdf"
  //     a.click()
  //   }
  //   download()
  // }, [])

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
