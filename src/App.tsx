import { useState } from 'react';
import { MainLayout } from './layouts/MainLayout';
import { Home } from './pages/Home';
import { StudentsPage } from './pages/StudentsPage';
import { CoursesPage } from './pages/CoursesPage';
import { ResearchLinesPage } from './pages/ResearchLinesPage';
import { ViewType } from './types';

export default function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeView, setActiveView] = useState<ViewType>('main');

  const handleNavClick = (view: ViewType, hash?: string) => {
    setActiveView(view);
    setIsMenuOpen(false);

    if (view === 'main' && hash === '#') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (hash) {
      setTimeout(() => {
        const el = document.querySelector(hash);
        if (el) {
          const y = el.getBoundingClientRect().top + window.scrollY - 80;
          window.scrollTo({ top: y, behavior: 'smooth' });
        }
      }, 100);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const renderView = () => {
    switch (activeView) {
      case 'estudiantes':
        return <StudentsPage />;
      case 'cursos':
        return <CoursesPage />;
      case 'lineas':
        return <ResearchLinesPage />;
      case 'main':
      default:
        return <Home onNavClick={handleNavClick} />;
    }
  };

  return (
    <MainLayout
      activeView={activeView}
      isMenuOpen={isMenuOpen}
      setIsMenuOpen={setIsMenuOpen}
      onNavClick={handleNavClick}
    >
      {renderView()}
    </MainLayout>
  );
}
