
import { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { format, parseISO, isValid } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Calendar, Mic, User } from 'lucide-react';
import Header from '@/components/Header';
import AudioRecorder from '@/components/AudioRecorder';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import Button from '@/components/UI/Button';
import { Child, Recording, CompletedDay } from '@/types';

// Helper function to get URL parameters
function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const Record = () => {
  const { date } = useParams<{ date?: string }>();
  const navigate = useNavigate();
  const query = useQuery();
  const childIdFromURL = query.get('childId');
  
  const [selectedDate, setSelectedDate] = useState<string>(
    date && isValid(parseISO(date)) ? date : format(new Date(), 'yyyy-MM-dd')
  );
  
  const [recordings, setRecordings] = useLocalStorage<Recording[]>('recordingsV2', []);
  const [completedDays, setCompletedDays] = useLocalStorage<CompletedDay[]>('completedDaysV2', []);
  const [children, setChildren] = useLocalStorage<Child[]>('children', []);
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);
  
  // Find the existing recording for this child and date
  const existingRecording = recordings.find(
    r => r.date === selectedDate && r.childId === selectedChildId
  )?.audioUrl;
  
  useEffect(() => {
    if (date && isValid(parseISO(date))) {
      setSelectedDate(date);
    } else if (date) {
      // Invalid date parameter
      navigate('/record');
    }
  }, [date, navigate]);
  
  // Set selected child from URL or default to first child
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
  
  const handleSaveRecording = (date: string, audioUrl: string) => {
    if (!selectedChildId) return;
    
    // Update recordings
    const newRecordings = [
      ...recordings.filter(r => !(r.date === date && r.childId === selectedChildId)),
      { date, audioUrl, childId: selectedChildId }
    ];
    setRecordings(newRecordings);
    
    // Mark day as completed if not already
    const dayAlreadyCompleted = completedDays.some(
      day => day.date === date && day.childId === selectedChildId
    );
    
    if (!dayAlreadyCompleted) {
      setCompletedDays([...completedDays, { date, childId: selectedChildId }]);
    }
  };
  
  // No children yet - prompt to add one
  if (children.length === 0) {
    return (
      <div className="min-h-screen pt-24 pb-10 px-4 bg-gradient-to-b from-blue-50 to-purple-50">
        <Header />
        
        <div className="container max-w-md mx-auto space-y-6">
          <div className="glass-card rounded-2xl p-6 text-center animate-fade-in">
            <User size={48} className="text-theme-purple mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Aucun enfant</h2>
            <p className="text-gray-600 mb-6">
              Pour enregistrer une lecture, vous devez d'abord ajouter un enfant.
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
  
  const selectedChild = children.find(child => child.id === selectedChildId);
  const formattedDate = format(parseISO(selectedDate), 'EEEE d MMMM yyyy', { locale: fr });
  
  return (
    <div className="min-h-screen pt-24 pb-10 px-4 bg-gradient-to-b from-blue-50 to-purple-50">
      <Header />
      
      <div className="container max-w-md mx-auto space-y-6">
        {/* Child selector */}
        {children.length > 1 && selectedChild && (
          <div className="glass-card rounded-2xl p-4 animate-fade-in">
            <div className="flex items-center">
              <User size={20} className="text-theme-purple mr-2" />
              <select
                value={selectedChildId || ''}
                onChange={(e) => {
                  setSelectedChildId(e.target.value);
                  navigate(`/record/${selectedDate}?childId=${e.target.value}`);
                }}
                className="bg-transparent border-none text-theme-purple font-medium focus:outline-none"
              >
                {children.map(child => (
                  <option key={child.id} value={child.id}>{child.name}</option>
                ))}
              </select>
            </div>
          </div>
        )}
        
        <div className="glass-card rounded-2xl p-4 animate-fade-in">
          <div className="flex items-center">
            <Calendar size={20} className="text-theme-purple mr-2" />
            <h2 className="text-lg font-medium capitalize">{formattedDate}</h2>
          </div>
        </div>
        
        {selectedChild && (
          <AudioRecorder 
            date={selectedDate}
            onSaveRecording={handleSaveRecording}
            existingRecording={existingRecording}
          />
        )}
        
        <div className="flex justify-center">
          <Button
            variant="outline"
            onClick={() => navigate('/')}
          >
            Retour à l'accueil
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Record;
