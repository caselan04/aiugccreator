
import { useState } from "react";
import { Menu } from "lucide-react";
import { motion } from "framer-motion";

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  return <nav className="w-full bg-white">
      <div className="mx-[40px] px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img src="/lovable-uploads/796f8416-3973-49e7-9bbf-aacf9058b828.png" alt="ShotPixelAi Logo" className="w-10 h-10 object-fill" />
          <span className="text-xl font-semibold">ShotPixelAi</span>
        </div>
        
        <div className="hidden md:flex items-center gap-4">
          <button className="px-4 py-2 transition-colors font-medium rounded-lg text-black border border-neutral-200">
            Log in
          </button>
          <button className="button-secondary bg-purple-700 hover:bg-purple-600 py-[6px] px-[9px] my-0">
            Try for Free
          </button>
        </div>

        {/* Mobile Menu Button */}
        <button className="md:hidden p-2 hover:bg-neutral-200/50 rounded-full transition-colors" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && <motion.div className="md:hidden bg-white border-t border-neutral-100 p-4 mx-[40px]" initial={{
      opacity: 0,
      y: -20
    }} animate={{
      opacity: 1,
      y: 0
    }} transition={{
      duration: 0.2
    }}>
          <div className="flex flex-col gap-4">
            <a href="#features" className="text-neutral-600 hover:text-primary transition-colors font-medium px-4 py-2 hover:bg-neutral-200/50 rounded-lg">Features</a>
            <a href="#pricing" className="text-neutral-600 hover:text-primary transition-colors font-medium px-4 py-2 hover:bg-neutral-200/50 rounded-lg">Pricing</a>
            <a href="#about" className="text-neutral-600 hover:text-primary transition-colors font-medium px-4 py-2 hover:bg-neutral-200/50 rounded-lg">About</a>
            <hr className="border-neutral-200" />
            <button className="text-primary hover:text-primary/80 transition-colors font-medium px-4 py-2 hover:bg-neutral-200/50 rounded-lg text-left">
              Log in
            </button>
            <button className="button-secondary w-full">
              Try for Free
            </button>
          </div>
        </motion.div>}
    </nav>;
};

export default Navigation;
