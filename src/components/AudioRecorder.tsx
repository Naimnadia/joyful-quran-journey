import { useState, useRef, useEffect } from 'react';
import { Mic, Square, Play, Save, AlertCircle } from 'lucide-react';
import Button from './UI/Button';
import { toast } from 'sonner';

interface AudioRecorderProps {
  date: string;
  onSaveRecording: (date: string, audioUrl: string) => void;
  existingRecording?: string;
}

const AudioRecorder = ({ date, onSaveRecording, existingRecording }: AudioRecorderProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(existingRecording || null);
  const [permission, setPermission] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<BlobPart[]>([]);
  const timerRef = useRef<number | null>(null);
  
  useEffect(() => {
    const getMicrophonePermission = async () => {
      try {
        const streamData = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        setPermission(true);
      } catch (err) {
        console.error('Error accessing microphone:', err);
        toast.error("Impossible d'accéder au microphone", {
          description: "Veuillez vérifier les permissions de votre navigateur.",
        });
      }
    };
    
    getMicrophonePermission();
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);
  
  const startRecording = () => {
    if (!permission) {
      toast.error("Accès au microphone requis", {
        description: "Veuillez autoriser l'accès au microphone pour enregistrer.",
      });
      return;
    }
    
    setIsRecording(true);
    setRecordingTime(0);
    audioChunksRef.current = [];

    timerRef.current = window.setInterval(() => {
      setRecordingTime((prevTime) => prevTime + 1);
    }, 1000);
    
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(stream => {
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        
        mediaRecorder.ondataavailable = (event) => {
          audioChunksRef.current.push(event.data);
        };
        
        mediaRecorder.onstop = () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/mp3' });
          const audioUrl = URL.createObjectURL(audioBlob);
          setAudioUrl(audioUrl);
          
          stream.getTracks().forEach(track => track.stop());
        };
        
        mediaRecorder.start();
      })
      .catch(error => {
        console.error('Error starting recording:', error);
        setIsRecording(false);
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
        toast.error("Erreur d'enregistrement", {
          description: "Une erreur est survenue lors du démarrage de l'enregistrement.",
        });
      });
  };
  
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      
      toast.success("Enregistrement terminé", {
        description: "Votre lecture a été enregistrée avec succès.",
      });
    }
  };
  
  const playRecording = () => {
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audio.play();
    }
  };
  
  const saveRecording = () => {
    if (audioUrl) {
      onSaveRecording(date, audioUrl);
      toast.success("Enregistrement sauvegardé", {
        description: "Votre lecture a été sauvegardée pour cette journée.",
      });
    }
  };
  
  const formatTime = (timeInSeconds: number) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = timeInSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };
  
  return (
    <div className="glass-card rounded-2xl p-6 space-y-6 animate-scale-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Mic size={20} className="text-theme-purple mr-2" />
          <h2 className="text-lg font-medium">Enregistreur</h2>
        </div>
        <div className="text-sm font-medium">
          {isRecording ? (
            <span className="flex items-center text-red-500">
              <span className="h-2 w-2 rounded-full bg-red-500 mr-2 animate-pulse"></span>
              {formatTime(recordingTime)}
            </span>
          ) : (
            audioUrl ? "Enregistrement prêt" : "Prêt à enregistrer"
          )}
        </div>
      </div>
      
      <div className="flex flex-col items-center space-y-4">
        {!permission && (
          <div className="flex items-center text-amber-500 mb-2">
            <AlertCircle size={16} className="mr-2" />
            <span className="text-sm">Autorisation du microphone requise</span>
          </div>
        )}
        
        <div className="flex justify-center space-x-4">
          {isRecording ? (
            <button
              onClick={stopRecording}
              className="record-button recording"
              aria-label="Stop recording"
            >
              <Square fill="white" size={32} color="white" />
            </button>
          ) : (
            <button
              onClick={startRecording}
              className="record-button idle"
              disabled={!permission}
              aria-label="Start recording"
            >
              <Mic fill="white" size={32} color="white" />
            </button>
          )}
          
          {audioUrl && !isRecording && (
            <button
              onClick={playRecording}
              className="record-button idle bg-theme-purple hover:bg-theme-purple-light"
              aria-label="Play recording"
            >
              <Play fill="white" size={32} color="white" />
            </button>
          )}
        </div>
        
        {audioUrl && !isRecording && (
          <div className="w-full mt-4">
            <audio src={audioUrl} controls className="w-full rounded-xl" />
            
            <Button 
              variant="primary" 
              leftIcon={<Save size={16} />}
              fullWidth
              className="mt-4" 
              onClick={saveRecording}
            >
              Sauvegarder l'enregistrement
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AudioRecorder;
