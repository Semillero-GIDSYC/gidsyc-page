import React, { ReactNode } from 'react';
import { Navbar } from '../components/common/Navbar';
import { Footer } from '../components/common/Footer';
import { ViewType } from '../types';

interface MainLayoutProps {
  children: ReactNode;
  activeView: ViewType;
  isMenuOpen: boolean;
  setIsMenuOpen: (open: boolean) => void;
  onNavClick: (view: ViewType, hash?: string) => void;
}

export const MainLayout = ({ 
  children, 
  activeView, 
  isMenuOpen, 
  setIsMenuOpen, 
  onNavClick 
}: MainLayoutProps) => {
  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-navy-900/10">
      <Navbar 
        activeView={activeView} 
        isMenuOpen={isMenuOpen} 
        setIsMenuOpen={setIsMenuOpen} 
        onNavClick={onNavClick} 
      />
      
      {children}
      
      <Footer />
    </div>
  );
};
