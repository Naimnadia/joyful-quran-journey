
export interface Child {
  id: string;
  name: string;
  avatar?: string;
  createdAt: string;
}

export interface Recording {
  date: string;
  audioUrl: string;
  childId?: string; // Link recordings to children
}

export interface TokenType {
  id: string;
  title: string;
  icon: string;
  description: string;
  unlocked: boolean;
  value: number;
}

export type CompletedDay = {
  date: string;
  childId: string;
};

export interface Gift {
  id: string;
  name: string;
  description: string;
  tokenCost: number;
  imageSrc?: string;
  assignedToChildId?: string; // Optional: if gift is assigned to specific child
}
