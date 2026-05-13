import { motion, AnimatePresence } from 'motion/react';
import { Menu, X } from 'lucide-react';
import { useScroll } from '../../hooks/useScroll';
import { NAV_LINKS } from '../../constants/navigation';
import { ViewType } from '../../types';
import ICON_ONLY from '/assets/logo_unimagdalena.png';

interface NavbarProps {
  activeView: ViewType;
  isMenuOpen: boolean;
  setIsMenuOpen: (open: boolean) => void;
  onNavClick: (view: ViewType, hash?: string) => void;
}

export const Navbar = ({ activeView, isMenuOpen, setIsMenuOpen, onNavClick }: NavbarProps) => {
  const scrolled = useScroll();

  return (
    <nav
      className={`fixed top-4 left-4 right-4 z-50 transition-all duration-500 rounded-3xl ${
        scrolled ? 'glass-panel py-3 shadow-xl shadow-slate-200/50' : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-6 flex items-center justify-between">
        <div className="flex items-center gap-4 cursor-pointer" onClick={() => onNavClick('main', '#')}>
          <img
            src={ICON_ONLY}
            alt="GIDSYC Icon"
            className="h-10 md:h-12 w-auto object-contain"
            referrerPolicy="no-referrer"
          />
          <span className="text-gray-600 text-sm font-medium hidden lg:block border-l border-gray-200 pl-4 py-1">
            Grupo de Investigación en Sistemas y Computación
          </span>
        </div>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-5 lg:gap-8">
          {NAV_LINKS.map((link) => (
            <button
              key={link.title}
              onClick={(e) => { e.preventDefault(); onNavClick(link.view, link.hash); }}
              className={`nav-link ${
                (activeView === link.view && (!link.hash || activeView !== 'main' || link.title === 'Inicio')) 
                ? 'active-nav-link' 
                : ''
              }`}
            >
              {link.title}
            </button>
          ))}
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden text-gray-900 p-2"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-40 bg-white pt-24 px-6 md:hidden text-left"
          >
            <div className="flex flex-col gap-6">
              {NAV_LINKS.map((link) => (
                <button
                  key={link.title}
                  onClick={(e) => { e.preventDefault(); onNavClick(link.view, link.hash); }}
                  className="text-2xl font-bold text-navy-900 hover:text-burnt-red-500 transition-colors text-left"
                >
                  {link.title}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};
