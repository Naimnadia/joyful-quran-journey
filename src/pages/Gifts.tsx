import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { Gift, Child } from '@/types';
import { Button } from '@/components/ui/button';
import GiftCard from '@/components/GiftCard';
import { 
  ChevronLeft, 
  PlusCircle, 
  X, 
  Gift as GiftIcon,
  Trash2,
  ArrowLeftRight
} from 'lucide-react';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { syncData } from '@/lib/supabase';

export default function Gifts() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Get childId from query params
  const childId = searchParams.get('childId');
  
  // Get gifts, children, and edit mode state
  const [gifts, setGifts] = useLocalStorage<Gift[]>('gifts', []);
  const [children, setChildren] = useLocalStorage<Child[]>('children', []);
  const [editMode, setEditMode] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  
  // Find the current child
  const [currentChild, setCurrentChild] = useState<Child | undefined>(undefined);
  
  useEffect(() => {
    if (childId) {
      const child = children.find(c => c.id === childId);
      setCurrentChild(child);
    } else {
      setCurrentChild(undefined);
    }
  }, [childId, children]);
  
  // Calculate child's tokens
  const childTokens = currentChild ? 
    gifts.filter(gift => gift.assignedToChildId === currentChild.id).length * 10 : 0;
  
  // Gift form state
  const [giftName, setGiftName] = useState('');
  const [giftDescription, setGiftDescription] = useState('');
  const [giftCost, setGiftCost] = useState(10);
  const [giftImage, setGiftImage] = useState('');
  
  const [selectedGiftId, setSelectedGiftId] = useState<string | null>(null);
  
  // Sync with Supabase on component mount
  useEffect(() => {
    const syncWithSupabase = async () => {
      try {
        const syncedGifts = await syncData<Gift>('gifts', gifts);
        setGifts(syncedGifts);
      } catch (error) {
        console.error('Error syncing gifts with Supabase:', error);
        toast.error('Erreur de synchronisation des récompenses');
      }
    };
    
    syncWithSupabase();
  }, []);
  
  const handleCreateGift = async () => {
    if (!giftName.trim() || !giftDescription.trim()) {
      toast.error("Veuillez remplir tous les champs");
      return;
    }
    
    const newGift: Gift = {
      id: uuidv4(),
      name: giftName.trim(),
      description: giftDescription.trim(),
      tokenCost: giftCost,
      imageSrc: giftImage.trim() || null,
      assignedToChildId: null
    };
    
    const updatedGifts = [...gifts, newGift];
    setGifts(updatedGifts);
    setIsAddDialogOpen(false);
    
    setGiftName('');
    setGiftDescription('');
    setGiftCost(10);
    setGiftImage('');
    
    try {
      // Save to Supabase
      await syncData<Gift>('gifts', updatedGifts);
      toast.success(`${newGift.name} a été ajouté avec succès`);
    } catch (error) {
      console.error('Error saving gift to Supabase:', error);
      toast.error(`Erreur lors de l'ajout de ${newGift.name}`);
    }
  };
  
  const handleAssignGift = async (giftId: string) => {
    if (!currentChild) {
      toast.error("Veuillez sélectionner un enfant");
      return;
    }
    
    const giftToAssign = gifts.find(gift => gift.id === giftId);
    
    if (!giftToAssign) {
      toast.error("Récompense non trouvée");
      return;
    }
    
    if (childTokens < giftToAssign.tokenCost) {
      toast.error("Pas assez de jetons");
      return;
    }
    
    const updatedGifts = gifts.map(gift =>
      gift.id === giftId ? { ...gift, assignedToChildId: currentChild.id } : gift
    );
    
    setGifts(updatedGifts);
    
    try {
      // Save to Supabase
      await syncData<Gift>('gifts', updatedGifts);
      toast.success(`${giftToAssign.name} a été attribué à ${currentChild.name}`);
    } catch (error) {
      console.error('Error assigning gift to Supabase:', error);
      toast.error(`Erreur lors de l'attribution de ${giftToAssign.name}`);
    }
  };
  
  const handleDeleteGift = async (giftId: string) => {
    setSelectedGiftId(giftId);
  };
  
  const confirmDeleteGift = async () => {
    if (!selectedGiftId) return;
    
    const updatedGifts = gifts.filter(gift => gift.id !== selectedGiftId);
    setGifts(updatedGifts);
    setSelectedGiftId(null);
    
    try {
      // Save to Supabase
      await syncData<Gift>('gifts', updatedGifts);
      toast.success("Récompense supprimée avec succès");
    } catch (error) {
      console.error('Error removing gift from Supabase:', error);
      toast.error("Erreur lors de la suppression");
    }
  };
  
  const cancelDeleteGift = () => {
    setSelectedGiftId(null);
  };
  
  const displayName = currentChild ? `${currentChild.name}` : 'Récompenses';
  
  const filteredGifts = currentChild ?
    gifts.filter(gift => gift.assignedToChildId === null || gift.assignedToChildId === currentChild.id) :
    gifts;
  
  return (
    <div className="min-h-screen p-4 bg-gradient-to-b from-blue-50 to-purple-50">
      <div className="container max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => currentChild ? navigate(`/home?childId=${currentChild.id}`) : navigate('/')}
            className="flex items-center"
          >
            <ChevronLeft className="mr-2" size={20} />
            Retour
          </Button>
          
          <h1 className="text-2xl font-bold text-theme-purple">Récompenses</h1>
          
          <Button
            variant="secondary"
            onClick={() => setEditMode(!editMode)}
          >
            {editMode ? <X className="mr-2" size={20} /> : <PlusCircle className="mr-2" size={20} />}
            {editMode ? 'Terminer' : 'Gérer'}
          </Button>
        </div>
        
        {currentChild && (
          <div className="flex justify-between items-center bg-white/60 p-4 rounded-xl shadow-sm">
            <div>
              <h2 className="font-medium text-theme-purple">Jetons disponibles</h2>
              <p className="text-2xl font-bold">{childTokens} jetons</p>
            </div>
            
            <Button
              variant="outline"
              onClick={() => navigate(`/home?childId=${currentChild.id}`)}
            >
              <ArrowLeftRight className="mr-2" size={18} />
              Retour à la lecture
            </Button>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {editMode && (
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <button className="bg-white/60 border-2 border-dashed border-gray-300 rounded-xl h-48 flex flex-col items-center justify-center p-4 text-gray-500 hover:bg-white/80 transition-colors">
                  <PlusCircle size={40} className="mb-2 text-theme-purple" />
                  <span>Ajouter une récompense</span>
                </button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Créer une récompense</DialogTitle>
                  <DialogDescription>
                    Ajoutez une nouvelle récompense que les enfants pourront gagner.
                  </DialogDescription>
                </DialogHeader>
                
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="gift-name">Nom</Label>
                    <Input
                      id="gift-name"
                      value={giftName}
                      onChange={(e) => setGiftName(e.target.value)}
                      placeholder="ex: Sortie au parc"
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="gift-description">Description</Label>
                    <Input
                      id="gift-description"
                      value={giftDescription}
                      onChange={(e) => setGiftDescription(e.target.value)}
                      placeholder="ex: Une après-midi au parc d'attractions"
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="gift-cost">Coût en jetons</Label>
                    <Input
                      id="gift-cost"
                      type="number"
                      min={1}
                      value={giftCost}
                      onChange={(e) => setGiftCost(parseInt(e.target.value))}
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="gift-image">Image URL (optionnel)</Label>
                    <Input
                      id="gift-image"
                      value={giftImage}
                      onChange={(e) => setGiftImage(e.target.value)}
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                </div>
                
                <DialogFooter>
                  <Button
                    variant="secondary"
                    onClick={() => setIsAddDialogOpen(false)}
                    size="sm"
                  >
                    <X size={16} className="mr-2" />
                    Annuler
                  </Button>
                  
                  <Button
                    variant="default"
                    onClick={handleCreateGift}
                    className="bg-theme-purple text-white"
                  >
                    <GiftIcon size={16} className="mr-2" />
                    Créer
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
          
          {filteredGifts.map((gift) => (
            <GiftCard
              key={gift.id}
              gift={gift}
              onAssign={currentChild ? () => handleAssignGift(gift.id) : undefined}
              onDelete={editMode ? () => handleDeleteGift(gift.id) : undefined}
              isAssigned={gift.assignedToChildId === (currentChild?.id || null)}
              canAfford={currentChild ? childTokens >= gift.tokenCost : false}
              editMode={editMode}
            />
          ))}
        </div>
        
        {filteredGifts.length === 0 && !editMode && (
          <div className="text-center bg-white/60 p-6 rounded-xl mt-8">
            <GiftIcon size={48} className="mx-auto text-gray-400 mb-2" />
            <h3 className="text-xl font-medium text-gray-600">Pas de récompenses disponibles</h3>
            <p className="text-gray-500 mb-4">Ajoutez des récompenses dans le mode édition.</p>
            <Button
              variant="outline"
              onClick={() => setEditMode(true)}
              className="mx-auto"
            >
              <PlusCircle size={16} className="mr-2" />
              Gérer les récompenses
            </Button>
          </div>
        )}
      </div>
      
      <AlertDialog open={!!selectedGiftId} onOpenChange={() => selectedGiftId ? cancelDeleteGift() : null}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer la récompense ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action ne peut pas être annulée. La récompense sera supprimée.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelDeleteGift}>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteGift} className="bg-red-500 hover:bg-red-600">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
