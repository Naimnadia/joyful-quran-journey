
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

interface CalendarProps {
  completedDays: string[];
  recordedDays: string[];
}

const Calendar = ({ completedDays, recordedDays }: CalendarProps) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarDays, setCalendarDays] = useState<Date[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const start = startOfMonth(currentDate);
    const end = endOfMonth(currentDate);
    const days = eachDayOfInterval({ start, end });
    setCalendarDays(days);
  }, [currentDate]);

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  const isDayCompleted = (day: Date) => {
    return completedDays.some(completedDay => 
      isSameDay(parseISO(completedDay), day)
    );
  };

  const isDayRecorded = (day: Date) => {
    return recordedDays.some(recordedDay => 
      isSameDay(parseISO(recordedDay), day)
    );
  };

  const handleDayClick = (day: Date) => {
    if (isSameMonth(day, currentDate)) {
      const dateStr = format(day, 'yyyy-MM-dd');
      navigate(`/record/${dateStr}`);
    }
  };

  return (
    <div className="glass-card rounded-2xl p-4 shadow-md animate-scale-in">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <CalendarIcon size={20} className="text-theme-purple mr-2" />
          <h2 className="text-lg font-medium">Calendrier de lecture</h2>
        </div>
        <div className="flex items-center space-x-2">
          <button 
            onClick={prevMonth}
            className="p-1 rounded-lg hover:bg-theme-purple-light/20 transition-colors"
            aria-label="Previous month"
          >
            <ChevronLeft size={20} className="text-theme-purple" />
          </button>
          <span className="font-medium">
            {format(currentDate, 'MMMM yyyy', { locale: fr })}
          </span>
          <button 
            onClick={nextMonth}
            className="p-1 rounded-lg hover:bg-theme-purple-light/20 transition-colors"
            aria-label="Next month"
          >
            <ChevronRight size={20} className="text-theme-purple" />
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-7 gap-1">
        {['Lu', 'Ma', 'Me', 'Je', 'Ve', 'Sa', 'Di'].map(day => (
          <div key={day} className="text-center text-sm font-medium text-muted-foreground p-2">
            {day}
          </div>
        ))}

        {/* Empty cells for days before the first day of month */}
        {Array.from({ length: new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay() - 1 }, (_, i) => (
          <div key={`empty-${i}`} className="text-center p-2"></div>
        ))}
        
        {calendarDays.map((day) => {
          const isCompleted = isDayCompleted(day);
          const isRecorded = isDayRecorded(day);
          const isTodayDate = isToday(day);

          return (
            <div 
              key={day.toString()}
              className="text-center p-1"
              onClick={() => handleDayClick(day)}
            >
              <div 
                className={`calendar-day ${isCompleted ? 'completed' : ''} ${isTodayDate ? 'today' : ''}`}
              >
                <span>{format(day, 'd')}</span>
                {isRecorded && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-theme-amber rounded-full border-2 border-white" />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Calendar;
