import { useState, useEffect } from "react";
import { CRMSidebar } from "./CRMSidebar";
import { Menu } from "lucide-react";
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  // Close mobile menu on navigate
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden relative">
      {/* Mobile Header */}
      <div className="md:hidden absolute top-0 left-0 right-0 h-14 border-b border-border bg-card/80 backdrop-blur flex items-center px-4 z-40">
        <button 
          onClick={() => setMobileMenuOpen(true)} 
          className="p-2 -ml-2 text-muted-foreground hover:text-foreground"
        >
          <Menu className="w-5 h-5" />
        </button>
        <span className="font-semibold ml-2">Nexus CRM</span>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden md:block h-full z-30">
        <CRMSidebar />
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <div className="md:hidden fixed inset-0 z-50 flex">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50" 
              onClick={() => setMobileMenuOpen(false)} 
            />
            <motion.div 
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="w-[260px] h-full bg-sidebar relative z-50 shadow-xl"
            >
              <CRMSidebar isMobile />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <main className="flex-1 h-full overflow-y-auto overflow-x-hidden pt-14 md:pt-0">
        {children}
      </main>
    </div>
  );
}
