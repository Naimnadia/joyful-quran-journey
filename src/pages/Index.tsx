import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { Mic, Award, BookOpen, Star, User, ChevronDown } from 'lucide-react';
import Header from '@/components/Header';
import Calendar from '@/components/Calendar';
import Badge from '@/components/Badge';
import Button from '@/components/UI/Button';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { toast } from 'sonner';
import { Child, CompletedDay, Recording, BadgeType } from '@/types';

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
  
  const [badges, setBadges] = useLocalStorage<BadgeType[]>('badges', [
    {
      id: 'streak-3',
      title: '3 jours de lecture',
      icon: 'zap',
      description: 'Lire le Coran 3 jours de suite',
      unlocked: false
    },
    {
      id: 'streak-7',
      title: '7 jours de lecture',
      icon: 'star',
      description: 'Lire le Coran pendant une semaine complète',
      unlocked: false
    },
    {
      id: 'streak-30',
      title: '30 jours de lecture',
      icon: 'award',
      description: 'Lire le Coran tous les jours pendant un mois',
      unlocked: false
    },
    {
      id: 'recordings-5',
      title: '5 enregistrements',
      icon: 'mic',
      description: 'Enregistrer sa lecture 5 fois',
      unlocked: false
    },
    {
      id: 'recordings-10',
      title: '10 enregistrements',
      icon: 'mic',
      description: 'Enregistrer sa lecture 10 fois',
      unlocked: false
    },
    {
      id: 'perfect-week',
      title: 'Semaine parfaite',
      icon: 'book',
      description: 'Lire et enregistrer chaque jour pendant une semaine',
      unlocked: false
    }
  ]);

  const [streak, setStreak] = useState(0);
  const [totalReadings, setTotalReadings] = useState(0);
  const [totalRecordings, setTotalRecordings] = useState(0);
  
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
    
    const updatedBadges = [...badges];
    
    if (streak >= 3) {
      updatedBadges.find(b => b.id === 'streak-3')!.unlocked = true;
    }
    
    if (streak >= 7) {
      updatedBadges.find(b => b.id === 'streak-7')!.unlocked = true;
    }
    
    if (streak >= 30) {
      updatedBadges.find(b => b.id === 'streak-30')!.unlocked = true;
    }
    
    if (totalRecordings >= 5) {
      updatedBadges.find(b => b.id === 'recordings-5')!.unlocked = true;
    }
    
    if (totalRecordings >= 10) {
      updatedBadges.find(b => b.id === 'recordings-10')!.unlocked = true;
    }
    
    const hasCompletedPerfectWeek = checkForPerfectWeek(childCompletedDays, childRecordings);
    if (hasCompletedPerfectWeek) {
      updatedBadges.find(b => b.id === 'perfect-week')!.unlocked = true;
    }
    
    if (JSON.stringify(updatedBadges) !== JSON.stringify(badges)) {
      setBadges(updatedBadges);
    }
  }, [childCompletedDays, childRecordings, badges, setBadges, streak, selectedChildId]);
  
  const checkForPerfectWeek = (completedDays: string[], recordings: string[]): boolean => {
    return false;
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
  const unlockedBadgesCount = badges.filter(b => b.unlocked).length;
  
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
            <div className="text-theme-amber text-2xl font-bold">{unlockedBadgesCount}/{badges.length}</div>
            <div className="text-xs text-gray-600">Badges débloqués</div>
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
            <Award size={20} className="text-theme-purple mr-2" />
            <h2 className="text-lg font-medium">Mes badges</h2>
          </div>
          
          <div className="grid grid-cols-3 gap-3">
            {badges.map((badge) => (
              <Badge key={badge.id} badge={badge} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
