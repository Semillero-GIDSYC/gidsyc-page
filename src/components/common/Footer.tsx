import React, { useState } from 'react';
import { Mail, MapPin, Phone, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import LOGO_U_G from '/assets/logoUgrupo.png';

// Custom GitHub icon to replace deprecated lucide-react version
const GitHubIcon = ({ size = 18 }: { size?: number }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

export const Footer = () => {
  const [copyFeedback, setCopyFeedback] = useState<{ show: boolean, text: string }>({ show: false, text: '' });

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopyFeedback({ show: true, text: `¡${label} copiado al portapapeles!` });
    setTimeout(() => setCopyFeedback({ show: false, text: '' }), 2000);
  };

  return (
    <footer className="pt-20 pb-10 bg-white border-t border-gray-100 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 md:px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="md:col-span-2 space-y-6 text-left">
            <div className="flex items-center gap-4">
              <img src={LOGO_U_G} alt="GIDSYC" className="h-14 w-auto" referrerPolicy="no-referrer" />
            </div>
            <p className="text-gray-500 max-w-sm text-left">
              Semillero de Investigación liderando la vanguardia tecnológica en el caribe colombiano.
            </p>
            <div className="flex gap-4">
              <a 
                href="https://github.com/Semillero-GIDSYC" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="p-3 bg-gray-50 text-navy-900 rounded-2xl hover:bg-navy-900 hover:text-white transition-all shadow-sm"
              >
                <GitHubIcon size={18} />
              </a>
              <button 
                onClick={() => handleCopy('gsanchez@unimagdalena.edu.co', 'Correo')}
                className="p-3 bg-gray-50 text-navy-900 rounded-2xl hover:bg-navy-900 hover:text-white transition-all shadow-sm relative group"
                title="Copiar correo"
              >
                <Mail size={18} />
              </button>
            </div>
          </div>

          <div className="space-y-6 text-left">
            <h4 className="text-navy-900 font-bold uppercase tracking-widest text-xs">Información</h4>
            <ul className="space-y-3 text-sm text-gray-500">
              <li>
                <a 
                  href="https://github.com/Semillero-GIDSYC" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="hover:text-navy-900 transition-colors"
                >
                  Semillero GIDSYC
                </a>
              </li>
            </ul>
          </div>

          <div className="space-y-6 text-left">
            <h4 className="text-navy-900 font-bold uppercase tracking-widest text-xs">Contacto</h4>
            <ul className="space-y-4 text-sm text-gray-500">
              <li className="flex items-start gap-3 text-left">
                <MapPin size={18} className="text-burnt-red-500 shrink-0" />
                <span>Universidad del Magdalena, Santa Marta, Colombia</span>
              </li>
              <li className="flex items-center gap-3 text-left relative">
                <Phone size={18} className="text-burnt-red-500 shrink-0" />
                <button 
                  onClick={() => handleCopy('+57 (301) 6836593', 'Número')}
                  className="hover:text-navy-900 transition-colors cursor-pointer text-left"
                  title="Click para copiar"
                >
                  +57 (301) 6836593
                </button>
              </li>
              <li className="flex items-center gap-3 text-left relative">
                <Mail size={18} className="text-burnt-red-500 shrink-0" />
                <button 
                  onClick={() => handleCopy('gsanchez@unimagdalena.edu.co', 'Correo')}
                  className="hover:text-navy-900 transition-colors cursor-pointer text-left"
                  title="Click para copiar"
                >
                  gsanchez@unimagdalena.edu.co
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-gray-400 font-medium">
          <p>© 2026 GIDSYC - Universidad del Magdalena.</p>
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 scale-animation"></span> 
              Red GIDSYC activa
            </span>
          </div>
        </div>
      </div>

      {/* Copy Message Toast */}
      <AnimatePresence>
        {copyFeedback.show && (
          <motion.div
            initial={{ opacity: 0, y: 50, x: '-50%' }}
            animate={{ opacity: 1, y: -20, x: '-50%' }}
            exit={{ opacity: 0, y: 50, x: '-50%' }}
            className="fixed bottom-10 left-1/2 z-[100] px-6 py-3 bg-navy-900 text-white rounded-full shadow-2xl flex items-center gap-3 border border-white/10 backdrop-blur-md"
          >
            <div className="bg-green-500 rounded-full p-1">
              <Check size={14} className="text-white" />
            </div>
            <span className="font-bold text-sm tracking-tight">{copyFeedback.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-navy-500/5 rounded-full blur-[120px] pointer-events-none"></div>
    </footer>
  );
};
