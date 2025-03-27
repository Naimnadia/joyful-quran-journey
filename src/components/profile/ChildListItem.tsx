
import { User, Trash2, ChevronRight } from 'lucide-react';
import { Child } from '@/types';
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

interface ChildListItemProps {
  child: Child;
  performanceScore: number;
  onSelect: (childId: string) => void;
  onRemove: (childId: string) => void;
}

export const ChildListItem = ({ child, performanceScore, onSelect, onRemove }: ChildListItemProps) => {
  return (
    <div className="flex items-center justify-between p-3 bg-white/50 rounded-xl">
      <div className="flex items-center flex-1" onClick={() => onSelect(child.id)}>
        <div className="w-10 h-10 bg-theme-blue/20 text-theme-blue rounded-full flex items-center justify-center mr-3">
          <User size={20} />
        </div>
        <div>
          <h3 className="font-medium">{child.name}</h3>
          <p className="text-xs text-gray-500">
            {performanceScore} jours de lecture ce mois-ci
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
              onClick={() => onRemove(child.id)}
              className="bg-red-500 hover:bg-red-600"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      <button 
        className="ml-2 p-2 text-theme-blue hover:bg-theme-blue/10 rounded-full transition-colors"
        onClick={() => onSelect(child.id)}
      >
        <ChevronRight size={18} />
      </button>
    </div>
  );
};
