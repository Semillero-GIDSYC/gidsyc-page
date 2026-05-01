import { Globe, Mail, Search, MapPin, Phone } from 'lucide-react';
import LOGO_U_G from '/assets/logoUgrupo.png';

export const Footer = () => {
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
              {[Globe, Mail, Search].map((Icon, idx) => (
                <a key={idx} href="#" className="p-3 bg-gray-50 text-navy-900 rounded-2xl hover:bg-navy-900 hover:text-white transition-all shadow-sm">
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>

          <div className="space-y-6 text-left">
            <h4 className="text-navy-900 font-bold uppercase tracking-widest text-xs">Información</h4>
            <ul className="space-y-3 text-sm text-gray-500">
              <li><a href="#" className="hover:text-navy-900 transition-colors">Privacidad</a></li>
              <li><a href="#" className="hover:text-navy-900 transition-colors">Semillero GIDSYC</a></li>
              <li><a href="#" className="hover:text-navy-900 transition-colors">Estatutos</a></li>
            </ul>
          </div>

          <div className="space-y-6 text-left">
            <h4 className="text-navy-900 font-bold uppercase tracking-widest text-xs">Contacto</h4>
            <ul className="space-y-4 text-sm text-gray-500">
              <li className="flex items-start gap-3 text-left">
                <MapPin size={18} className="text-burnt-red-500 shrink-0" />
                <span>Universidad del Magdalena, Santa Marta, Colombia</span>
              </li>
              <li className="flex items-center gap-3 text-left">
                <Phone size={18} className="text-burnt-red-500 shrink-0" />
                <span>+57 (301) 6836593</span>
              </li>
              <li className="flex items-center gap-3 text-left">
                <Mail size={18} className="text-burnt-red-500 shrink-0" />
                <span>gsanchez@unimagdalena.edu.co</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-gray-400 font-medium">
          <p>© 2026 GIDSYC - Universidad del Magdalena.</p>
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-green-500 scale-animation"></span> Red GIDSYC activa</span>
          </div>
        </div>
      </div>

      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-navy-500/5 rounded-full blur-[120px] pointer-events-none"></div>
    </footer>
  );
};
