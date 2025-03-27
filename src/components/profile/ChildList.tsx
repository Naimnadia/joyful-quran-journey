
import { Child } from '@/types';
import { ChildListItem } from './ChildListItem';

interface ChildListProps {
  children: Child[];
  getPerformanceScore: (childId: string) => number;
  onSelectChild: (childId: string) => void;
  onRemoveChild: (childId: string) => void;
}

export const ChildList = ({ children, getPerformanceScore, onSelectChild, onRemoveChild }: ChildListProps) => {
  return (
    <div className="space-y-3 mb-4">
      {children.length > 0 ? (
        children.map(child => (
          <ChildListItem
            key={child.id}
            child={child}
            performanceScore={getPerformanceScore(child.id)}
            onSelect={onSelectChild}
            onRemove={onRemoveChild}
          />
        ))
      ) : (
        <p className="text-center text-gray-500 py-3">Aucun profil ajouté</p>
      )}
    </div>
  );
};
