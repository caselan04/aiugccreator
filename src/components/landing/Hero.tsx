import { motion } from "framer-motion";
import { Component as EmailInput } from "@/components/ui/code.demo";
import { Link } from "react-router-dom";
const Hero = () => {
  return <header className="min-h-screen relative overflow-hidden bg-white">
      {/* Gradient background */}
      <div style={{
      background: "linear-gradient(45deg, #ff99cc, #9b87f5, #61AAF2)"
    }} className="absolute inset-0 bg-gradient-to-r from-pink-400 via-purple-500 to-blue-400 opacity-90 bg-inherit rounded-lg px-0 mx-[40px] my-0" />
      
      {/* Grid overlay */}
      <div style={{
      backgroundImage: "linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px)",
      backgroundSize: "20px 20px"
    }} className="absolute inset-0 px-0 py-0 my-[50px] mx-[50px]" />

      {/* Hero content */}
      <div className="max-w-4xl mx-auto text-center relative z-10 pt-40 pb-32 px-4">
        <motion.h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 text-white tracking-tight" initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        duration: 0.5
      }}>
          Build a zoomer marketing
          <br />
          army with AI UGC creators
        </motion.h1>

        <motion.p className="text-lg md:text-xl text-white/90 mb-12" initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        duration: 0.5,
        delay: 0.2
      }}>
          Deploy Scalable AI Content Factories for 24/7 UGC Production.
        </motion.p>

        <motion.div className="flex flex-col items-center gap-4" initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        duration: 0.5,
        delay: 0.4
      }}>
          <div className="relative w-full max-w-md">
            <input type="email" placeholder="you@example.com" className="w-full px-6 py-4 rounded-full bg-white shadow-lg text-gray-800 outline-none" />
            <button className="absolute right-2 top-1/2 -translate-y-1/2 bg-gradient-to-r from-purple-500 to-purple-600 text-white px-6 py-2 rounded-full font-medium hover:opacity-90 transition-opacity">
              Join Waitlist →
            </button>
          </div>
        </motion.div>
      </div>
    </header>;
};
export default Hero;