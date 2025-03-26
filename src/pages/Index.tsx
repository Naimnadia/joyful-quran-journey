
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { format, parseISO, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay } from 'date-fns';
import { Mic, Coins, BookOpen, Star, User, ChevronDown } from 'lucide-react';
import Header from '@/components/Header';
import Calendar from '@/components/Calendar';
import Token from '@/components/Token';
import Button from '@/components/UI/Button';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { toast } from 'sonner';
import { Child, CompletedDay, Recording, TokenType } from '@/types';

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
      <div className="min-h-screen pt-24 pb-10 px-4 bg-gradient-to-b from-blue-50 to-purple-50">
        <Header />
        
        <div className="container max-w-md mx-auto space-y-6">
          <div className="glass-card rounded-2xl p-6 text-center animate-fade-in">
            <User size={48} className="text-theme-purple mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Bienvenue sur Daily Coran</h2>
            <p className="text-gray-600 mb-6">
              Pour commencer, ajoutez un enfant pour suivre sa progression quotidienne de lecture du Coran.
            </p>
            <Button
              variant="primary"
              fullWidth
              onClick={() => navigate('/children')}
            >
              Ajouter un enfant
            </Button>
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
    
    // Calculate current streak
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
    
    // Calculate total tokens based on activities
    // 1 token per reading, 2 tokens per recording, 5 bonus tokens for perfect week
    const readingTokens = childCompletedDays.length * 1;
    const recordingTokens = childRecordings.length * 2;
    
    const hasCompletedPerfectWeek = checkForPerfectWeek(childCompletedDays, childRecordings);
    const perfectWeekBonus = hasCompletedPerfectWeek ? 5 : 0;
    
    const calculatedTotalTokens = readingTokens + recordingTokens + perfectWeekBonus;
    setTotalTokens(calculatedTotalTokens);
    
    // Update unlocked tokens based on total tokens
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
    // Get current week's date range
    const today = new Date();
    const startOfCurrentWeek = startOfWeek(today, { weekStartsOn: 1 }); // Start week on Monday
    const endOfCurrentWeek = endOfWeek(today, { weekStartsOn: 1 });
    
    // Get all days in the current week
    const daysInWeek = eachDayOfInterval({
      start: startOfCurrentWeek,
      end: endOfCurrentWeek
    });
    
    // Check if each day in the week has both a completion and recording
    for (const day of daysInWeek) {
      const formattedDay = format(day, 'yyyy-MM-dd');
      
      const dayCompleted = completedDays.some(completedDay => 
        completedDay === formattedDay
      );
      
      const dayRecorded = recordings.some(recordedDay => 
        recordedDay === formattedDay
      );
      
      // If any day is missing either completion or recording, return false
      if (!dayCompleted || !dayRecorded) {
        return false;
      }
    }
    
    // If we got here, all days in the week have both completion and recording
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
  
  return (
    <div className="min-h-screen pt-24 pb-10 px-4 bg-gradient-to-b from-blue-50 to-purple-50">
      <Header />
      
      <div className="container max-w-md mx-auto space-y-6">
        {children.length > 1 && (
          <div className="flex justify-center animate-fade-in">
            <div className="glass-card rounded-full px-4 py-2 inline-flex items-center">
              <User size={16} className="text-theme-purple mr-2" />
              <select
                value={selectedChildId || ''}
                onChange={(e) => {
                  setSelectedChildId(e.target.value);
                  navigate(`/?childId=${e.target.value}`);
                }}
                className="bg-transparent border-none text-theme-purple font-medium focus:outline-none"
              >
                {children.map(child => (
                  <option key={child.id} value={child.id}>{child.name}</option>
                ))}
              </select>
              <ChevronDown size={16} className="text-theme-purple ml-1" />
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-3 gap-3 animate-fade-in">
          <div className="glass-card rounded-2xl p-3 text-center">
            <div className="text-theme-blue text-2xl font-bold">{streak}</div>
            <div className="text-xs text-gray-600">Jours consécutifs</div>
          </div>
          
          <div className="glass-card rounded-2xl p-3 text-center">
            <div className="text-theme-purple text-2xl font-bold">{totalReadings}</div>
            <div className="text-xs text-gray-600">Lectures totales</div>
          </div>
          
          <div className="glass-card rounded-2xl p-3 text-center">
            <div className="text-theme-amber text-2xl font-bold">{totalTokens}</div>
            <div className="text-xs text-gray-600">Tokens gagnés</div>
          </div>
        </div>
        
        <Calendar 
          completedDays={childCompletedDays}
          recordedDays={childRecordings}
        />
        
        <div className="flex space-x-3 animate-slide-in">
          <Button 
            variant="primary" 
            fullWidth
            leftIcon={<BookOpen size={18} />}
            onClick={markTodayAsCompleted}
          >
            Marquer comme lu
          </Button>
          
          <Button 
            variant="secondary" 
            fullWidth
            leftIcon={<Mic size={18} />}
            onClick={recordToday}
          >
            Enregistrer
          </Button>
        </div>
        
        <div className="glass-card rounded-2xl p-4 animate-scale-in">
          <div className="flex items-center mb-4">
            <Coins size={20} className="text-theme-purple mr-2" />
            <h2 className="text-lg font-medium">Mes tokens</h2>
          </div>
          
          <div className="grid grid-cols-3 gap-3">
            {tokens.map((token) => (
              <Token key={token.id} token={token} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
