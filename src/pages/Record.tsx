
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format, parseISO, isValid } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Calendar, Mic } from 'lucide-react';
import Header from '@/components/Header';
import AudioRecorder from '@/components/AudioRecorder';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import Button from '@/components/UI/Button';

interface Recording {
  date: string;
  audioUrl: string;
}

const Record = () => {
  const { date } = useParams<{ date?: string }>();
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState<string>(
    date && isValid(parseISO(date)) ? date : format(new Date(), 'yyyy-MM-dd')
  );
  
  const [recordings, setRecordings] = useLocalStorage<Recording[]>('recordings', []);
  const [completedDays, setCompletedDays] = useLocalStorage<string[]>('completedDays', []);
  
  const existingRecording = recordings.find((r) => r.date === selectedDate)?.audioUrl;
  
  useEffect(() => {
    if (date && isValid(parseISO(date))) {
      setSelectedDate(date);
    } else if (date) {
      // Invalid date parameter
      navigate('/record');
    }
  }, [date, navigate]);

  const handleSaveRecording = (date: string, audioUrl: string) => {
    // Update recordings
    const newRecordings = [...recordings.filter((r) => r.date !== date), { date, audioUrl }];
    setRecordings(newRecordings);
    
    // Mark day as completed if not already
    if (!completedDays.includes(date)) {
      setCompletedDays([...completedDays, date]);
    }
  };
  
  const formattedDate = format(parseISO(selectedDate), 'EEEE d MMMM yyyy', { locale: fr });
  
  return (
    <div className="min-h-screen pt-24 pb-10 px-4 bg-gradient-to-b from-blue-50 to-purple-50">
      <Header />
      
      <div className="container max-w-md mx-auto space-y-6">
        <div className="glass-card rounded-2xl p-4 animate-fade-in">
          <div className="flex items-center">
            <Calendar size={20} className="text-theme-purple mr-2" />
            <h2 className="text-lg font-medium capitalize">{formattedDate}</h2>
          </div>
        </div>
        
        <AudioRecorder 
          date={selectedDate}
          onSaveRecording={handleSaveRecording}
          existingRecording={existingRecording}
        />
        
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
