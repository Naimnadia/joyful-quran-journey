
import React from 'react';
import { Gift as GiftIcon, Coins, User } from 'lucide-react';
import { Gift } from '@/types';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface GiftCardProps {
  gift: Gift;
  userTokens: number;
  childName?: string;
}

const GiftCard = ({ gift, userTokens, childName }: GiftCardProps) => {
  const canAfford = userTokens >= gift.tokenCost;

  return (
    <div className={cn(
      "gift-card glass-card rounded-xl p-4 transition-all",
      canAfford ? 'border-2 border-theme-amber animate-pulse' : 'border border-gray-200',
    )}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-sm">{gift.name}</h3>
        <Badge 
          variant="outline" 
          className={cn("flex items-center gap-1", 
            canAfford ? 'bg-theme-amber text-white' : 'bg-gray-100'
          )}
        >
          <span>{gift.tokenCost}</span>
          <Coins size={14} />
        </Badge>
      </div>
      
      <p className="text-xs text-gray-600 mb-3">{gift.description}</p>
      
      {gift.imageSrc ? (
        <div className="w-full h-24 rounded-lg overflow-hidden">
          <img 
            src={gift.imageSrc} 
            alt={gift.name} 
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        <div className="w-full h-24 rounded-lg bg-gray-100 flex items-center justify-center">
          <GiftIcon size={32} className="text-gray-400" />
        </div>
      )}

      <div className="mt-3 flex items-center justify-between">
        <div className={cn("text-sm font-medium", 
          canAfford ? 'text-theme-amber' : 'text-gray-400'
        )}>
          {canAfford ? 'Disponible !' : `Manque ${gift.tokenCost - userTokens}`}
        </div>
        
        {childName && (
          <div className="flex items-center text-xs text-theme-purple">
            <User size={12} className="mr-1" /> 
            <span>{childName}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default GiftCard;
