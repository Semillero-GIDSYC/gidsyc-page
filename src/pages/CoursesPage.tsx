import { BookOpen, GraduationCap, Clock, BarChart, Layers, ChevronRight } from 'lucide-react';
import { COURSES } from '../data/courses';
import { AudioPlayer } from '../features/courses/AudioPlayer';

export const CoursesPage = () => {
  return (
    <main className="min-h-screen pt-32 pb-24 px-4 md:px-6 bg-[#F8F9FD] border-t border-gray-100">
      <div className="max-w-5xl mx-auto space-y-12">
        <div className="flex items-center gap-4 mb-2">
          <div className="p-4 bg-white/50 backdrop-blur-sm rounded-2xl shadow-sm border border-slate-100">
            <BookOpen className="text-accent" size={28} />
          </div>
          <div className="text-left">
            <h2 className="text-4xl font-bold tracking-tight text-navy-900">Nuestros Cursos</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="status-dot">
                <span className="status-dot-ring"></span>
                <span className="status-dot-inner"></span>
              </span>
              <p className="text-slate-500 font-medium italic">Explora nuestras últimas investigaciones y materiales educativos.</p>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {COURSES.map((curso, idx) => (
            <div 
              key={idx} 
              className="bg-white rounded-[2.5rem] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.03)] border border-slate-50 flex flex-col md:flex-row gap-8 items-stretch group card-hover text-left"
            >
              <div className="md:w-[320px] shrink-0 relative rounded-3xl overflow-hidden shadow-2xl bg-white border border-slate-100/50 group-hover:shadow-blue-200/20 transition-all duration-500">
                <img
                  src={curso.image}
                  alt={curso.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                />
              </div>

              <div className="flex-1 flex flex-col pt-2 text-left">
                <div className="flex items-start justify-between mb-4">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center">
                        <GraduationCap className="text-gray-600" size={20} />
                      </div>
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{curso.category}</span>
                    </div>
                    <h3 className="text-3xl font-bold text-navy-900 leading-tight tracking-tight text-left">
                      {curso.name}
                    </h3>
                    <p className="text-gray-500 text-sm leading-relaxed max-w-xl text-left">
                      {curso.desc}
                    </p>
                  </div>
                </div>

                <AudioPlayer src={curso.audio} />

                <div className="pt-6 border-t border-slate-50 flex flex-wrap items-center justify-between gap-6">
                  <div className="flex items-center gap-8 text-left">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-slate-400">
                        <Clock size={14} />
                        <span className="text-[10px] font-bold uppercase tracking-wider">{curso.duration}</span>
                      </div>
                      <p className="text-[10px] text-slate-300 font-medium px-5">Duración</p>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-slate-400">
                        <BarChart size={14} />
                        <span className="text-[10px] font-bold uppercase tracking-wider">{curso.level}</span>
                      </div>
                      <p className="text-[10px] text-slate-300 font-medium px-5">Nivel</p>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-slate-400">
                        <Layers size={14} />
                        <span className="text-[10px] font-bold uppercase tracking-wider">{curso.lessons}</span>
                      </div>
                      <p className="text-[10px] text-slate-300 font-medium px-5">Contenido</p>
                    </div>
                  </div>

                  <a
                    href={curso.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-8 py-3 bg-navy-900 text-white text-xs font-bold rounded-2xl hover:bg-black transition-all shadow-lg shadow-navy-900/10 flex items-center gap-2 active:scale-95"
                  >
                    Ir al curso <ChevronRight size={14} />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
};
