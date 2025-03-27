
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, UserPlus } from 'lucide-react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { Child, CompletedDay } from '@/types';
import { Button } from '@/components/ui/button';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';
import { syncData } from '@/lib/supabase';
import { BestPerformerCard } from '@/components/profile/BestPerformerCard';
import { ChildList } from '@/components/profile/ChildList';
import { AddChildForm } from '@/components/profile/AddChildForm';
import { useGlobalState } from '@/hooks/useGlobalState';
import { Skeleton } from '@/components/ui/skeleton';

const ProfileSelect = () => {
  const navigate = useNavigate();
  const { state } = useGlobalState();
  const [children, setChildren] = useLocalStorage<Child[]>('children', []);
  const [completedDays, setCompletedDays] = useLocalStorage<CompletedDay[]>('completedDaysV2', []);
  const [isLoading, setIsLoading] = useState(true);
  
  // Handle initial loading
  useEffect(() => {
    if (state.isInitialized) {
      const timeoutId = setTimeout(() => {
        setIsLoading(false);
      }, 500);
      
      return () => clearTimeout(timeoutId);
    }
  }, [state.isInitialized]);
  
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
  
  const handleAddChild = async (newChildName: string) => {
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
    
    try {
      toast.success(`${newChildName} a été ajouté avec succès`);
    } catch (error) {
      console.error('Error saving child:', error);
      toast.error(`Erreur lors de l'ajout de ${newChildName}`);
    }
  };
  
  const handleRemoveChild = async (childId: string) => {
    const updatedChildren = children.filter(child => child.id !== childId);
    const updatedCompletedDays = completedDays.filter(day => day.childId !== childId);
    
    setChildren(updatedChildren);
    setCompletedDays(updatedCompletedDays);
    
    try {
      toast.success("Enfant supprimé avec succès");
    } catch (error) {
      console.error('Error removing child:', error);
      toast.error("Erreur lors de la suppression");
    }
  };
  
  const handleSelectChild = (childId: string) => {
    navigate(`/home?childId=${childId}`);
  };
  
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
        
        {isLoading ? (
          <div className="glass-card rounded-2xl p-4">
            <Skeleton className="h-24 w-full mb-4" />
          </div>
        ) : (
          <BestPerformerCard bestPerformer={bestPerformer} />
        )}
        
        <div className="glass-card rounded-2xl p-4 animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <User size={20} className="text-theme-purple mr-2" />
              <h2 className="text-lg font-medium">Profils</h2>
            </div>
          </div>
          
          {isLoading ? (
            <div className="space-y-3 mb-4">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          ) : (
            <ChildList 
              children={children} 
              getPerformanceScore={getPerformanceScore}
              onSelectChild={handleSelectChild}
              onRemoveChild={handleRemoveChild}
            />
          )}
          
          <AddChildForm onAddChild={handleAddChild} />
        </div>
        
        <div className="flex justify-center mt-4">
          <Button
            variant="outline"
            onClick={() => navigate('/dashboard')}
            className="min-w-[160px]"
          >
            Tableau de bord
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProfileSelect;
