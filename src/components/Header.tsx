
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Book, Mic, Users, ArrowLeft, BarChart3, Gift } from 'lucide-react';

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isHomePage = location.pathname === '/home';
  const isRecordPage = location.pathname.includes('/record');
  const isChildrenPage = location.pathname === '/children';
  const isDashboardPage = location.pathname === '/dashboard';
  const isGiftsPage = location.pathname === '/gifts';

  const handleReturnToProfiles = () => {
    // Direct navigation to root path instead of using the event
    navigate('/');
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-card px-4 py-3 mx-4 mt-4 rounded-2xl animate-fade-in">
      <div className="flex items-center justify-between">
        {isHomePage ? (
          <h1 className="text-2xl font-bold text-theme-purple">Daily Coran</h1>
        ) : (
          <button 
            onClick={handleReturnToProfiles}
            className="flex items-center text-theme-purple hover:text-theme-purple-light transition-colors"
          >
            <ArrowLeft className="mr-2" size={20} />
            <span className="font-medium">Retour</span>
          </button>
        )}
        
        {isHomePage && (
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
        
        {isRecordPage && (
          <div className="flex items-center">
            <Mic size={20} className="text-theme-purple mr-2" />
            <h2 className="font-medium">Enregistrer</h2>
          </div>
        )}
        
        {isChildrenPage && (
          <div className="flex items-center">
            <Users size={20} className="text-theme-purple mr-2" />
            <h2 className="font-medium">Gestion des enfants</h2>
          </div>
        )}
        
        {isDashboardPage && (
          <div className="flex items-center">
            <BarChart3 size={20} className="text-theme-purple mr-2" />
            <h2 className="font-medium">Tableau de bord</h2>
          </div>
        )}
        
        {isGiftsPage && (
          <div className="flex items-center">
            <Gift size={20} className="text-theme-purple mr-2" />
            <h2 className="font-medium">Gestion des cadeaux</h2>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
