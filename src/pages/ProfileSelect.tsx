
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, UserPlus, Trash2, Award, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { Child, CompletedDay } from '@/types';
import { Button } from '@/components/ui/button';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { syncData } from '@/lib/supabase';

const ProfileSelect = () => {
  const navigate = useNavigate();
  const [children, setChildren] = useLocalStorage<Child[]>('children', []);
  const [completedDays, setCompletedDays] = useLocalStorage<CompletedDay[]>('completedDaysV2', []);
  const [newChildName, setNewChildName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  
  // Sync with Supabase on component mount
  useEffect(() => {
    const syncWithSupabase = async () => {
      try {
        setIsLoading(true);
        const syncedChildren = await syncData<Child>('children', children);
        const syncedCompletedDays = await syncData<CompletedDay>('completed_days', completedDays);
        
        setChildren(syncedChildren);
        setCompletedDays(syncedCompletedDays);
      } catch (error) {
        console.error('Error syncing data with Supabase:', error);
        toast.error('Erreur de synchronisation des données');
      } finally {
        setIsLoading(false);
      }
    };
    
    syncWithSupabase();
  }, []);
  
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  const getPerformanceScore = (childId: string) => {
    return completedDays.filter(day => {
      const date = new Date(day.date);
      return day.childId === childId && 
             date.getMonth() === currentMonth && 
             date.getFullYear() === currentYear;
    }).length;
  };
  
  const getBestPerformer = () => {
    if (children.length === 0) return null;
    
    let bestChild = children[0];
    let highestScore = getPerformanceScore(bestChild.id);
    
    children.forEach(child => {
      const score = getPerformanceScore(child.id);
      if (score > highestScore) {
        highestScore = score;
        bestChild = child;
      }
    });
    
    return highestScore > 0 ? { child: bestChild, score: highestScore } : null;
  };
  
  const bestPerformer = getBestPerformer();
  
  const handleAddChild = async () => {
    if (!newChildName.trim()) {
      toast.error("Veuillez entrer un nom");
      return;
    }
    
    const newChild: Child = {
      id: uuidv4(),
      name: newChildName.trim(),
      createdAt: new Date().toISOString()
    };
    
    const updatedChildren = [...children, newChild];
    setChildren(updatedChildren);
    setNewChildName('');
    
    try {
      // Save to Supabase
      await syncData<Child>('children', updatedChildren);
      toast.success(`${newChildName} a été ajouté avec succès`);
    } catch (error) {
      console.error('Error saving child to Supabase:', error);
      toast.error(`Erreur lors de l'ajout de ${newChildName}`);
    }
  };
  
  const handleRemoveChild = async (childId: string) => {
    const updatedChildren = children.filter(child => child.id !== childId);
    const updatedCompletedDays = completedDays.filter(day => day.childId !== childId);
    
    setChildren(updatedChildren);
    setCompletedDays(updatedCompletedDays);
    
    try {
      // Save to Supabase
      await syncData<Child>('children', updatedChildren);
      await syncData<CompletedDay>('completed_days', updatedCompletedDays);
      toast.success("Enfant supprimé avec succès");
    } catch (error) {
      console.error('Error removing child from Supabase:', error);
      toast.error("Erreur lors de la suppression");
    }
  };
  
  const handleSelectChild = (childId: string) => {
    navigate(`/home?childId=${childId}`);
  };
  
  const currentMonthName = format(new Date(), 'MMMM yyyy', { locale: fr });
  
  // Redirect to home if there's only one child
  useEffect(() => {
    if (!isLoading && children.length === 1) {
      navigate(`/home?childId=${children[0].id}`);
    }
  }, [children, navigate, isLoading]);
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-purple-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-theme-purple border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-theme-purple font-medium">Synchronisation des données...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen p-4 bg-gradient-to-b from-blue-50 to-purple-50 flex flex-col items-center justify-center">
      <div className="container max-w-md mx-auto space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-theme-purple mb-2">Lecture Quotidienne</h1>
          <p className="text-gray-600">Sélectionnez un profil pour commencer</p>
        </div>
        
        {bestPerformer && (
          <div className="glass-card rounded-2xl p-4 animate-fade-in">
            <div className="flex items-center mb-3">
              <Award size={20} className="text-theme-amber mr-2" />
              <h2 className="text-lg font-medium">Meilleur lecteur - {currentMonthName}</h2>
            </div>
            
            <div className="flex items-center p-3 bg-white/50 rounded-xl">
              <div className="w-10 h-10 bg-theme-purple/20 text-theme-purple rounded-full flex items-center justify-center mr-3">
                <User size={20} />
              </div>
              <div className="flex-1">
                <h3 className="font-medium">{bestPerformer.child.name}</h3>
                <p className="text-sm text-gray-600">{bestPerformer.score} jours de lecture ce mois-ci</p>
              </div>
              <div className="flex justify-center items-center w-8 h-8 bg-theme-amber/20 text-theme-amber rounded-full">
                <Award size={16} />
              </div>
            </div>
          </div>
        )}
        
        <div className="glass-card rounded-2xl p-4 animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <User size={20} className="text-theme-purple mr-2" />
              <h2 className="text-lg font-medium">Profils</h2>
            </div>
          </div>
          
          <div className="space-y-3 mb-4">
            {children.length > 0 ? (
              children.map(child => (
                <div key={child.id} className="flex items-center justify-between p-3 bg-white/50 rounded-xl">
                  <div className="flex items-center flex-1" onClick={() => handleSelectChild(child.id)}>
                    <div className="w-10 h-10 bg-theme-blue/20 text-theme-blue rounded-full flex items-center justify-center mr-3">
                      <User size={20} />
                    </div>
                    <div>
                      <h3 className="font-medium">{child.name}</h3>
                      <p className="text-xs text-gray-500">
                        {getPerformanceScore(child.id)} jours de lecture ce mois-ci
                      </p>
                    </div>
                  </div>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <button className="p-2 text-red-500 hover:bg-red-100 rounded-full transition-colors">
                        <Trash2 size={18} />
                      </button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Supprimer {child.name} ?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Cette action ne peut pas être annulée. Toutes les données associées à cet enfant seront supprimées.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleRemoveChild(child.id)}
                          className="bg-red-500 hover:bg-red-600"
                        >
                          Supprimer
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                  
                  <button 
                    className="ml-2 p-2 text-theme-blue hover:bg-theme-blue/10 rounded-full transition-colors"
                    onClick={() => handleSelectChild(child.id)}
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 py-3">Aucun profil ajouté</p>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={newChildName}
              onChange={(e) => setNewChildName(e.target.value)}
              placeholder="Nom de l'enfant"
              className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-theme-purple"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleAddChild();
                }
              }}
            />
            <Button
              variant="default"
              onClick={handleAddChild}
              className="flex items-center"
            >
              <UserPlus size={18} className="mr-2" />
              Ajouter
            </Button>
          </div>
        </div>
        
        <div className="flex justify-center mt-4">
          <Button
            variant="outline"
            onClick={() => navigate('/dashboard')}
          >
            Tableau de bord
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProfileSelect;
