/**
 * AI Chat Hook
 * Manages AI chat state and integrates with AI chat service
 * Supports quick actions that can trigger modals
 */

import { useState, useCallback } from 'react';
import { ChatMessage } from '../components/ai/AIChatWidget';
import { aiChatService } from '../services/ai-chat-service';

// Simple ID generator
const generateId = () => `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

// Modal action types that can be triggered by AI
export type ModalActionType = 
  | 'assign_technician'
  | 'reschedule'
  | 'contact_customer'
  | 'sign_contract'
  | 'handle_wcf'
  | 'daily_summary'
  | 'view_service_order';

export interface ModalAction {
  type: ModalActionType;
  data?: Record<string, unknown>;
}

// Quick action definition
export interface QuickAction {
  id: string;
  label: string;
  icon: string;
  description: string;
}

// Define available quick actions
const quickActionsConfig: QuickAction[] = [
  {
    id: 'pending_contracts',
    label: 'Pending Contracts',
    icon: '📋',
    description: 'View contracts awaiting signature',
  },
  {
    id: 'available_pros',
    label: 'Available Pros',
    icon: '👷',
    description: 'See available professionals',
  },
  {
    id: 'daily_summary',
    label: 'Daily Summary',
    icon: '📊',
    description: 'Today\'s operations overview',
  },
  {
    id: 'pending_wcf',
    label: 'Pending WCF',
    icon: '📝',
    description: 'Work completion forms status',
  },
];

export function useAIChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [currentAction, setCurrentAction] = useState<ModalAction | null>(null);

  const sendMessage = useCallback(async (content: string) => {
    // Add user message
    const userMessage: ChatMessage = {
      id: generateId(),
      role: 'user',
      content,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);

    // Add loading message
    const loadingId = generateId();
    setMessages((prev) => [
      ...prev,
      {
        id: loadingId,
        role: 'assistant',
        content: '',
        timestamp: new Date(),
        isLoading: true,
      },
    ]);
    setIsLoading(true);

    try {
      // Get AI response from service
      const response = await aiChatService.sendMessage(content);

      // Replace loading message with actual response
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === loadingId
            ? {
                ...msg,
                content: response.content,
                isLoading: false,
              }
            : msg
        )
      );

      // Check for suggested modal actions based on content
      const lowerContent = content.toLowerCase();
      if (lowerContent.includes('assign') || lowerContent.includes('pro')) {
        setCurrentAction({ type: 'assign_technician' });
      } else if (lowerContent.includes('contract')) {
        setCurrentAction({ type: 'sign_contract' });
      } else if (lowerContent.includes('wcf') || lowerContent.includes('completion')) {
        setCurrentAction({ type: 'handle_wcf' });
      } else if (lowerContent.includes('summary') || lowerContent.includes('today')) {
        setCurrentAction({ type: 'daily_summary' });
      }
    } catch (error) {
      console.error('AI Chat error:', error);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === loadingId
            ? {
                ...msg,
                content: 'Sorry, I encountered an error. Please try again.',
                isLoading: false,
              }
            : msg
        )
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  const executeQuickAction = useCallback(async (actionId: string) => {
    const action = quickActionsConfig.find((a) => a.id === actionId);
    if (!action) return;

    // Add a message indicating the action
    const actionMessage: ChatMessage = {
      id: generateId(),
      role: 'user',
      content: `${action.icon} ${action.label}`,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, actionMessage]);

    // Add loading message
    const loadingId = generateId();
    setMessages((prev) => [
      ...prev,
      {
        id: loadingId,
        role: 'assistant',
        content: '',
        timestamp: new Date(),
        isLoading: true,
      },
    ]);
    setIsLoading(true);

    try {
      // Map action IDs to message prompts
      const promptMap: Record<string, string> = {
        pending_contracts: 'Show pending contracts',
        available_pros: 'Show available professionals',
        daily_summary: 'Give me a daily summary',
        pending_wcf: 'Show pending WCF status',
      };

      const response = await aiChatService.sendMessage(promptMap[actionId] || action.label);

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === loadingId
            ? {
                ...msg,
                content: response.content,
                isLoading: false,
              }
            : msg
        )
      );

      // Map quick action to modal action
      const modalMapping: Record<string, ModalActionType> = {
        pending_contracts: 'sign_contract',
        available_pros: 'assign_technician',
        daily_summary: 'daily_summary',
        pending_wcf: 'handle_wcf',
      };

      if (modalMapping[actionId]) {
        setCurrentAction({
          type: modalMapping[actionId],
        });
      }
    } catch (error) {
      console.error('Quick action error:', error);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === loadingId
            ? {
                ...msg,
                content: 'Sorry, I couldn\'t complete that action. Please try again.',
                isLoading: false,
              }
            : msg
        )
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  const toggleChat = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const openChat = useCallback(() => {
    setIsOpen(true);
  }, []);

  const closeChat = useCallback(() => {
    setIsOpen(false);
  }, []);

  const clearCurrentAction = useCallback(() => {
    setCurrentAction(null);
  }, []);

  const triggerAction = useCallback((type: ModalActionType, data?: Record<string, unknown>) => {
    setCurrentAction({ type, data });
  }, []);

  return {
    messages,
    isLoading,
    isOpen,
    quickActions: quickActionsConfig,
    currentAction,
    sendMessage,
    executeQuickAction,
    clearMessages,
    toggleChat,
    openChat,
    closeChat,
    clearCurrentAction,
    triggerAction,
  };
}
