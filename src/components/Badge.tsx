
import { Award, Star, Clock, Zap, BookOpen, ThumbsUp, Mic } from 'lucide-react';
import { BadgeType } from '@/types';

interface BadgeProps {
  badge: BadgeType;
}

const IconMap: Record<string, React.ElementType> = {
  'award': Award,
  'star': Star,
  'clock': Clock,
  'zap': Zap,
  'book': BookOpen,
  'thumbsUp': ThumbsUp,
  'mic': Mic,
};

const Badge = ({ badge }: BadgeProps) => {
  const IconComponent = IconMap[badge.icon] || Award;
  const colorClass = badge.unlocked ? getBadgeColor(badge.id) : 'bg-gray-200';
  
  return (
    <div 
      className={`badge ${badge.unlocked ? 'animate-float' : 'badge-locked'} ${colorClass} relative rounded-lg p-3 flex flex-col items-center justify-center h-24`}
      title={badge.description}
    >
      <div className="badge-icon mb-2">
        <IconComponent size={32} className={badge.unlocked ? 'text-white' : 'text-gray-500'} />
      </div>
      <div className="badge-title text-white text-xs text-center font-medium">
        {badge.title}
      </div>
      {!badge.unlocked && (
        <div className="absolute inset-0 bg-gray-100/50 rounded-lg flex items-center justify-center">
          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
            <div className="lock-icon">🔒</div>
          </div>
        </div>
      )}
    </div>
  );
};

const getBadgeColor = (id: string): string => {
  const colors = {
    'streak-3': 'bg-theme-blue',
    'streak-7': 'bg-theme-purple',
    'streak-30': 'bg-theme-amber',
    'recordings-5': 'bg-theme-teal',
    'recordings-10': 'bg-rose-500',
    'perfect-week': 'bg-emerald-500',
  };
  
  return colors[id as keyof typeof colors] || 'bg-theme-blue';
};

export default Badge;
