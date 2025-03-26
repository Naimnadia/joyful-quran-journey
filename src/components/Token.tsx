
import { Award, Star, Clock, Zap, BookOpen, ThumbsUp, Mic, Coins } from 'lucide-react';
import { TokenType } from '@/types';

interface TokenProps {
  token: TokenType;
}

const IconMap: Record<string, React.ElementType> = {
  'award': Award,
  'star': Star,
  'clock': Clock,
  'zap': Zap,
  'book': BookOpen,
  'thumbsUp': ThumbsUp,
  'mic': Mic,
  'coins': Coins,
};

const Token = ({ token }: TokenProps) => {
  const IconComponent = IconMap[token.icon] || Coins;
  const colorClass = token.unlocked ? getTokenColor(token.id) : 'bg-gray-200';
  
  return (
    <div 
      className={`token ${token.unlocked ? 'animate-float' : 'token-locked'} ${colorClass} relative rounded-lg p-3 flex flex-col items-center justify-center h-24`}
      title={token.description}
    >
      <div className="token-icon mb-2">
        <IconComponent size={32} className={token.unlocked ? 'text-white' : 'text-gray-500'} />
      </div>
      <div className="token-value text-white text-lg font-bold mb-1">
        {token.value}
      </div>
      <div className="token-title text-white text-xs text-center font-medium">
        {token.title}
      </div>
      {!token.unlocked && (
        <div className="absolute inset-0 bg-gray-100/50 rounded-lg flex items-center justify-center">
          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
            <div className="lock-icon">🔒</div>
          </div>
        </div>
      )}
    </div>
  );
};

const getTokenColor = (id: string): string => {
  const colors = {
    'token-10': 'bg-theme-blue',
    'token-20': 'bg-theme-purple',
    'token-30': 'bg-theme-amber',
    'token-40': 'bg-rose-500',
    'token-50': 'bg-emerald-500',
  };
  
  return colors[id as keyof typeof colors] || 'bg-theme-blue';
};

export default Token;
