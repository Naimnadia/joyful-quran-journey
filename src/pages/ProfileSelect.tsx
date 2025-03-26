
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Shield, Plus, Crown } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { Child } from '@/types';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const ProfileSelect = () => {
  const navigate = useNavigate();
  const [children, setChildren] = useLocalStorage<Child[]>('children', []);
  const [hoveredProfile, setHoveredProfile] = useState<string | null>(null);

  useEffect(() => {
    // If no children exist, redirect to the children page to add some
    if (children.length === 0) {
      toast.info("Ajoutez d'abord un enfant pour commencer", {
        description: "Vous serez redirigé vers la page de gestion des enfants"
      });
      navigate('/children');
    }
  }, [children, navigate]);

  const handleProfileSelect = (childId: string) => {
    navigate(`/?childId=${childId}`);
  };

  const handleAddProfile = () => {
    navigate('/children');
  };

  const handleManageProfiles = () => {
    navigate('/children');
  };

  return (
    <div className="min-h-screen w-full flex flex-col justify-center items-center bg-gradient-to-b from-theme-blue/5 to-theme-purple/5">
      <div className="mb-12 text-center">
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-theme-blue to-theme-purple bg-clip-text text-transparent">
          Daily Coran
        </h1>
        <p className="mt-3 text-xl text-gray-600">Qui va lire aujourd'hui ?</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-12 max-w-4xl w-full px-4">
        {children.map((child) => (
          <div
            key={child.id}
            className="flex flex-col items-center"
            onMouseEnter={() => setHoveredProfile(child.id)}
            onMouseLeave={() => setHoveredProfile(null)}
          >
            <button
              onClick={() => handleProfileSelect(child.id)}
              className="group relative w-full aspect-square mb-3 transition-all duration-200 ease-in-out"
            >
              <div className={cn(
                "absolute inset-0 rounded-md overflow-hidden border-4 transition-all duration-300",
                hoveredProfile === child.id 
                  ? "border-theme-purple/80 shadow-xl scale-105" 
                  : "border-transparent"
              )}>
                <div className="bg-gradient-to-br from-theme-blue/20 to-theme-purple/20 w-full h-full flex items-center justify-center rounded-md overflow-hidden">
                  {child.avatarUrl ? (
                    <img 
                      src={child.avatarUrl} 
                      alt={child.name} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-theme-blue/30 to-theme-purple/30 flex items-center justify-center">
                      <User size={72} className="text-white/80" />
                    </div>
                  )}
                </div>
              </div>
              {hoveredProfile === child.id && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-md">
                  <Button
                    variant="default"
                    size="lg"
                    className="bg-white text-theme-purple hover:bg-white/90"
                  >
                    Sélectionner
                  </Button>
                </div>
              )}
            </button>
            <span className="text-lg font-medium text-gray-800">{child.name}</span>
          </div>
        ))}

        {/* Add Profile Button */}
        <div className="flex flex-col items-center">
          <button
            onClick={handleAddProfile}
            className="w-full aspect-square mb-3 rounded-md border-4 border-dashed border-gray-300 hover:border-theme-purple/60 transition-all duration-200 flex items-center justify-center bg-gray-100/50 hover:bg-gray-100"
          >
            <Plus size={48} className="text-gray-400 hover:text-theme-purple/60" />
          </button>
          <span className="text-lg font-medium text-gray-600">Ajouter un profil</span>
        </div>
      </div>

      <Button
        variant="outline"
        size="lg"
        className="border-gray-300 text-gray-600 hover:bg-gray-100"
        onClick={handleManageProfiles}
      >
        <Shield className="mr-2 h-4 w-4" />
        Gérer les profils
      </Button>
    </div>
  );
};

export default ProfileSelect;
