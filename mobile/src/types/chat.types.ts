/**
 * Yellow Grid Mobile - Chat/Messaging Types
 * For 4-party conversations: Customer, Operator, WorkTeam, Provider Manager
 */

export enum ParticipantType {
  CUSTOMER = 'CUSTOMER',
  OPERATOR = 'OPERATOR',
  WORK_TEAM = 'WORK_TEAM',
  PROVIDER_MANAGER = 'PROVIDER_MANAGER',
  SYSTEM = 'SYSTEM',
}

export enum MessageType {
  TEXT = 'TEXT',
  IMAGE = 'IMAGE',
  DOCUMENT = 'DOCUMENT',
  VOICE = 'VOICE',
  LOCATION = 'LOCATION',
  SYSTEM = 'SYSTEM',
}

export enum MessageStatus {
  SENDING = 'SENDING',
  SENT = 'SENT',
  DELIVERED = 'DELIVERED',
  READ = 'READ',
}

export enum ConversationStatus {
  ACTIVE = 'ACTIVE',
  ARCHIVED = 'ARCHIVED',
  CLOSED = 'CLOSED',
}

export interface MessageAttachment {
  type: string;
  url: string;
  name: string;
  size?: number;
}

export interface ConversationParticipant {
  id: string;
  conversationId: string;
  userId?: string;
  customerEmail?: string;
  customerPhone?: string;
  participantType: ParticipantType;
  displayName: string;
  workTeamId?: string;
  providerId?: string;
  isActive: boolean;
  joinedAt: string;
  leftAt?: string;
  lastReadAt?: string;
  lastReadMessageId?: string;
  notificationsEnabled: boolean;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  participantId: string;
  participant: ConversationParticipant;
  messageType: MessageType;
  content: string;
  attachments?: MessageAttachment[];
  replyToMessageId?: string;
  replyTo?: ChatMessage;
  status: MessageStatus;
  isEdited: boolean;
  editedAt?: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Conversation {
  id: string;
  serviceOrderId: string;
  status: ConversationStatus;
  countryCode: string;
  businessUnit: string;
  participantIds: string[];
  participants: ConversationParticipant[];
  messages?: ChatMessage[];
  lastMessageAt?: string;
  lastMessagePreview?: string;
  unreadCount: number;
  serviceOrder?: {
    id: string;
    externalServiceOrderId?: string;
    serviceType: string;
    state: string;
    customerInfo: any;
    serviceAddress: any;
  };
  createdAt: string;
  updatedAt: string;
}

export interface SendMessageRequest {
  content: string;
  messageType?: MessageType;
  attachments?: MessageAttachment[];
  replyToMessageId?: string;
}

export interface ChatState {
  conversations: Conversation[];
  activeConversation: Conversation | null;
  messages: ChatMessage[];
  unreadCount: number;
  isLoading: boolean;
  isSending: boolean;
  error: string | null;
}
