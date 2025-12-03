/**
 * Yellow Grid Mobile - Chat Service
 * Handles messaging between Customer, Operator, WorkTeam, and Provider Manager
 */

import { apiService } from './api.service';
import type {
  Conversation,
  ChatMessage,
  SendMessageRequest,
} from '../types/chat.types';

export interface ConversationsResponse {
  data: Conversation[];
  meta: {
    total: number;
    skip: number;
    take: number;
  };
}

export interface MessagesResponse {
  data: ChatMessage[];
  meta: {
    total: number;
    hasMore: boolean;
    cursor: string | null;
  };
}

class ChatService {
  /**
   * Get or create a conversation for a service order
   */
  async getOrCreateConversation(serviceOrderId: string): Promise<Conversation> {
    return apiService.post<Conversation>(
      `/chat/service-orders/${serviceOrderId}/conversation`
    );
  }

  /**
   * Get conversation for a service order (without creating)
   */
  async getConversationByServiceOrder(serviceOrderId: string): Promise<Conversation | null> {
    try {
      return await apiService.get<Conversation>(
        `/chat/service-orders/${serviceOrderId}/conversation`
      );
    } catch (error: any) {
      if (error?.response?.status === 404) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Get all conversations for the current user
   */
  async getConversations(params?: {
    serviceOrderId?: string;
    skip?: number;
    take?: number;
    unreadOnly?: boolean;
  }): Promise<ConversationsResponse> {
    const queryParams = new URLSearchParams();

    if (params?.serviceOrderId) {
      queryParams.set('serviceOrderId', params.serviceOrderId);
    }
    if (params?.skip !== undefined) {
      queryParams.set('skip', String(params.skip));
    }
    if (params?.take !== undefined) {
      queryParams.set('take', String(params.take));
    }
    if (params?.unreadOnly !== undefined) {
      queryParams.set('unreadOnly', String(params.unreadOnly));
    }

    return apiService.get<ConversationsResponse>(
      `/chat/conversations?${queryParams.toString()}`
    );
  }

  /**
   * Get a specific conversation by ID
   */
  async getConversation(conversationId: string): Promise<Conversation> {
    return apiService.get<Conversation>(`/chat/conversations/${conversationId}`);
  }

  /**
   * Get messages in a conversation
   */
  async getMessages(
    conversationId: string,
    params?: {
      skip?: number;
      take?: number;
      cursor?: string;
      sortOrder?: 'asc' | 'desc';
    }
  ): Promise<MessagesResponse> {
    const queryParams = new URLSearchParams();

    if (params?.skip !== undefined) {
      queryParams.set('skip', String(params.skip));
    }
    if (params?.take !== undefined) {
      queryParams.set('take', String(params.take));
    }
    if (params?.cursor) {
      queryParams.set('cursor', params.cursor);
    }
    if (params?.sortOrder) {
      queryParams.set('sortOrder', params.sortOrder);
    }

    return apiService.get<MessagesResponse>(
      `/chat/conversations/${conversationId}/messages?${queryParams.toString()}`
    );
  }

  /**
   * Send a message in a conversation
   */
  async sendMessage(
    conversationId: string,
    message: SendMessageRequest
  ): Promise<ChatMessage> {
    return apiService.post<ChatMessage>(
      `/chat/conversations/${conversationId}/messages`,
      message
    );
  }

  /**
   * Mark messages as read
   */
  async markAsRead(
    conversationId: string,
    lastReadMessageId: string
  ): Promise<{ success: boolean }> {
    return apiService.post<{ success: boolean }>(
      `/chat/conversations/${conversationId}/read`,
      { lastReadMessageId }
    );
  }

  /**
   * Edit a message
   */
  async editMessage(messageId: string, content: string): Promise<ChatMessage> {
    return apiService.patch<ChatMessage>(`/chat/messages/${messageId}`, {
      content,
    });
  }

  /**
   * Delete a message
   */
  async deleteMessage(messageId: string): Promise<void> {
    return apiService.delete(`/chat/messages/${messageId}`);
  }

  /**
   * Get total unread count across all conversations
   */
  async getUnreadCount(): Promise<{ unreadCount: number }> {
    return apiService.get<{ unreadCount: number }>('/chat/unread-count');
  }
}

export const chatService = new ChatService();
