import { GraduationCap, Users } from 'lucide-react';
import { useStudents } from '../hooks/useStudents';

export const StudentsPage = () => {
  const { students, loading, error } = useStudents();

  return (
    <main className="min-h-screen pt-32 pb-24 px-4 md:px-6 bg-gray-50 border-t border-gray-100">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-white rounded-xl shadow-lg shadow-gray-200/50 border border-gray-200">
            <GraduationCap className="text-gray-700" size={32} />
          </div>
          <div className="text-left">
            <h2 className="text-4xl font-bold font-display uppercase tracking-tight text-navy-900">Estudiantes</h2>
            <p className="text-gray-500 font-medium italic">Miembros activos del semillero de investigación GIDSYC.</p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-navy-900/10 border-t-navy-900 rounded-full animate-spin"></div>
          </div>
        ) : error ? (
          <div className="text-center py-20 text-red-500 font-medium">
            {error}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {students.map((student, idx) => (
              <div 
                key={idx} 
                className="p-6 bg-white border border-slate-100 rounded-2xl card-hover cursor-default flex items-center gap-4 group text-left"
              >
                <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center shrink-0 group-hover:bg-navy-900 transition-all duration-500 shadow-sm">
                  <Users size={24} className="text-slate-400 group-hover:text-white transition-colors" />
                </div>
                <div className="text-left">
                  <h4 className="font-bold text-lg text-slate-800 group-hover:text-navy-900 transition-colors">{student.name}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="status-dot">
                      <span className="status-dot-ring"></span>
                      <span className="status-dot-inner"></span>
                    </span>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{student.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
};
