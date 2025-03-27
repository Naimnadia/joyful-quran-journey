
import { useState } from 'react';
import { UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface AddChildFormProps {
  onAddChild: (name: string) => void;
}

export const AddChildForm = ({ onAddChild }: AddChildFormProps) => {
  const [newChildName, setNewChildName] = useState('');
  
  const handleSubmit = () => {
    if (newChildName.trim()) {
      onAddChild(newChildName);
      setNewChildName('');
    }
  };
  
  return (
    <div className="flex items-center space-x-2">
      <Input
        type="text"
        value={newChildName}
        onChange={(e) => setNewChildName(e.target.value)}
        placeholder="Nom de l'enfant"
        className="flex-1 focus:ring-theme-purple"
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            handleSubmit();
          }
        }}
      />
      <Button
        variant="default"
        onClick={handleSubmit}
        className="bg-theme-blue hover:bg-theme-blue-light whitespace-nowrap"
      >
        <UserPlus size={18} className="mr-2" />
        Ajouter
      </Button>
    </div>
  );
};
