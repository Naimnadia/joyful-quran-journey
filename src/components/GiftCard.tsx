
import React from 'react';
import { Gift as GiftType } from '@/types';
import { Gift, Coins, Check, Edit, Trash } from 'lucide-react';

export interface GiftCardProps {
  gift: GiftType;
  userTokens?: number;
  childName?: string;
  onAssign?: () => Promise<void>;
  onDelete?: () => Promise<void>;
  isAssigned?: boolean;
  canAfford?: boolean;
  editMode?: boolean;
}

const GiftCard = ({ 
  gift, 
  userTokens = 0, 
  childName,
  onAssign,
  onDelete,
  isAssigned = false,
  canAfford = false,
  editMode = false
}: GiftCardProps) => {
  return (
    <div className={`relative bg-white rounded-xl p-3 shadow-sm ${isAssigned ? 'border-2 border-theme-purple' : ''}`}>
      <div className="flex justify-between mb-2">
        <div className="p-2 rounded-lg bg-theme-purple/10">
          <Gift size={18} className="text-theme-purple" />
        </div>
        
        <div className="flex items-center bg-theme-amber/10 px-2 py-1 rounded-full">
          <Coins size={14} className="text-theme-amber mr-1" />
          <span className="font-medium text-theme-amber">{gift.tokenCost}</span>
        </div>
      </div>
      
      <h3 className="font-medium text-sm mb-1">{gift.name}</h3>
      
      <p className="text-xs text-gray-500 mb-3">{gift.description}</p>
      
      {editMode ? (
        <div className="flex justify-end space-x-2">
          <button 
            onClick={onDelete}
            className="p-1.5 rounded-full bg-red-100 text-red-500 hover:bg-red-200 transition-colors"
          >
            <Trash size={14} />
          </button>
          
          <button 
            className="p-1.5 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors"
          >
            <Edit size={14} />
          </button>
        </div>
      ) : isAssigned ? (
        <div className="flex items-center justify-between mt-2">
          <span className="text-xs text-gray-500">
            Assigné à {childName}
          </span>
          <div className="flex items-center justify-center w-6 h-6 bg-green-100 text-green-500 rounded-full">
            <Check size={14} />
          </div>
        </div>
      ) : (
        <button
          onClick={onAssign}
          disabled={!canAfford}
          className={`w-full py-1.5 px-3 rounded-lg text-xs font-medium ${
            canAfford 
              ? 'bg-theme-purple text-white hover:bg-theme-purple-dark' 
              : 'bg-gray-200 text-gray-500 cursor-not-allowed'
          } transition-colors`}
        >
          {canAfford ? 'Obtenir' : 'Insuffisant'}
        </button>
      )}
    </div>
  );
};

export default GiftCard;
