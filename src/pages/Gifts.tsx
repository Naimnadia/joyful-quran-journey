
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Gift as GiftIcon, Coins, Upload, Trash2, Plus, ArrowLeft, Edit, Save } from 'lucide-react';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { toast } from 'sonner';
import { Gift } from '@/types';
import { v4 as uuidv4 } from 'uuid';
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
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const Gifts = () => {
  const navigate = useNavigate();
  const [gifts, setGifts] = useLocalStorage<Gift[]>('gifts', []);
  const [newGiftName, setNewGiftName] = useState('');
  const [newGiftDescription, setNewGiftDescription] = useState('');
  const [newGiftTokenCost, setNewGiftTokenCost] = useState(10);
  const [newGiftImage, setNewGiftImage] = useState<string | undefined>(undefined);
  const [editingGiftId, setEditingGiftId] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Find the gift being edited
  const editingGift = editingGiftId 
    ? gifts.find(gift => gift.id === editingGiftId) 
    : null;

  // Set up editing state when selecting a gift to edit
  const startEditingGift = (gift: Gift) => {
    setEditingGiftId(gift.id);
    setNewGiftName(gift.name);
    setNewGiftDescription(gift.description);
    setNewGiftTokenCost(gift.tokenCost);
    setNewGiftImage(gift.imageSrc);
  };

  // Reset the form
  const resetForm = () => {
    setNewGiftName('');
    setNewGiftDescription('');
    setNewGiftTokenCost(10);
    setNewGiftImage(undefined);
    setEditingGiftId(null);
  };

  // Handle image file upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (2MB max)
    if (file.size > 2 * 1024 * 1024) {
      toast.error("L'image est trop grande", {
        description: "Veuillez choisir une image de moins de 2Mo"
      });
      return;
    }

    // Read the file as a data URL
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setNewGiftImage(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  // Delete a gift
  const deleteGift = (giftId: string) => {
    setGifts(gifts.filter(gift => gift.id !== giftId));
    toast.success("Cadeau supprimé avec succès");
    
    // If we're editing the gift that was just deleted, reset the form
    if (editingGiftId === giftId) {
      resetForm();
    }
  };

  // Save a new gift or update an existing one
  const saveGift = () => {
    // Validate inputs
    if (!newGiftName.trim()) {
      toast.error("Nom du cadeau requis");
      return;
    }

    if (!newGiftDescription.trim()) {
      toast.error("Description du cadeau requise");
      return;
    }

    if (newGiftTokenCost <= 0) {
      toast.error("Le coût en tokens doit être positif");
      return;
    }

    if (editingGiftId) {
      // Update existing gift
      setGifts(gifts.map(gift => 
        gift.id === editingGiftId
          ? {
              ...gift,
              name: newGiftName,
              description: newGiftDescription,
              tokenCost: newGiftTokenCost,
              imageSrc: newGiftImage
            }
          : gift
      ));
      toast.success("Cadeau mis à jour avec succès");
    } else {
      // Create new gift
      const newGift: Gift = {
        id: uuidv4(),
        name: newGiftName,
        description: newGiftDescription,
        tokenCost: newGiftTokenCost,
        imageSrc: newGiftImage
      };
      setGifts([...gifts, newGift]);
      toast.success("Nouveau cadeau ajouté");
    }

    resetForm();
  };

  return (
    <div className="min-h-screen pt-24 pb-10 px-4 bg-gradient-to-b from-blue-50 to-purple-50">
      <Header />
      
      <div className="container max-w-md mx-auto space-y-6">
        <div className="flex items-center justify-between animate-fade-in">
          <Button 
            variant="secondary" 
            onClick={() => navigate('/')}
            leftIcon={<ArrowLeft size={18} />}
          >
            Retour
          </Button>
          <h1 className="text-xl font-bold text-theme-purple">Gérer les Cadeaux</h1>
        </div>
        
        {/* Gift Form */}
        <div className="glass-card rounded-2xl p-4 animate-scale-in">
          <h2 className="text-lg font-medium mb-4">
            {editingGiftId ? "Modifier le cadeau" : "Ajouter un cadeau"}
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Nom du cadeau</label>
              <input
                type="text"
                value={newGiftName}
                onChange={(e) => setNewGiftName(e.target.value)}
                className="w-full p-2 border rounded-md"
                placeholder="Livre, jouet, sortie..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                value={newGiftDescription}
                onChange={(e) => setNewGiftDescription(e.target.value)}
                className="w-full p-2 border rounded-md"
                rows={3}
                placeholder="Description du cadeau..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Coût en tokens</label>
              <input
                type="number"
                value={newGiftTokenCost}
                onChange={(e) => setNewGiftTokenCost(parseInt(e.target.value) || 0)}
                className="w-full p-2 border rounded-md"
                min="1"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Image</label>
              <div className="flex items-center space-x-2">
                <Button
                  variant="secondary"
                  onClick={() => fileInputRef.current?.click()}
                  leftIcon={<Upload size={18} />}
                >
                  {newGiftImage ? "Changer l'image" : "Ajouter une image"}
                </Button>
                {newGiftImage && (
                  <Button
                    variant="outline"
                    onClick={() => setNewGiftImage(undefined)}
                    leftIcon={<Trash2 size={18} />}
                  >
                    Supprimer
                  </Button>
                )}
              </div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                className="hidden"
                accept="image/*"
              />
              
              {newGiftImage && (
                <div className="mt-3 relative w-full h-40 rounded-lg overflow-hidden">
                  <img
                    src={newGiftImage}
                    alt="Aperçu du cadeau"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>
            
            <div className="flex justify-end space-x-2">
              {editingGiftId && (
                <Button
                  variant="secondary"
                  onClick={resetForm}
                >
                  Annuler
                </Button>
              )}
              <Button
                variant="primary"
                onClick={saveGift}
                leftIcon={editingGiftId ? <Save size={18} /> : <Plus size={18} />}
              >
                {editingGiftId ? "Mettre à jour" : "Ajouter"}
              </Button>
            </div>
          </div>
        </div>
        
        {/* Gift List */}
        <div className="glass-card rounded-2xl p-4 animate-scale-in">
          <h2 className="text-lg font-medium mb-4">Liste des cadeaux</h2>
          
          {gifts.length === 0 ? (
            <div className="text-center py-6 text-gray-500">
              <GiftIcon size={32} className="mx-auto mb-2 text-gray-400" />
              <p>Aucun cadeau disponible</p>
              <p className="text-sm">Ajoutez des cadeaux à partir du formulaire ci-dessus</p>
            </div>
          ) : (
            <div className="space-y-4">
              {gifts.map((gift) => (
                <div 
                  key={gift.id} 
                  className="border rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-bold">{gift.name}</h3>
                        <Badge 
                          variant="outline" 
                          className="flex items-center gap-1 bg-theme-amber text-white"
                        >
                          <span>{gift.tokenCost}</span>
                          <Coins size={14} />
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{gift.description}</p>
                      
                      {gift.assignedToChildId && (
                        <div className="text-xs text-theme-purple mb-2">
                          <span className="font-medium">Assigné à un enfant</span>
                        </div>
                      )}
                    </div>
                    
                    {gift.imageSrc && (
                      <div className="w-16 h-16 rounded overflow-hidden ml-2 flex-shrink-0">
                        <img 
                          src={gift.imageSrc} 
                          alt={gift.name} 
                          className="w-full h-full object-cover" 
                        />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex justify-end mt-2 space-x-2">
                    <Button
                      variant="secondary"
                      onClick={() => startEditingGift(gift)}
                      leftIcon={<Edit size={16} />}
                      size="sm"
                    >
                      Modifier
                    </Button>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          leftIcon={<Trash2 size={16} />}
                          size="sm"
                          className="text-red-500 border-red-500 hover:bg-red-50"
                        >
                          Supprimer
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Êtes-vous sûr?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Cette action ne peut pas être annulée. Ce cadeau sera définitivement supprimé.
                            {gift.assignedToChildId && (
                              <p className="mt-2 text-red-500 font-medium">
                                Attention: Ce cadeau est assigné à un enfant.
                              </p>
                            )}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Annuler</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deleteGift(gift.id)}
                            className={cn(
                              "bg-red-500 text-white hover:bg-red-600"
                            )}
                          >
                            Supprimer
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Gifts;
