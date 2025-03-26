
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, isToday, parseISO, differenceInDays } from 'date-fns';
import { Mic, Award, BookOpen, Star } from 'lucide-react';
import Header from '@/components/Header';
import Calendar from '@/components/Calendar';
import Badge, { BadgeType } from '@/components/Badge';
import Button from '@/components/UI/Button';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { toast } from 'sonner';

interface Recording {
  date: string;
  audioUrl: string;
}

const Index = () => {
  const navigate = useNavigate();
  const [completedDays, setCompletedDays] = useLocalStorage<string[]>('completedDays', []);
  const [recordings, setRecordings] = useLocalStorage<Recording[]>('recordings', []);
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
  
  // Calculate statistics
  useEffect(() => {
    // Count total readings
    setTotalReadings(completedDays.length);
    
    // Count total recordings
    setTotalRecordings(recordings.length);
    
    // Calculate current streak
    const sortedDays = [...completedDays].sort((a, b) => {
      return new Date(b).getTime() - new Date(a).getTime();
    });
    
    let currentStreak = 0;
    
    // Check if today is completed
    const today = format(new Date(), 'yyyy-MM-dd');
    const isTodayCompleted = sortedDays.some(day => day === today);
    
    // Start from today or yesterday
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
    
    // Update badges based on achievements
    const updatedBadges = [...badges];
    
    // Streak badges
    if (streak >= 3) {
      updatedBadges.find(b => b.id === 'streak-3')!.unlocked = true;
    }
    
    if (streak >= 7) {
      updatedBadges.find(b => b.id === 'streak-7')!.unlocked = true;
    }
    
    if (streak >= 30) {
      updatedBadges.find(b => b.id === 'streak-30')!.unlocked = true;
    }
    
    // Recording badges
    if (totalRecordings >= 5) {
      updatedBadges.find(b => b.id === 'recordings-5')!.unlocked = true;
    }
    
    if (totalRecordings >= 10) {
      updatedBadges.find(b => b.id === 'recordings-10')!.unlocked = true;
    }
    
    // Perfect week badge
    const hasCompletedPerfectWeek = checkForPerfectWeek(completedDays, recordings);
    if (hasCompletedPerfectWeek) {
      updatedBadges.find(b => b.id === 'perfect-week')!.unlocked = true;
    }
    
    // Update badges if any changed
    if (JSON.stringify(updatedBadges) !== JSON.stringify(badges)) {
      setBadges(updatedBadges);
    }
  }, [completedDays, recordings, badges, setBadges, streak]);
  
  const checkForPerfectWeek = (completedDays: string[], recordings: Recording[]): boolean => {
    // Check if there are 7 consecutive days with both reading and recording
    for (let i = 0; i < completedDays.length - 6; i++) {
      const startDay = parseISO(completedDays[i]);
      let allDaysHaveRecordings = true;
      
      for (let j = 0; j < 7; j++) {
        const currentDay = new Date(startDay);
        currentDay.setDate(startDay.getDate() + j);
        const formattedDate = format(currentDay, 'yyyy-MM-dd');
        
        // Check if the day is in completedDays and has a recording
        const isDayCompleted = completedDays.includes(formattedDate);
        const hasDayRecording = recordings.some(rec => rec.date === formattedDate);
        
        if (!isDayCompleted || !hasDayRecording) {
          allDaysHaveRecordings = false;
          break;
        }
      }
      
      if (allDaysHaveRecordings) {
        return true;
      }
    }
    
    return false;
  };
  
  const markTodayAsCompleted = () => {
    const today = format(new Date(), 'yyyy-MM-dd');
    if (!completedDays.includes(today)) {
      setCompletedDays([...completedDays, today]);
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
    const today = format(new Date(), 'yyyy-MM-dd');
    navigate(`/record/${today}`);
  };
  
  const recordedDays = recordings.map(rec => rec.date);
  const unlockedBadgesCount = badges.filter(b => b.unlocked).length;
  
  return (
    <div className="min-h-screen pt-24 pb-10 px-4 bg-gradient-to-b from-blue-50 to-purple-50">
      <Header />
      
      <div className="container max-w-md mx-auto space-y-6">
        {/* Stats cards */}
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
        
        {/* Calendar */}
        <Calendar 
          completedDays={completedDays}
          recordedDays={recordedDays}
        />
        
        {/* Quick actions */}
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
        
        {/* Badges */}
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
