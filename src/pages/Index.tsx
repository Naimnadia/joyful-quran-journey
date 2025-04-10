import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { format, parseISO, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay } from 'date-fns';
import { Mic, Coins, BookOpen, Star, User, ChevronDown, Gift, Settings, ArrowLeft } from 'lucide-react';
import Header from '@/components/Header';
import Calendar from '@/components/Calendar';
import Token from '@/components/Token';
import GiftCard from '@/components/GiftCard';
import { Button } from '@/components/ui/button';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { toast } from 'sonner';
import { Child, CompletedDay, Recording, TokenType, Gift as GiftType } from '@/types';
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
  const [oldRecordings, setOldRecordings] = useLocalStorage<{
    date: string;
    audioUrl: string;
  }[]>('recordings', []);
  useEffect(() => {
    if (!childIdFromURL) {
      navigate('/');
    }
  }, [childIdFromURL, navigate]);
  const [gifts, setGifts] = useLocalStorage<GiftType[]>('gifts', []);
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
        navigate('/');
      }
    } else if (children.length > 0 && !selectedChildId) {
      setSelectedChildId(children[0].id);
    }
  }, [childIdFromURL, children, selectedChildId, navigate]);
  if (children.length === 0) {
    useEffect(() => {
      navigate('/');
    }, [navigate]);
    return null;
  }
  const [tokens, setTokens] = useLocalStorage<TokenType[]>('tokens', [{
    id: 'token-10',
    title: '10 tokens',
    icon: 'coins',
    description: 'Gagner 10 tokens',
    unlocked: false,
    value: 10
  }, {
    id: 'token-20',
    title: '20 tokens',
    icon: 'coins',
    description: 'Gagner 20 tokens',
    unlocked: false,
    value: 20
  }, {
    id: 'token-30',
    title: '30 tokens',
    icon: 'coins',
    description: 'Gagner 30 tokens',
    unlocked: false,
    value: 30
  }, {
    id: 'token-40',
    title: '40 tokens',
    icon: 'coins',
    description: 'Gagner 40 tokens',
    unlocked: false,
    value: 40
  }, {
    id: 'token-50',
    title: '50 tokens',
    icon: 'coins',
    description: 'Gagner 50 tokens',
    unlocked: false,
    value: 50
  }]);
  const [streak, setStreak] = useState(0);
  const [totalReadings, setTotalReadings] = useState(0);
  const [totalRecordings, setTotalRecordings] = useState(0);
  const [totalTokens, setTotalTokens] = useState(0);
  const childCompletedDays = completedDays.filter(day => day.childId === selectedChildId).map(day => day.date);
  const childRecordings = recordings.filter(rec => rec.childId === selectedChildId).map(rec => rec.date);
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
    const startOfCurrentWeek = startOfWeek(today, {
      weekStartsOn: 1
    });
    const endOfCurrentWeek = endOfWeek(today, {
      weekStartsOn: 1
    });
    const daysInWeek = eachDayOfInterval({
      start: startOfCurrentWeek,
      end: endOfCurrentWeek
    });
    for (const day of daysInWeek) {
      const formattedDay = format(day, 'yyyy-MM-dd');
      const dayCompleted = completedDays.some(completedDay => completedDay === formattedDay);
      const dayRecorded = recordings.some(recordedDay => recordedDay === formattedDay);
      if (!dayCompleted || !dayRecorded) {
        return false;
      }
    }
    return true;
  };
  const markTodayAsCompleted = () => {
    if (!selectedChildId) return;
    const today = format(new Date(), 'yyyy-MM-dd');
    const dayAlreadyCompleted = completedDays.some(day => day.date === today && day.childId === selectedChildId);
    if (!dayAlreadyCompleted) {
      setCompletedDays([...completedDays, {
        date: today,
        childId: selectedChildId
      }]);
      toast.success("Jour marqué comme lu", {
        description: "Bravo ! Continuez votre engagement quotidien."
      });
    } else {
      toast.info("Jour déjà marqué comme lu", {
        description: "Ce jour est déjà marqué comme lu."
      });
    }
  };
  const recordToday = () => {
    if (!selectedChildId) return;
    const today = format(new Date(), 'yyyy-MM-dd');
    navigate(`/record/${today}?childId=${selectedChildId}`);
  };
  const handleSwitchProfile = () => {
    navigate('/');
  };
  const selectedChild = children.find(child => child.id === selectedChildId);
  const assignGiftToChild = (giftId: string, childId: string) => {
    setGifts(prev => prev.map(gift => gift.id === giftId ? {
      ...gift,
      assignedToChildId: childId
    } : gift));
    toast.success("Cadeau assigné à l'enfant !");
  };
  const assignedGifts = gifts.filter(gift => gift.assignedToChildId);
  const unassignedGifts = gifts.filter(gift => !gift.assignedToChildId);
  return <div className="min-h-screen pt-24 pb-10 px-4 bg-gradient-to-b from-blue-50 to-purple-50">
      <Header />
      
      <div className="container max-w-md mx-auto space-y-6">
        <div className="flex justify-between items-center animate-fade-in">
          <Button variant="outline" size="sm" className="border-gray-300 text-gray-600 hover:bg-gray-100" onClick={handleSwitchProfile}>
            <ArrowLeft className="mr-2 h-3 w-3" />
            Changer de profil
          </Button>
          
          <div className="glass-card rounded-full px-4 py-2 inline-flex items-center bg-fuchsia-950">
            <User size={10} className="text-theme-purple mr-2" />
            <span className="font-medium text-slate-50">
              {selectedChild?.name || 'Profil'}
            </span>
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-3 animate-fade-in">
          
          
          <div className="glass-card rounded-2xl p-3 text-center">
            <div className="text-theme-purple text-2xl font-bold">{totalReadings}</div>
            <div className="text-xs text-gray-600">Lectures totales</div>
          </div>
          
          <div className="glass-card rounded-2xl p-3 text-center">
            <div className="text-theme-amber text-2xl font-bold">{totalTokens}</div>
            <div className="text-xs text-gray-600">Tokens gagnés</div>
          </div>
        </div>
        
        <Calendar completedDays={childCompletedDays} recordedDays={childRecordings} />
        
        <div className="flex space-x-3 animate-slide-in">
          
          
          <Button variant="secondary" className="w-full" onClick={recordToday}>
            <Mic size={10} className="mr-2" />
            Enregistrer
          </Button>
        </div>
        
        <div className="glass-card rounded-2xl p-4 animate-scale-in">
          <div className="flex items-center mb-4">
            <Coins size={10} className="text-theme-purple mr-2" />
            <h2 className="text-lg font-medium">Mes tokens</h2>
          </div>
          
          <div className="grid grid-cols-3 gap-3">
            {tokens.map(token => <Token key={token.id} token={token} />)}
          </div>
        </div>
        
        <div className="glass-card rounded-2xl p-4 animate-scale-in">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Gift size={10} className="text-theme-amber mr-2" />
              <h2 className="text-lg font-medium">Cadeaux à gagner</h2>
            </div>
            <div className="flex">
              <div className="flex items-center bg-theme-amber/10 px-2 py-1 rounded-full mr-2">
                <Coins size={8} className="text-theme-amber mr-1" />
                <span className="font-bold text-theme-amber">{totalTokens}</span>
              </div>
              <Button variant="ghost" size="sm" onClick={() => navigate('/gifts')} className="text-theme-purple hover:text-theme-purple/80 hover:bg-theme-purple/10">
                <Settings size={10} />
              </Button>
            </div>
          </div>
          
          {gifts.length > 0 ? <>
              {assignedGifts.length > 0 && <div className="mb-4">
                  <h3 className="text-sm font-medium text-theme-purple mb-2">Cadeaux assignés</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {assignedGifts.map(gift => {
                const assignedChild = children.find(child => child.id === gift.assignedToChildId);
                return <GiftCard key={gift.id} gift={gift} userTokens={totalTokens} childName={assignedChild?.name} />;
              })}
                  </div>
                </div>}
              
              {unassignedGifts.length > 0 && <div>
                  <h3 className="text-sm font-medium text-theme-purple mb-2">Cadeaux disponibles</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {unassignedGifts.map(gift => <GiftCard key={gift.id} gift={gift} userTokens={totalTokens} childName={selectedChild?.name} />)}
                  </div>
                </div>}
            </> : <div className="text-center py-6 text-gray-500">
              <Gift size={24} className="mx-auto mb-2 text-gray-400" />
              <p>Aucun cadeau disponible</p>
              <p className="text-sm">Ajoutez des cadeaux dans les paramètres</p>
            </div>}
        </div>
      </div>
    </div>;
};
export default Index;