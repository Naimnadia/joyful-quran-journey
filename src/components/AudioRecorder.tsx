
import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Play, Pause, Save, Trash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';

interface AudioRecorderProps {
  date: string;
  onSaveRecording: (date: string, audioUrl: string) => void;
  existingRecording?: string;
}

const AudioRecorder: React.FC<AudioRecorderProps> = ({
  date,
  onSaveRecording,
  existingRecording
}) => {
  const [recording, setRecording] = useState(false);
  const [audioURL, setAudioURL] = useState<string | null>(existingRecording || null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement>(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (existingRecording) {
      setAudioURL(existingRecording);
    }
  }, [existingRecording]);

  useEffect(() => {
    const initializeRecorder = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true
        });
        const recorder = new MediaRecorder(stream);
        recorder.ondataavailable = event => {
          setAudioChunks(prevChunks => [...prevChunks, event.data]);
        };
        recorder.onstop = () => {
          const audioBlob = new Blob(audioChunks, {
            type: 'audio/webm'
          });
          const url = URL.createObjectURL(audioBlob);
          setAudioURL(url);
        };
        setMediaRecorder(recorder);
      } catch (error) {
        console.error("Error initializing media recorder:", error);
      }
    };
    
    initializeRecorder();
    
    return () => {
      if (mediaRecorder && mediaRecorder.state === 'recording') {
        mediaRecorder.stop();
      }
    };
  }, []);

  const startRecording = () => {
    if (mediaRecorder && mediaRecorder.state === 'inactive') {
      setAudioChunks([]);
      mediaRecorder.start();
      setRecording(true);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.stop();
      setRecording(false);
    }
  };

  const playRecording = () => {
    if (audioRef.current) {
      audioRef.current.play();
    }
  };

  const pauseRecording = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
  };

  const saveRecording = () => {
    if (audioURL) {
      onSaveRecording(date, audioURL);
    }
  };

  const deleteRecording = () => {
    setAudioURL(null);
    setAudioChunks([]);
  };

  return (
    <div className="glass-card rounded-2xl p-4 animate-fade-in">
      <h2 className="text-lg font-medium mb-4">Enregistrement de la lecture</h2>
      
      <div className="flex justify-center items-center space-x-4 mb-4">
        {!recording ? (
          <Button 
            variant="ghost" 
            onClick={startRecording} 
            disabled={recording} 
            className={`${isMobile ? 'w-full' : ''} bg-lime-500 hover:bg-lime-400 text-purple-950`}
          >
            <Mic size={20} className="mr-2" />
            Commencer
          </Button>
        ) : (
          <Button 
            variant="ghost" 
            onClick={stopRecording} 
            disabled={!recording} 
            className={`${isMobile ? 'w-full' : ''} text-red-500 hover:bg-red-100`}
          >
            <Square size={20} className="mr-2" />
            Arrêter
          </Button>
        )}
      </div>
      
      {audioURL && (
        <div className="mb-4">
          <audio ref={audioRef} src={audioURL} controls className="w-full"></audio>
          <div className="flex justify-center items-center space-x-4 mt-2">
            <Button 
              variant="ghost" 
              onClick={playRecording} 
              className="text-gray-900 bg-[#fafdff]/5 flex-1"
            >
              <Play size={20} className="mr-2" />
              Écouter
            </Button>
            <Button 
              variant="ghost" 
              onClick={pauseRecording} 
              className="text-gray-500 hover:bg-gray-100 flex-1"
            >
              <Pause size={20} className="mr-2" />
              Pause
            </Button>
          </div>
        </div>
      )}
      
      <div className="flex justify-between items-center space-x-4">
        <Button 
          variant="default" 
          onClick={saveRecording} 
          disabled={!audioURL} 
          className="flex-1 text-purple-950 bg-lime-300 hover:bg-lime-200"
        >
          <Save size={16} className="mr-2" />
          Sauvegarder
        </Button>
        
        {audioURL && (
          <Button 
            variant="destructive" 
            onClick={deleteRecording} 
            className="flex-1 text-[#0c1703] bg-slate-50"
          >
            <Trash size={16} className="mr-2" />
            Supprimer
          </Button>
        )}
      </div>
    </div>
  );
};

export default AudioRecorder;
