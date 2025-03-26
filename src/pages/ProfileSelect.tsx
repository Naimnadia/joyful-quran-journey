
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Shield, Plus, Crown, BookOpen, Mic, Trophy, Medal, Camera, X } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { Child, CompletedDay, Recording } from '@/types';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format, isWithinInterval, startOfMonth, endOfMonth, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

const ProfileSelect = () => {
  const navigate = useNavigate();
  const [children, setChildren] = useLocalStorage<Child[]>('children', []);
  const [completedDays, setCompletedDays] = useLocalStorage<CompletedDay[]>('completedDaysV2', []);
  const [recordings, setRecordings] = useLocalStorage<Recording[]>('recordingsV2', []);
  const [hoveredProfile, setHoveredProfile] = useState<string | null>(null);
  const [showRankings, setShowRankings] = useState(false);
  const [childrenStats, setChildrenStats] = useState<{
    id: string;
    name: string;
    avatar?: string;
    readings: number;
    recordings: number;
    tokens: number;
  }[]>([]);
  
  // Profile picture upload states
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Get current month date range
  const currentDate = new Date();
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const currentMonthName = format(currentDate, 'MMMM yyyy', { locale: fr });

  useEffect(() => {
    // If no children exist, redirect to the children page to add some
    if (children.length === 0) {
      toast.info("Ajoutez d'abord un enfant pour commencer", {
        description: "Vous serez redirigé vers la page de gestion des enfants"
      });
      navigate('/children');
    }

    // Calculate stats for the rankings widget
    if (children.length > 0) {
      const stats = children.map(child => {
        // Get completions for this month only
        const monthlyCompletedDays = completedDays
          .filter(day => day.childId === child.id)
          .filter(day => {
            const date = parseISO(day.date);
            return isWithinInterval(date, { start: monthStart, end: monthEnd });
          });
        
        // Get recordings for this month only
        const monthlyRecordings = recordings
          .filter(rec => rec.childId === child.id)
          .filter(rec => {
            const date = parseISO(rec.date);
            return isWithinInterval(date, { start: monthStart, end: monthEnd });
          });
        
        // Calculate tokens
        const readingTokens = monthlyCompletedDays.length * 1;
        const recordingTokens = monthlyRecordings.length * 2;
        const totalTokens = readingTokens + recordingTokens;
        
        return {
          id: child.id,
          name: child.name,
          avatar: child.avatar,
          readings: monthlyCompletedDays.length,
          recordings: monthlyRecordings.length,
          tokens: totalTokens
        };
      });
      
      // Sort stats by tokens (highest first)
      const sortedStats = [...stats].sort((a, b) => b.tokens - a.tokens);
      setChildrenStats(sortedStats);
    }
  }, [children, completedDays, recordings, navigate, monthStart, monthEnd]);

  const handleProfileSelect = (childId: string) => {
    navigate(`/home?childId=${childId}`);
  };

  const handleAddProfile = () => {
    navigate('/children');
  };

  const handleManageProfiles = () => {
    navigate('/children');
  };

  const getRankBadge = (index: number) => {
    if (index === 0) return <Trophy className="text-yellow-500" size={18} />;
    if (index === 1) return <Medal className="text-gray-400" size={18} />;
    if (index === 2) return <Medal className="text-amber-700" size={18} />;
    return <span className="text-gray-500 font-medium ml-1">#{index + 1}</span>;
  };

  // Handle opening the upload dialog
  const handleOpenUploadDialog = (childId: string) => {
    setSelectedChildId(childId);
    setPreviewUrl(children.find(child => child.id === childId)?.avatar || null);
    setUploadDialogOpen(true);
  };

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (limit to 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error("L'image est trop grande", {
        description: "La taille maximum est de 2MB"
      });
      return;
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      toast.error("Format de fichier non supporté", {
        description: "Veuillez sélectionner une image"
      });
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Handle save profile picture
  const handleSaveAvatar = () => {
    if (!selectedChildId || !previewUrl) return;

    // Update the child's avatar in storage
    setChildren(prevChildren => 
      prevChildren.map(child => 
        child.id === selectedChildId 
          ? { ...child, avatar: previewUrl } 
          : child
      )
    );

    toast.success("Photo de profil mise à jour !");
    setUploadDialogOpen(false);
    setSelectedChildId(null);
    setPreviewUrl(null);
  };

  // Handle remove profile picture
  const handleRemoveAvatar = () => {
    if (!selectedChildId) return;

    // Remove the avatar from the child
    setChildren(prevChildren => 
      prevChildren.map(child => 
        child.id === selectedChildId 
          ? { ...child, avatar: undefined } 
          : child
      )
    );

    toast.success("Photo de profil supprimée");
    setUploadDialogOpen(false);
    setSelectedChildId(null);
    setPreviewUrl(null);
  };

  return (
    <div className="min-h-screen w-full flex flex-col justify-center items-center bg-gradient-to-b from-theme-blue/5 to-theme-purple/5">
      <div className="mb-8 text-center">
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-theme-blue to-theme-purple bg-clip-text text-transparent">
          Daily Coran
        </h1>
        <p className="mt-3 text-xl text-gray-600">Qui va lire aujourd'hui ?</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl w-full px-4">
        <div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-6">
            {children.map((child) => (
              <div
                key={child.id}
                className="flex flex-col items-center"
                onMouseEnter={() => setHoveredProfile(child.id)}
                onMouseLeave={() => setHoveredProfile(null)}
              >
                <div className="relative w-full aspect-square mb-3">
                  <button
                    onClick={() => handleProfileSelect(child.id)}
                    className="group w-full h-full transition-all duration-200 ease-in-out"
                  >
                    <div className={cn(
                      "absolute inset-0 rounded-md overflow-hidden border-4 transition-all duration-300",
                      hoveredProfile === child.id 
                        ? "border-theme-purple/80 shadow-xl scale-105" 
                        : "border-transparent"
                    )}>
                      <div className="bg-gradient-to-br from-theme-blue/20 to-theme-purple/20 w-full h-full flex items-center justify-center rounded-md overflow-hidden">
                        {child.avatar ? (
                          <img 
                            src={child.avatar} 
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
                  
                  {/* Edit profile picture button */}
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenUploadDialog(child.id);
                    }}
                    className="absolute bottom-2 right-2 bg-theme-purple text-white p-1.5 rounded-full shadow-md hover:bg-theme-purple/90 transition-colors z-10"
                    title="Modifier la photo de profil"
                  >
                    <Camera size={16} />
                  </button>
                </div>
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
            className="border-gray-300 text-gray-600 hover:bg-gray-100 w-full"
            onClick={handleManageProfiles}
          >
            <Shield className="mr-2 h-4 w-4" />
            Gérer les profils
          </Button>
        </div>

        {/* Rankings Widget */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-md overflow-hidden">
          <div className="bg-gradient-to-r from-theme-blue/90 to-theme-purple/90 px-6 py-4 text-white">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Trophy size={20} />
                Classement du mois
              </h2>
              <span className="text-sm opacity-80">{currentMonthName}</span>
            </div>
          </div>
          
          <div className="p-4">
            {childrenStats.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[60px]">Rang</TableHead>
                    <TableHead>Nom</TableHead>
                    <TableHead className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <BookOpen size={14} />
                        <span>Lectures</span>
                      </div>
                    </TableHead>
                    <TableHead className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Mic size={14} />
                        <span>Enreg.</span>
                      </div>
                    </TableHead>
                    <TableHead className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Crown size={14} className="text-yellow-500" />
                        <span>Total</span>
                      </div>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {childrenStats.map((stat, index) => (
                    <TableRow key={stat.id} className={index < 3 ? "font-medium" : ""}>
                      <TableCell className="py-2">
                        <div className="flex items-center justify-center">
                          {getRankBadge(index)}
                        </div>
                      </TableCell>
                      <TableCell className="py-2">
                        <div className="flex items-center gap-2">
                          {stat.avatar ? (
                            <Avatar className="w-6 h-6">
                              <AvatarImage src={stat.avatar} alt={stat.name} />
                              <AvatarFallback>
                                <User size={16} className="text-theme-purple/70" />
                              </AvatarFallback>
                            </Avatar>
                          ) : (
                            <User size={16} className="text-theme-purple/70" />
                          )}
                          <span>{stat.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right py-2">{stat.readings}</TableCell>
                      <TableCell className="text-right py-2">{stat.recordings}</TableCell>
                      <TableCell className="text-right py-2 font-bold">{stat.tokens}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <Trophy size={40} className="text-gray-300 mb-2" />
                <p className="text-gray-500">Commencez à lire et enregistrer pour apparaître dans le classement</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Profile Picture Upload Dialog */}
      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Photo de profil</DialogTitle>
            <DialogDescription>
              Téléchargez une photo pour personnaliser le profil
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex flex-col items-center justify-center gap-4 py-4">
            <div className="relative w-32 h-32 rounded-full overflow-hidden bg-gray-100 border-2 border-gray-200">
              {previewUrl ? (
                <img 
                  src={previewUrl} 
                  alt="Preview" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-100">
                  <User size={64} className="text-gray-400" />
                </div>
              )}
            </div>
            
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="profile-picture">Sélectionner une image</Label>
              <Input
                id="profile-picture"
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleFileSelect}
                className="cursor-pointer"
              />
            </div>
            
            <div className="flex gap-3 mt-2">
              <Button
                onClick={handleSaveAvatar}
                disabled={!previewUrl}
                variant="outline"
                className="border-theme-purple text-theme-purple hover:bg-theme-purple/10"
              >
                Enregistrer
              </Button>
              
              {previewUrl && (
                <Button
                  onClick={handleRemoveAvatar}
                  variant="outline"
                  className="border-red-500 text-red-500 hover:bg-red-500/10"
                >
                  <X className="mr-2 h-4 w-4" />
                  Supprimer
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProfileSelect;
