import { motion } from 'motion/react';
import { Search, Users, BookOpen, ChevronRight, Phone, MapPin, Mail } from 'lucide-react';
import { BrainBackground } from '../features/hero/BrainBackground/BrainBackground';
import { PROJECTS } from '../data/projects';
import { TEAM_MEMBERS } from '../data/team';
import FULL_LOGO from '/assets/horizontal.png';

interface HomeProps {
  onNavClick: (view: 'main' | 'estudiantes' | 'cursos', hash?: string) => void;
}

export const Home = ({ onNavClick }: HomeProps) => {
  return (
    <main>
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <BrainBackground />
        <div className="absolute inset-0 z-[1] bg-gradient-to-b from-white/10 via-transparent to-white pointer-events-none"></div>

        <div className="relative z-10 text-center px-4 max-w-4xl pointer-events-none">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            <h1 className="text-8xl md:text-[10rem] font-display font-bold tracking-tighter text-gray-500 leading-none">
              GIDSYC
            </h1>
            <p className="text-xl md:text-3xl font-light text-gray-500 uppercase tracking-[0.4em] mt-4">
              Semillero de Investigación
            </p>
            <p className="text-sm md:text-lg font-bold text-navy-700 mt-2 bg-navy-100/50 px-4 py-1 rounded-full border border-navy-200 backdrop-blur-sm inline-block">
              Grupo de Investigación y Desarrollo en Sistemas y Computación
            </p>

            <div className="mt-16 flex flex-col md:flex-row items-stretch md:items-center justify-center gap-4 md:gap-6 pointer-events-auto max-w-6xl mx-auto px-4">
              <button
                onClick={() => onNavClick('main', '#proyectos')}
                className="flex-1 md:flex-none md:w-60 px-8 py-4 bg-[#475569] text-white text-base font-bold rounded-full shadow-xl shadow-navy-900/10 hover:-translate-y-2 hover:bg-[#334155] hover:shadow-2xl hover:shadow-navy-900/20 transition-all duration-300 text-center"
              >
                Ver Proyectos
              </button>
              <button
                onClick={() => onNavClick('estudiantes')}
                className="flex-1 md:flex-none md:w-60 px-8 py-4 bg-[#475569] text-white text-base font-bold rounded-full shadow-xl shadow-navy-900/10 hover:-translate-y-2 hover:bg-[#334155] hover:shadow-2xl hover:shadow-navy-900/20 transition-all duration-300 text-center"
              >
                Semilleristas
              </button>
              <button
                onClick={() => onNavClick('main', '#equipo')}
                className="flex-1 md:flex-none md:w-60 px-8 py-4 bg-[#475569] text-white text-base font-bold rounded-full shadow-xl shadow-navy-900/10 hover:-translate-y-2 hover:bg-[#334155] hover:shadow-2xl hover:shadow-navy-900/20 transition-all duration-300 text-center"
              >
                Nuestro Equipo
              </button>
              <button
                onClick={() => onNavClick('cursos')}
                className="flex-1 md:flex-none md:w-60 px-8 py-4 bg-[#475569] text-white text-base font-bold rounded-full shadow-xl shadow-navy-900/10 hover:-translate-y-2 hover:bg-[#334155] hover:shadow-2xl hover:shadow-navy-900/20 transition-all duration-300 text-center"
              >
                Cursos
              </button>
            </div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 pointer-events-none opacity-50">
          <p className="text-[10px] uppercase tracking-[0.3em] font-bold mb-4 text-center text-navy-900">Activa la red pulsando</p>
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="w-6 h-10 border-2 border-navy-900/20 rounded-full flex justify-center pt-2 mx-auto"
          >
            <div className="w-1 h-2 bg-burnt-red-500 rounded-full"></div>
          </motion.div>
        </div>
      </section>

      {/* Feature Section: AI & Neural Networks */}
      <section className="py-24 px-4 md:px-6 bg-gray-50" id="sobre-nosotros">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16">
          <div className="lg:w-1/2 space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-navy-100 border border-navy-200 text-navy-800 text-xs font-bold tracking-widest uppercase">
              <span className="w-2 h-2 rounded-full bg-burnt-red-500 animate-pulse"></span>
              Semillero de Investigación
            </div>

            <div className="space-y-4 text-left">
              <h2 className="text-4xl md:text-6xl font-display font-bold leading-tight text-navy-900">
                Semillero en Inteligencia Artificial
              </h2>
              <p className="text-lg text-gray-600 max-w-xl text-left">
                En nuestro semillero impulsamos la investigación académica avanzada y el desarrollo en inteligencia artificial,
                formando a los futuros líderes en computación.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-8 pt-4">
              {[
                { label: 'Estudiantes', value: '25+' },
                { label: 'Publicaciones', value: '30+' },
                { label: 'Proyectos Activos', value: '3' },
                { label: 'Raíces Unimagdalena', value: '2018' },
              ].map((stat) => (
                <div key={stat.label} className="text-left">
                  <div className="text-3xl font-bold text-navy-900 font-display">{stat.value}</div>
                  <div className="text-xs text-gray-500 uppercase tracking-wider font-bold">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:w-1/2 relative group">
            <div className="absolute -inset-10 bg-blue-100/30 rounded-full blur-[100px] opacity-70 group-hover:opacity-100 transition-opacity duration-1000"></div>
            <div className="relative z-10 p-8 md:p-12 glass-panel shadow-[0_32px_64px_-12px_rgba(31,38,135,0.08)] flex items-center justify-center overflow-hidden border-white/40">
              <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent pointer-events-none"></div>
              <img
                src={FULL_LOGO}
                alt="GIDSYC Logo"
                className="w-full max-w-[400px] h-auto object-contain transform group-hover:scale-105 transition-transform duration-700 drop-shadow-2xl"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Content Grids */}
      <section className="py-24 px-4 md:px-6 bg-white text-gray-900" id="proyectos">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Recent Projects Column */}
          <div className="space-y-8 text-left">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-navy-900 rounded-2xl shadow-lg shadow-navy-900/20">
                <Search className="text-white" size={24} />
              </div>
              <h3 className="text-2xl font-bold font-display uppercase tracking-tight text-navy-900">Proyectos Recientes</h3>
            </div>
            <div className="space-y-4">
              {PROJECTS.map((proj) => (
                <div key={proj.title} className="p-6 bg-slate-50/50 rounded-2xl border border-slate-100 card-hover group">
                  <h4 className="text-lg font-bold mb-2 group-hover:text-accent transition-colors leading-tight text-left">{proj.title}</h4>
                  <p className="text-sm text-slate-500 mb-4 text-left leading-relaxed">{proj.desc}</p>
                  <a
                    href={proj.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex px-4 py-2 bg-white border border-slate-200 text-slate-700 text-xs font-bold rounded-xl hover:border-navy-900 hover:bg-navy-900 hover:text-white transition-all items-center gap-2 shadow-sm"
                  >
                    Leer Más <ChevronRight size={14} />
                  </a>
                </div>
              ))}
            </div>
          </div>

          {/* Team Members Column */}
          <div className="space-y-8 text-left" id="equipo">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-burnt-red-500 rounded-lg shadow-lg shadow-burnt-red-500/20">
                <Users className="text-white" size={24} />
              </div>
              <h3 className="text-2xl font-bold font-display uppercase tracking-tight text-navy-900">Equipo de Trabajo</h3>
            </div>
            <div className="space-y-6">
              {TEAM_MEMBERS.map((member) => (
                <a
                  key={member.name}
                  href={member.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 group hover:bg-gray-50 p-2 rounded-2xl transition-all text-left"
                >
                  <div className="relative">
                    <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-400 group-hover:bg-navy-900 group-hover:text-white transition-all shadow-md">
                      <Users size={32} />
                    </div>
                  </div>
                  <div className="text-left">
                    <h4 className="font-bold text-lg text-navy-900">{member.name}</h4>
                    <p className="text-sm font-semibold text-burnt-red-500 tracking-tight">{member.role}</p>
                    <p className="text-xs text-gray-500">{member.field}</p>
                  </div>
                </a>
              ))}
            </div>
          </div>

          {/* Research Lines Column */}
          <div className="space-y-8 text-left" id="lineas">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-navy-700 rounded-lg shadow-lg shadow-navy-700/20">
                <BookOpen className="text-white" size={24} />
              </div>
              <h3 className="text-2xl font-bold font-display uppercase tracking-tight text-navy-900">Líneas de Investigación</h3>
            </div>
            <div className="space-y-3">
              {[
                'Modelos de razonamiento',
                'Agentes inteligentes y sistemas autónomos de IA',
                'IA eficiente, infraestructura computacional y sostenibilidad energética',
                'IA aplicada a ciencia, ingeniería y datos complejos'
              ].map((linea) => (
                <div key={linea} className="p-4 bg-white border border-gray-100 rounded-xl hover:border-burnt-red-500 hover:translate-x-2 transition-all cursor-default flex items-center gap-3 group text-left">
                  <div className="w-1.5 h-1.5 rounded-full bg-burnt-red-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <h4 className="font-bold text-sm text-gray-700 group-hover:text-navy-900 text-left">{linea}</h4>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-20 bg-slate-50 overflow-hidden relative" id="contacto">
        <div className="absolute inset-0 opacity-[0.02] pointer-events-none">
          <BrainBackground />
        </div>
        <div className="relative z-10 max-w-6xl mx-auto px-4">
          <div className="bg-navy-900 rounded-[2.5rem] p-8 md:p-12 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.15)] border border-white/5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-burnt-red-500/10 to-transparent"></div>
            <div className="flex flex-col lg:flex-row items-center justify-between gap-12 relative z-10">
              <div className="text-left max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/10 text-navy-200 text-[10px] font-bold tracking-widest uppercase mb-4">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                  Comunidad Activa
                </div>
                <h2 className="text-4xl md:text-5xl font-display font-bold text-white tracking-tight leading-tight">
                  Lleva tu curiosidad <br />
                  <span className="text-burnt-red-500">al siguiente nivel</span>
                </h2>
                <p className="text-navy-300 mt-4 text-base md:text-lg leading-relaxed">
                  Conecta con nosotros directamente. Únete a nuestro WhatsApp y colabora con el equipo de investigación GIDSYC.
                </p>
              </div>
              <div className="flex flex-col items-center lg:items-end gap-6 shrink-0">
                <a
                  href="https://chat.whatsapp.com/CCeprVBKvg71rPoFp2NqLp"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-4 bg-white text-navy-900 font-bold px-8 py-5 rounded-2xl transition-all transform hover:-translate-y-1 hover:shadow-xl active:scale-95 group"
                >
                  <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center group-hover:rotate-[360deg] transition-transform duration-700">
                    <Phone size={20} fill="white" className="text-white" />
                  </div>
                  <span className="text-lg">Unirse al grupo</span>
                  <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};
