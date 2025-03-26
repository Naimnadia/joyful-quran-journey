import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, UserPlus, Trash2, Award, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { Child, CompletedDay, Recording } from '@/types';
import Header from '@/components/Header';
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

const Children = () => {
  const navigate = useNavigate();
  const [children, setChildren] = useLocalStorage<Child[]>('children', []);
  const [completedDays, setCompletedDays] = useLocalStorage<CompletedDay[]>('completedDaysV2', []);
  const [recordings, setRecordings] = useLocalStorage<Recording[]>('recordingsV2', []);
  const [newChildName, setNewChildName] = useState('');
  
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
  
  const handleAddChild = () => {
    if (!newChildName.trim()) {
      toast.error("Veuillez entrer un nom");
      return;
    }
    
    const newChild: Child = {
      id: uuidv4(),
      name: newChildName.trim(),
      createdAt: new Date().toISOString()
    };
    
    setChildren([...children, newChild]);
    setNewChildName('');
    toast.success(`${newChildName} a été ajouté avec succès`);
  };
  
  const handleRemoveChild = (childId: string) => {
    setChildren(children.filter(child => child.id !== childId));
    setCompletedDays(completedDays.filter(day => day.childId !== childId));
    const updatedRecordings = recordings.map(recording => {
      if (recording.childId === childId) {
        const { childId, ...rest } = recording;
        return rest;
      }
      return recording;
    });
    setRecordings(updatedRecordings);
    toast.success("Enfant supprimé avec succès");
  };
  
  const handleSelectChild = (childId: string) => {
    navigate(`/?childId=${childId}`);
  };
  
  const currentMonthName = format(new Date(), 'MMMM yyyy', { locale: fr });
  
  return (
    <div className="min-h-screen pt-24 pb-10 px-4 bg-gradient-to-b from-blue-50 to-purple-50">
      <Header />
      
      <div className="container max-w-md mx-auto space-y-6">
        <div className="glass-card rounded-2xl p-4 animate-fade-in">
          <div className="flex items-center mb-3">
            <Award size={20} className="text-theme-amber mr-2" />
            <h2 className="text-lg font-medium">Meilleur lecteur - {currentMonthName}</h2>
          </div>
          
          {bestPerformer ? (
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
          ) : (
            <p className="text-sm text-gray-600 italic">Aucune lecture enregistrée ce mois-ci</p>
          )}
        </div>
        
        <div className="glass-card rounded-2xl p-4 animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <User size={20} className="text-theme-purple mr-2" />
              <h2 className="text-lg font-medium">Mes enfants</h2>
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
              <p className="text-center text-gray-500 py-3">Aucun enfant ajouté</p>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={newChildName}
              onChange={(e) => setNewChildName(e.target.value)}
              placeholder="Nom de l'enfant"
              className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-theme-purple"
            />
            <Button
              variant="default"
              className="flex items-center"
              onClick={handleAddChild}
            >
              <UserPlus size={18} className="mr-2" />
              Ajouter
            </Button>
          </div>
        </div>
        
        <div className="flex justify-center">
          <Button
            variant="outline"
            onClick={() => navigate('/')}
          >
            Retour à l'accueil
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Children;
