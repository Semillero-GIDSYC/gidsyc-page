import { BookOpen, ExternalLink, FileText, Layers, Users } from 'lucide-react';
import { RESEARCH_LINES } from '../data/researchLines';

export const ResearchLinesPage = () => {
  return (
    <main className="min-h-screen pt-32 pb-24 px-4 md:px-6 bg-[#F8F9FD] border-t border-gray-100">
      <div className="max-w-6xl mx-auto space-y-12">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">
          <div className="flex items-start gap-4 text-left">
            <div className="p-4 bg-white/70 backdrop-blur-sm rounded-2xl shadow-sm border border-slate-100">
              <BookOpen className="text-accent" size={28} />
            </div>
            <div className="text-left">
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-navy-900">
                Publicaciones por línea de investigación
              </h2>
              <p className="text-slate-500 font-medium italic mt-2 max-w-2xl">
                Producción académica del equipo GIDSYC organizada según los focos actuales del semillero.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 lg:w-[420px]">
            {RESEARCH_LINES.map((line) => (
              <a
                key={line.id}
                href={`#${line.id}`}
                className="px-4 py-3 bg-white border border-slate-100 rounded-2xl text-xs font-bold text-slate-600 hover:text-navy-900 hover:border-navy-300 transition-all text-left"
              >
                {line.title}
              </a>
            ))}
          </div>
        </div>

        <div className="space-y-10">
          {RESEARCH_LINES.map((line) => (
            <section
              key={line.id}
              id={line.id}
              className="scroll-mt-32 bg-white rounded-[2rem] p-6 md:p-8 border border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.03)] text-left"
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-navy-900 flex items-center justify-center shrink-0">
                    <Layers className="text-white" size={22} />
                  </div>
                  <div>
                    <h3 className="text-2xl md:text-3xl font-bold text-navy-900 leading-tight">
                      {line.title}
                    </h3>
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mt-1">
                      {line.publications.length} publicaciones
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 space-y-5">
                {[...line.publications].sort((a, b) => b.year - a.year).map((publication) => (
                  <article
                    key={`${line.id}-${publication.title}`}
                    className="p-5 md:p-6 rounded-2xl border border-slate-100 bg-slate-50/60 hover:bg-white hover:border-slate-200 transition-all text-left"
                  >
                    <div className="flex items-start gap-3">
                      <div className="hidden sm:flex w-10 h-10 rounded-xl bg-white border border-slate-100 items-center justify-center shrink-0">
                        <FileText className="text-slate-500" size={18} />
                      </div>
                      <div className="space-y-4">
                        <div>
                          <h4 className="text-lg md:text-xl font-bold text-navy-900 leading-snug">
                            <a
                              href={publication.doi ? `https://doi.org/${publication.doi}` : `/publications/${publication.slug}.html`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover:text-accent transition-colors"
                            >
                              {publication.title}
                            </a>
                          </h4>
                          <p className="text-sm text-slate-600 leading-relaxed mt-2">
                            {publication.citation}
                          </p>
                        </div>

                        <div className="flex flex-col lg:flex-row lg:items-center gap-4 justify-between">
                          <div className="flex items-start gap-2 text-slate-500">
                            <Users size={16} className="mt-0.5 shrink-0" />
                            <p className="text-xs leading-relaxed">
                              <span className="font-bold text-slate-700">Coautor(es) del equipo:</span>{' '}
                              {publication.teamAuthors}.
                            </p>
                          </div>
                          <a
                            href={publication.googleScholarUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-navy-900 hover:border-navy-900 hover:text-white transition-all shrink-0"
                          >
                            Google Scholar: búsqueda <ExternalLink size={14} />
                          </a>
                          <a
                            href={`/publications/${publication.slug}.html`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-navy-900 hover:border-navy-900 hover:text-white transition-all shrink-0"
                          >
                            Ficha Scholar <ExternalLink size={14} />
                          </a>
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
};
