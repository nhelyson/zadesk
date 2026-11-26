export type Pulse3DStatus = 'OPEN' | 'ACTIVE' | 'WAITING_CUSTOMER' | 'RESOLVED';

export interface Pulse3DMessage {
  id: string;
  senderType: 'CUSTOMER' | 'AGENT' | 'AI' | 'INTERNAL_NOTE';
  senderName: string;
  content: string;
  createdAt: string;
  isInternalNote?: boolean;
}

export interface Pulse3DConversation {
  id: string;
  customerName: string;
  customerPhone?: string;
  category: string;
  status: Pulse3DStatus;
  unreadCount: number;
  ticketRef?: string;
  lastMessage: string;
  lastMessageAt: string;
  x: number;
  y: number;
  z: number;
  messages: Pulse3DMessage[];
}

export interface Pulse3DConnection {
  id: string;
  fromId: string;
  toId: string;
  kind: 'cluster' | 'ticket';
  category: string;
}

export interface Pulse3DClusterCenter {
  name: string;
  x: number;
  y: number;
  z: number;
  color: string;
}
