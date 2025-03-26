
import { useState, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, isWithinInterval, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { User, Coins, Calendar, BookOpen, Mic, ArrowUp, ArrowDown } from 'lucide-react';
import Header from '@/components/Header';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Child, CompletedDay, Recording } from '@/types';

const Dashboard = () => {
  const [children, setChildren] = useLocalStorage<Child[]>('children', []);
  const [completedDays, setCompletedDays] = useLocalStorage<CompletedDay[]>('completedDaysV2', []);
  const [recordings, setRecordings] = useLocalStorage<Recording[]>('recordingsV2', []);
  const [childrenStats, setChildrenStats] = useState<{
    id: string;
    name: string;
    avatar?: string;
    readings: number;
    recordings: number;
    tokens: number;
    streak: number;
  }[]>([]);
  
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: 'ascending' | 'descending';
  }>({
    key: 'tokens',
    direction: 'descending'
  });
  
  const [totalStats, setTotalStats] = useState({
    totalChildren: 0,
    totalReadings: 0,
    totalRecordings: 0,
    totalTokens: 0
  });
  
  // Get current month date range
  const currentDate = new Date();
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const currentMonthName = format(currentDate, 'MMMM yyyy', { locale: fr });
  
  useEffect(() => {
    if (children.length === 0) return;
    
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
      
      // Calculate streak (can be from all time, not just this month)
      const allCompletedDays = completedDays
        .filter(day => day.childId === child.id)
        .map(day => day.date)
        .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
      
      let currentStreak = 0;
      const today = format(new Date(), 'yyyy-MM-dd');
      const isTodayCompleted = allCompletedDays.some(day => day === today);
      const startDate = isTodayCompleted ? new Date() : new Date(Date.now() - 86400000);
      
      for (let i = 0; i < 100; i++) { // Limit to 100 to avoid infinite loop
        const currentDate = new Date(startDate);
        currentDate.setDate(currentDate.getDate() - i);
        const formattedDate = format(currentDate, 'yyyy-MM-dd');
        
        if (allCompletedDays.includes(formattedDate)) {
          currentStreak++;
        } else {
          break;
        }
      }
      
      return {
        id: child.id,
        name: child.name,
        avatar: child.avatar,
        readings: monthlyCompletedDays.length,
        recordings: monthlyRecordings.length,
        tokens: totalTokens,
        streak: currentStreak
      };
    });
    
    // Calculate totals
    const totalChildren = children.length;
    const totalReadings = stats.reduce((sum, child) => sum + child.readings, 0);
    const totalRecordings = stats.reduce((sum, child) => sum + child.recordings, 0);
    const totalTokens = stats.reduce((sum, child) => sum + child.tokens, 0);
    
    setTotalStats({
      totalChildren,
      totalReadings,
      totalRecordings,
      totalTokens
    });
    
    // Sort the stats based on sortConfig
    const sortedStats = [...stats].sort((a, b) => {
      if (a[sortConfig.key as keyof typeof a] < b[sortConfig.key as keyof typeof b]) {
        return sortConfig.direction === 'ascending' ? -1 : 1;
      }
      if (a[sortConfig.key as keyof typeof a] > b[sortConfig.key as keyof typeof b]) {
        return sortConfig.direction === 'ascending' ? 1 : -1;
      }
      return 0;
    });
    
    setChildrenStats(sortedStats);
  }, [children, completedDays, recordings, sortConfig, monthStart, monthEnd]);
  
  const requestSort = (key: string) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };
  
  const getSortIcon = (key: string) => {
    if (sortConfig.key !== key) return null;
    
    return sortConfig.direction === 'ascending' 
      ? <ArrowUp size={14} className="ml-1" /> 
      : <ArrowDown size={14} className="ml-1" />;
  };
  
  if (children.length === 0) {
    return (
      <div className="min-h-screen pt-24 pb-10 px-4 bg-gradient-to-b from-blue-50 to-purple-50">
        <Header />
        
        <div className="container max-w-4xl mx-auto space-y-6">
          <div className="glass-card rounded-2xl p-6 text-center animate-fade-in">
            <User size={48} className="text-theme-purple mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Aucun enfant inscrit</h2>
            <p className="text-gray-600 mb-6">
              Pour commencer à suivre la progression, ajoutez d'abord des enfants dans l'application.
            </p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen pt-24 pb-10 px-4 bg-gradient-to-b from-blue-50 to-purple-50">
      <Header />
      
      <div className="container max-w-4xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-theme-purple mb-2">Tableau de bord</h1>
        <p className="text-gray-600 mb-4">Progression pour {currentMonthName}</p>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-white/90 shadow-sm border-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-base text-gray-600 font-medium">Enfants</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <User className="w-5 h-5 mr-2 text-theme-purple" />
                <span className="text-2xl font-bold">{totalStats.totalChildren}</span>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/90 shadow-sm border-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-base text-gray-600 font-medium">Lectures</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <BookOpen className="w-5 h-5 mr-2 text-theme-blue" />
                <span className="text-2xl font-bold">{totalStats.totalReadings}</span>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/90 shadow-sm border-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-base text-gray-600 font-medium">Enregistrements</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Mic className="w-5 h-5 mr-2 text-theme-purple" />
                <span className="text-2xl font-bold">{totalStats.totalRecordings}</span>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/90 shadow-sm border-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-base text-gray-600 font-medium">Tokens totaux</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Coins className="w-5 h-5 mr-2 text-theme-amber" />
                <span className="text-2xl font-bold">{totalStats.totalTokens}</span>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="glass-card rounded-2xl p-4 md:p-6 animate-fade-in">
          <Table>
            <TableCaption>Liste des enfants et leur progression pour {currentMonthName}</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="cursor-pointer w-[150px]" onClick={() => requestSort('name')}>
                  <div className="flex items-center">
                    Nom {getSortIcon('name')}
                  </div>
                </TableHead>
                <TableHead className="cursor-pointer text-center" onClick={() => requestSort('readings')}>
                  <div className="flex items-center justify-center">
                    Lectures {getSortIcon('readings')}
                  </div>
                </TableHead>
                <TableHead className="cursor-pointer text-center" onClick={() => requestSort('recordings')}>
                  <div className="flex items-center justify-center">
                    Enregistrements {getSortIcon('recordings')}
                  </div>
                </TableHead>
                <TableHead className="cursor-pointer text-center" onClick={() => requestSort('tokens')}>
                  <div className="flex items-center justify-center">
                    Tokens {getSortIcon('tokens')}
                  </div>
                </TableHead>
                <TableHead className="cursor-pointer text-center" onClick={() => requestSort('streak')}>
                  <div className="flex items-center justify-center">
                    Jours consécutifs {getSortIcon('streak')}
                  </div>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {childrenStats.map((child) => (
                <TableRow key={child.id}>
                  <TableCell className="font-medium flex items-center">
                    {child.avatar ? (
                      <img 
                        src={child.avatar} 
                        alt={child.name} 
                        className="w-8 h-8 rounded-full mr-2"
                      />
                    ) : (
                      <User size={20} className="text-theme-purple mr-2" />
                    )}
                    {child.name}
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center">
                      <BookOpen size={16} className="text-theme-blue mr-1" />
                      {child.readings}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center">
                      <Mic size={16} className="text-theme-purple mr-1" />
                      {child.recordings}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center">
                      <Coins size={16} className="text-theme-amber mr-1" />
                      {child.tokens}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center">
                      <Calendar size={16} className="text-theme-blue mr-1" />
                      {child.streak}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
