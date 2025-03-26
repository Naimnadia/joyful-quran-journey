
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Book, Mic, Users, ArrowLeft, BarChart3, Gift, Menu } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useState } from 'react';

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [menuOpen, setMenuOpen] = useState(false);
  
  const isHomePage = location.pathname === '/home';
  const isRecordPage = location.pathname.includes('/record');
  const isChildrenPage = location.pathname === '/children';
  const isDashboardPage = location.pathname === '/dashboard';
  const isGiftsPage = location.pathname === '/gifts';

  const handleBackNavigation = () => {
    // Use window.location for a full page reload and navigation to root
    window.location.href = '/';
  };
  
  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-card px-4 py-3 mx-4 mt-4 rounded-2xl animate-fade-in">
      <div className="flex items-center justify-between">
        {isHomePage ? (
          <h1 className="text-xl md:text-2xl font-bold text-theme-purple">Daily Coran</h1>
        ) : (
          <button 
            onClick={handleBackNavigation}
            className="flex items-center text-theme-purple hover:text-theme-purple-light transition-colors"
          >
            <ArrowLeft className="mr-2" size={isMobile ? 18 : 20} />
            <span className="font-medium">{isMobile ? '' : 'Retour'}</span>
          </button>
        )}
        
        {isHomePage && !isMobile && (
          <nav className="flex space-x-1">
            <Link 
              to="/" 
              className="p-2 rounded-xl transition-colors hover:bg-theme-purple-light/20"
              aria-label="Home"
            >
              <Book size={20} className="text-theme-purple" />
            </Link>
            <Link 
              to="/record" 
              className="p-2 rounded-xl transition-colors hover:bg-theme-purple-light/20"
              aria-label="Record"
            >
              <Mic size={20} className="text-theme-purple" />
            </Link>
            <Link 
              to="/children" 
              className="p-2 rounded-xl transition-colors hover:bg-theme-purple-light/20"
              aria-label="Children"
            >
              <Users size={20} className="text-theme-purple" />
            </Link>
            <Link 
              to="/dashboard" 
              className="p-2 rounded-xl transition-colors hover:bg-theme-purple-light/20"
              aria-label="Dashboard"
            >
              <BarChart3 size={20} className="text-theme-purple" />
            </Link>
            <Link 
              to="/gifts" 
              className="p-2 rounded-xl transition-colors hover:bg-theme-purple-light/20"
              aria-label="Gifts"
            >
              <Gift size={20} className="text-theme-purple" />
            </Link>
          </nav>
        )}
        
        {isHomePage && isMobile && (
          <button 
            onClick={toggleMenu}
            className="p-2 rounded-xl transition-colors hover:bg-theme-purple-light/20"
            aria-label="Menu"
          >
            <Menu size={20} className="text-theme-purple" />
          </button>
        )}
        
        {isRecordPage && (
          <div className="flex items-center">
            <Mic size={isMobile ? 18 : 20} className="text-theme-purple mr-2" />
            <h2 className="font-medium text-sm md:text-base">Enregistrer</h2>
          </div>
        )}
        
        {isChildrenPage && (
          <div className="flex items-center">
            <Users size={isMobile ? 18 : 20} className="text-theme-purple mr-2" />
            <h2 className="font-medium text-sm md:text-base">Gestion des enfants</h2>
          </div>
        )}
        
        {isDashboardPage && (
          <div className="flex items-center">
            <BarChart3 size={isMobile ? 18 : 20} className="text-theme-purple mr-2" />
            <h2 className="font-medium text-sm md:text-base">Tableau de bord</h2>
          </div>
        )}
        
        {isGiftsPage && (
          <div className="flex items-center">
            <Gift size={isMobile ? 18 : 20} className="text-theme-purple mr-2" />
            <h2 className="font-medium text-sm md:text-base">Gestion des cadeaux</h2>
          </div>
        )}
      </div>
      
      {/* Mobile menu */}
      {isHomePage && isMobile && menuOpen && (
        <nav className="mt-3 pt-3 border-t border-theme-purple/10 grid grid-cols-5 gap-2 animate-fade-in">
          <Link 
            to="/" 
            className="flex flex-col items-center p-2 rounded-xl transition-colors hover:bg-theme-purple-light/20"
            aria-label="Home"
            onClick={() => setMenuOpen(false)}
          >
            <Book size={20} className="text-theme-purple mb-1" />
            <span className="text-xs text-theme-purple">Accueil</span>
          </Link>
          <Link 
            to="/record" 
            className="flex flex-col items-center p-2 rounded-xl transition-colors hover:bg-theme-purple-light/20"
            aria-label="Record"
            onClick={() => setMenuOpen(false)}
          >
            <Mic size={20} className="text-theme-purple mb-1" />
            <span className="text-xs text-theme-purple">Enreg.</span>
          </Link>
          <Link 
            to="/children" 
            className="flex flex-col items-center p-2 rounded-xl transition-colors hover:bg-theme-purple-light/20"
            aria-label="Children"
            onClick={() => setMenuOpen(false)}
          >
            <Users size={20} className="text-theme-purple mb-1" />
            <span className="text-xs text-theme-purple">Enfants</span>
          </Link>
          <Link 
            to="/dashboard" 
            className="flex flex-col items-center p-2 rounded-xl transition-colors hover:bg-theme-purple-light/20"
            aria-label="Dashboard"
            onClick={() => setMenuOpen(false)}
          >
            <BarChart3 size={20} className="text-theme-purple mb-1" />
            <span className="text-xs text-theme-purple">Stats</span>
          </Link>
          <Link 
            to="/gifts" 
            className="flex flex-col items-center p-2 rounded-xl transition-colors hover:bg-theme-purple-light/20"
            aria-label="Gifts"
            onClick={() => setMenuOpen(false)}
          >
            <Gift size={20} className="text-theme-purple mb-1" />
            <span className="text-xs text-theme-purple">Cadeaux</span>
          </Link>
        </nav>
      )}
    </header>
  );
};

export default Header;
