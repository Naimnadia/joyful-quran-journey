
export interface Child {
  id: string;
  name: string;
  avatar?: string;
  createdAt: string;
}

export interface Recording {
  id?: string; // Adding an optional id field for database operations
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
  id?: string; // Adding an optional id field for database operations
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
