
import { Award, Star, Clock, Zap, BookOpen, ThumbsUp } from 'lucide-react';

export interface BadgeType {
  id: string;
  title: string;
  icon: string;
  description: string;
  unlocked: boolean;
}

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
};

const Badge = ({ badge }: BadgeProps) => {
  const IconComponent = IconMap[badge.icon] || Award;
  const colorClass = badge.unlocked ? getBadgeColor(badge.id) : 'bg-gray-200';
  
  return (
    <div className={`badge ${badge.unlocked ? 'animate-float' : 'badge-locked'} ${colorClass}`}>
      <div className="badge-icon">
        <IconComponent size={40} className={badge.unlocked ? 'text-white' : 'text-gray-500'} />
      </div>
      <div className="badge-title text-white">
        {badge.title}
      </div>
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
