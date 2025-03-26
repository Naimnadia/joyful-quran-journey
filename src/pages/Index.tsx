
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { format, parseISO, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay } from 'date-fns';
import { Mic, Coins, BookOpen, Star, User, ChevronDown, Gift, Settings, Calendar as CalendarIcon, BarChart3 } from 'lucide-react';
import Header from '@/components/Header';
import Calendar from '@/components/Calendar';
import Token from '@/components/Token';
import GiftCard from '@/components/GiftCard';
import Button from '@/components/UI/Button';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { toast } from 'sonner';
import { Child, CompletedDay, Recording, TokenType, Gift as GiftType } from '@/types';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const Index = () => {
  const navigate = useNavigate();
  const query = useQuery();
  const childIdFromURL = query.get('childId');
  
  const [children, setChildren] = useLocalStorage<Child[]>('children', []);
  const [completedDays, setCompletedDays] = useLocalStorage<CompletedDay[]>('completedDaysV2', []);
  const [recordings, setRecordings] = useLocalStorage<Recording[]>('recordingsV2', []);
  const [oldCompletedDays, setOldCompletedDays] = useLocalStorage<string[]>('completedDays', []);
  const [oldRecordings, setOldRecordings] = useLocalStorage<{ date: string, audioUrl: string }[]>('recordings', []);
  
  const [gifts, setGifts] = useLocalStorage<GiftType[]>('gifts', [
    {
      id: 'gift-1',
      name: 'Livre islamique',
      description: 'Un livre adapté à l\'âge de l\'enfant sur l\'Islam',
      tokenCost: 15,
      imageSrc: 'https://images.unsplash.com/photo-1589998059171-988d887df646?q=80&w=500&auto=format'
    },
    {
      id: 'gift-2',
      name: 'Sortie familiale',
      description: 'Une sortie au parc ou au musée de votre choix',
      tokenCost: 25,
      imageSrc: 'https://images.unsplash.com/photo-1608889825103-eb5ed706fc64?q=80&w=500&auto=format'
    },
    {
      id: 'gift-3',
      name: 'Jeu éducatif',
      description: 'Un jeu de société sur les valeurs islamiques',
      tokenCost: 35,
      imageSrc: 'https://images.unsplash.com/photo-1632501641765-e568d28b0015?q=80&w=500&auto=format'
    },
    {
      id: 'gift-4',
      name: 'Cadeau surprise',
      description: 'Un cadeau spécial pour récompenser les efforts',
      tokenCost: 50,
      imageSrc: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=500&auto=format'
    }
  ]);
  
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);
  
  useEffect(() => {
    if (oldCompletedDays.length > 0 && completedDays.length === 0 && children.length > 0) {
      const defaultChildId = children[0].id;
      
      const migratedDays = oldCompletedDays.map(date => ({
        date,
        childId: defaultChildId
      }));
      
      setCompletedDays(migratedDays);
      
      const migratedRecordings = oldRecordings.map(rec => ({
        ...rec,
        childId: defaultChildId
      }));
      
      setRecordings(migratedRecordings);
      
      setOldCompletedDays([]);
      setOldRecordings([]);
      
      toast.success("Données migrées avec succès");
    }
  }, [children, oldCompletedDays, oldRecordings, completedDays]);
  
  useEffect(() => {
    if (childIdFromURL) {
      const childExists = children.some(child => child.id === childIdFromURL);
      if (childExists) {
        setSelectedChildId(childIdFromURL);
      } else if (children.length > 0) {
        setSelectedChildId(children[0].id);
      }
    } else if (children.length > 0 && !selectedChildId) {
      setSelectedChildId(children[0].id);
    }
  }, [childIdFromURL, children, selectedChildId]);
  
  if (children.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="pt-24 pb-10 px-4">
          <Header />
          
          <div className="container max-w-md mx-auto mt-12">
            <Card className="border-none shadow-xl bg-white/80 backdrop-blur-md animate-fade-in">
              <CardHeader className="text-center pb-2">
                <User size={60} className="text-theme-purple mx-auto mb-2" />
                <CardTitle className="text-2xl font-bold">Bienvenue sur Daily Coran</CardTitle>
                <CardDescription className="text-gray-600">
                  Pour commencer, ajoutez un enfant pour suivre sa progression quotidienne.
                </CardDescription>
              </CardHeader>
              <CardFooter className="pt-2 pb-6 flex justify-center">
                <Button
                  variant="primary"
                  size="lg"
                  fullWidth
                  onClick={() => navigate('/children')}
                  className="rounded-xl shadow-md hover:shadow-lg transition-all"
                >
                  Ajouter un enfant
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    );
  }
  
  const [tokens, setTokens] = useLocalStorage<TokenType[]>('tokens', [
    {
      id: 'token-10',
      title: '10 tokens',
      icon: 'coins',
      description: 'Gagner 10 tokens',
      unlocked: false,
      value: 10
    },
    {
      id: 'token-20',
      title: '20 tokens',
      icon: 'coins',
      description: 'Gagner 20 tokens',
      unlocked: false,
      value: 20
    },
    {
      id: 'token-30',
      title: '30 tokens',
      icon: 'coins',
      description: 'Gagner 30 tokens',
      unlocked: false,
      value: 30
    },
    {
      id: 'token-40',
      title: '40 tokens',
      icon: 'coins',
      description: 'Gagner 40 tokens',
      unlocked: false,
      value: 40
    },
    {
      id: 'token-50',
      title: '50 tokens',
      icon: 'coins',
      description: 'Gagner 50 tokens',
      unlocked: false,
      value: 50
    }
  ]);

  const [streak, setStreak] = useState(0);
  const [totalReadings, setTotalReadings] = useState(0);
  const [totalRecordings, setTotalRecordings] = useState(0);
  const [totalTokens, setTotalTokens] = useState(0);
  
  const childCompletedDays = completedDays
    .filter(day => day.childId === selectedChildId)
    .map(day => day.date);
  
  const childRecordings = recordings
    .filter(rec => rec.childId === selectedChildId)
    .map(rec => rec.date);
  
  useEffect(() => {
    if (!selectedChildId) return;
    
    setTotalReadings(childCompletedDays.length);
    setTotalRecordings(childRecordings.length);
    
    const sortedDays = [...childCompletedDays].sort((a, b) => {
      return new Date(b).getTime() - new Date(a).getTime();
    });
    
    let currentStreak = 0;
    
    const today = format(new Date(), 'yyyy-MM-dd');
    const isTodayCompleted = sortedDays.some(day => day === today);
    
    const startDate = isTodayCompleted ? new Date() : new Date(Date.now() - 86400000);
    
    for (let i = 0; i < sortedDays.length; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(currentDate.getDate() - i);
      const formattedDate = format(currentDate, 'yyyy-MM-dd');
      
      if (sortedDays.includes(formattedDate)) {
        currentStreak++;
      } else {
        break;
      }
    }
    
    setStreak(currentStreak);
    
    const readingTokens = childCompletedDays.length * 1;
    const recordingTokens = childRecordings.length * 2;
    
    const hasCompletedPerfectWeek = checkForPerfectWeek(childCompletedDays, childRecordings);
    const perfectWeekBonus = hasCompletedPerfectWeek ? 5 : 0;
    
    const calculatedTotalTokens = readingTokens + recordingTokens + perfectWeekBonus;
    setTotalTokens(calculatedTotalTokens);
    
    const updatedTokens = [...tokens];
    
    if (calculatedTotalTokens >= 10) {
      updatedTokens.find(t => t.id === 'token-10')!.unlocked = true;
    }
    
    if (calculatedTotalTokens >= 20) {
      updatedTokens.find(t => t.id === 'token-20')!.unlocked = true;
    }
    
    if (calculatedTotalTokens >= 30) {
      updatedTokens.find(t => t.id === 'token-30')!.unlocked = true;
    }
    
    if (calculatedTotalTokens >= 40) {
      updatedTokens.find(t => t.id === 'token-40')!.unlocked = true;
    }
    
    if (calculatedTotalTokens >= 50) {
      updatedTokens.find(t => t.id === 'token-50')!.unlocked = true;
    }
    
    if (JSON.stringify(updatedTokens) !== JSON.stringify(tokens)) {
      setTokens(updatedTokens);
    }
  }, [childCompletedDays, childRecordings, tokens, setTokens, selectedChildId]);
  
  const checkForPerfectWeek = (completedDays: string[], recordings: string[]): boolean => {
    const today = new Date();
    const startOfCurrentWeek = startOfWeek(today, { weekStartsOn: 1 });
    const endOfCurrentWeek = endOfWeek(today, { weekStartsOn: 1 });
    
    const daysInWeek = eachDayOfInterval({
      start: startOfCurrentWeek,
      end: endOfCurrentWeek
    });
    
    for (const day of daysInWeek) {
      const formattedDay = format(day, 'yyyy-MM-dd');
      
      const dayCompleted = completedDays.some(completedDay => 
        completedDay === formattedDay
      );
      
      const dayRecorded = recordings.some(recordedDay => 
        recordedDay === formattedDay
      );
      
      if (!dayCompleted || !dayRecorded) {
        return false;
      }
    }
    
    return true;
  };
  
  const markTodayAsCompleted = () => {
    if (!selectedChildId) return;
    
    const today = format(new Date(), 'yyyy-MM-dd');
    const dayAlreadyCompleted = completedDays.some(
      day => day.date === today && day.childId === selectedChildId
    );
    
    if (!dayAlreadyCompleted) {
      setCompletedDays([...completedDays, { date: today, childId: selectedChildId }]);
      toast.success("Jour marqué comme lu", {
        description: "Bravo ! Continuez votre engagement quotidien.",
      });
    } else {
      toast.info("Jour déjà marqué comme lu", {
        description: "Ce jour est déjà marqué comme lu.",
      });
    }
  };
  
  const recordToday = () => {
    if (!selectedChildId) return;
    
    const today = format(new Date(), 'yyyy-MM-dd');
    navigate(`/record/${today}?childId=${selectedChildId}`);
  };
  
  const selectedChild = children.find(child => child.id === selectedChildId);
  const unlockedTokensCount = tokens.filter(t => t.unlocked).length;
  
  const assignGiftToChild = (giftId: string, childId: string) => {
    setGifts(prev => prev.map(gift => 
      gift.id === giftId 
        ? { ...gift, assignedToChildId: childId } 
        : gift
    ));
    toast.success("Cadeau assigné à l'enfant !");
  };
  
  const assignedGifts = gifts.filter(gift => gift.assignedToChildId);
  const unassignedGifts = gifts.filter(gift => !gift.assignedToChildId);
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="pt-24 pb-10 px-4">
        <Header />
        
        <div className="container max-w-xl mx-auto space-y-6">
          {children.length > 1 && (
            <div className="flex justify-center animate-fade-in mt-2">
              <div className="glass-card bg-white/70 rounded-full px-4 py-2 inline-flex items-center shadow-md">
                <User size={18} className="text-theme-purple mr-2" />
                <select
                  value={selectedChildId || ''}
                  onChange={(e) => {
                    setSelectedChildId(e.target.value);
                    navigate(`/?childId=${e.target.value}`);
                  }}
                  className="bg-transparent border-none text-theme-purple font-medium focus:outline-none pr-8"
                >
                  {children.map(child => (
                    <option key={child.id} value={child.id}>{child.name}</option>
                  ))}
                </select>
                <ChevronDown size={16} className="text-theme-purple ml-1 -mr-6" />
              </div>
            </div>
          )}
          
          <div className="flex flex-col md:flex-row gap-4 animate-fade-in">
            <div className="flex-1">
              <Card className="shadow-lg border-none bg-white/80 backdrop-blur-md h-full">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-medium flex items-center">
                    <CalendarIcon size={18} className="text-theme-blue mr-2" />
                    Calendrier de lecture
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Calendar 
                    completedDays={childCompletedDays}
                    recordedDays={childRecordings}
                  />
                </CardContent>
              </Card>
            </div>
            
            <div className="flex-1">
              <Card className="shadow-lg border-none bg-white/80 backdrop-blur-md h-full">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-medium flex items-center">
                    <BarChart3 size={18} className="text-theme-purple mr-2" />
                    Statistiques
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-3 text-center shadow-sm">
                      <div className="text-theme-blue text-2xl font-bold">{streak}</div>
                      <div className="text-xs text-gray-600">Jours consécutifs</div>
                    </div>
                    
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-3 text-center shadow-sm">
                      <div className="text-theme-purple text-2xl font-bold">{totalReadings}</div>
                      <div className="text-xs text-gray-600">Lectures totales</div>
                    </div>
                    
                    <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-3 text-center shadow-sm">
                      <div className="text-theme-amber text-2xl font-bold">{totalTokens}</div>
                      <div className="text-xs text-gray-600">Tokens gagnés</div>
                    </div>
                    
                    <div className="bg-gradient-to-br from-teal-50 to-teal-100 rounded-xl p-3 text-center shadow-sm">
                      <div className="text-theme-teal text-2xl font-bold">{totalRecordings}</div>
                      <div className="text-xs text-gray-600">Enregistrements</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
          
          <div className="flex gap-3 animate-slide-in">
            <Button 
              variant="primary" 
              fullWidth
              leftIcon={<BookOpen size={18} />}
              onClick={markTodayAsCompleted}
              className="shadow-md hover:shadow-lg transition-all"
            >
              Marquer comme lu
            </Button>
            
            <Button 
              variant="secondary" 
              fullWidth
              leftIcon={<Mic size={18} />}
              onClick={recordToday}
              className="shadow-md hover:shadow-lg transition-all"
            >
              Enregistrer
            </Button>
          </div>
          
          <Card className="shadow-lg border-none bg-white/80 backdrop-blur-md animate-scale-in">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium flex items-center">
                <Coins size={18} className="text-theme-purple mr-2" />
                Mes tokens
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-3">
                {tokens.map((token) => (
                  <Token key={token.id} token={token} />
                ))}
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-lg border-none bg-white/80 backdrop-blur-md animate-scale-in">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-medium flex items-center">
                  <Gift size={18} className="text-theme-amber mr-2" />
                  Cadeaux à gagner
                </CardTitle>
                <div className="flex">
                  <div className="flex items-center bg-theme-amber/20 px-2 py-1 rounded-full mr-2">
                    <Coins size={16} className="text-theme-amber mr-1" />
                    <span className="font-bold text-theme-amber">{totalTokens}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate('/gifts')}
                    className="text-theme-purple hover:text-theme-purple/80 hover:bg-theme-purple/10"
                  >
                    <Settings size={18} />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {assignedGifts.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-theme-purple mb-2">Cadeaux assignés</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {assignedGifts.map((gift) => {
                      const assignedChild = children.find(child => child.id === gift.assignedToChildId);
                      return (
                        <GiftCard 
                          key={gift.id} 
                          gift={gift} 
                          userTokens={totalTokens} 
                          childName={assignedChild?.name}
                        />
                      );
                    })}
                  </div>
                </div>
              )}
              
              <div>
                <h3 className="text-sm font-medium text-theme-purple mb-2">Cadeaux disponibles</h3>
                <div className="grid grid-cols-2 gap-3">
                  {unassignedGifts.map((gift) => (
                    <GiftCard 
                      key={gift.id} 
                      gift={gift} 
                      userTokens={totalTokens}
                      childName={selectedChild?.name}
                    />
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;
