
import { Award, User } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Child, CompletedDay } from '@/types';

interface BestPerformerCardProps {
  bestPerformer: {
    child: Child;
    score: number;
  } | null;
}

export const BestPerformerCard = ({ bestPerformer }: BestPerformerCardProps) => {
  if (!bestPerformer) return null;
  
  const currentMonthName = format(new Date(), 'MMMM yyyy', { locale: fr });
  
  return (
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
  );
};
