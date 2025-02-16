
import { motion } from "framer-motion";
import { Component as EmailInput } from "@/components/ui/code.demo";
const Hero = () => {
  return <header className="container-padding py-12 bg-slate-50">
      {/* Hero content */}
      <div className="max-w-4xl mx-auto text-center relative z-10 pt-40 pb-32">
        <motion.h1 className="font-seasons heading-xl mb-6" initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        duration: 0.5
      }}>Create a zoomer marketing army with Ai UGC videos</motion.h1>
        <motion.p className="text-xl text-neutral-600 mb-8" initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        duration: 0.5,
        delay: 0.2
      }}>
          A powerful and flexible platform designed for modern businesses and startups.
        </motion.p>
        <motion.div className="flex justify-center" initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        duration: 0.5,
        delay: 0.4
      }}>
          <EmailInput />
        </motion.div>
      </div>
    </header>;
};
export default Hero;
