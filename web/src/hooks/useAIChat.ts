/**
 * AI Chat Hook
 * Manages AI chat state and simulates responses
 * In production, this would connect to an actual AI service
 */

import { useState, useCallback } from 'react';
import { ChatMessage } from '../components/ai/AIChatWidget';

// Simple ID generator
const generateId = () => `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

// Simulated AI responses based on keywords
const getAIResponse = (prompt: string): string => {
  const lowerPrompt = prompt.toLowerCase();

  if (lowerPrompt.includes('contract') || lowerPrompt.includes('pending contracts')) {
    return `I found 3 contracts that need attention:

1. **Contract #SO-2024-001** - Customer: Marie Dupont
   Status: Awaiting signature
   Service: Plumbing repair
   Due: Today at 5:00 PM

2. **Contract #SO-2024-002** - Customer: Jean Martin
   Status: Pending review
   Service: Electrical installation
   Due: Tomorrow

3. **Contract #SO-2024-003** - Customer: Sophie Bernard
   Status: Awaiting approval
   Service: HVAC maintenance
   Due: In 2 days

Would you like me to send reminders or take action on any of these?`;
  }

  if (lowerPrompt.includes('assign') || lowerPrompt.includes('pro')) {
    return `I can help you assign a professional. Here are the available pros for today:

**Available Now:**
• Pierre Durand (Plumbing) - 2 slots free
• Marc Leblanc (Electrical) - 3 slots free
• Anne Moreau (HVAC) - 1 slot free

**Partially Available:**
• Claude Petit (Multi-skill) - 1 slot at 4 PM

Please tell me which service order you'd like to assign, or I can suggest the best match based on skills and location.`;
  }

  if (lowerPrompt.includes('summary') || lowerPrompt.includes('today')) {
    return `📊 **Daily Operations Summary**

**Completed Today:** 12 service orders
**In Progress:** 5 active interventions
**Scheduled:** 8 remaining appointments

**Highlights:**
✅ 95% on-time arrival rate
✅ 2 contracts signed
⚠️ 1 rescheduling required (customer request)

**Attention Needed:**
• 2 WCF forms pending signature
• 1 customer follow-up required

Overall, operations are running smoothly today!`;
  }

  if (lowerPrompt.includes('wcf') || lowerPrompt.includes('work completion')) {
    return `I found 2 Work Completion Forms that need signatures:

1. **WCF #WCF-2024-045**
   Service Order: #SO-2024-015
   Customer: Philippe Robert
   Pro: Pierre Durand
   Work completed: Today at 2:30 PM
   Status: ⏳ Awaiting customer signature

2. **WCF #WCF-2024-046**
   Service Order: #SO-2024-016
   Customer: Isabelle Leroy
   Pro: Marc Leblanc
   Work completed: Today at 3:15 PM
   Status: ⏳ Awaiting pro confirmation

Would you like me to send signature reminders?`;
  }

  if (lowerPrompt.includes('help') || lowerPrompt.includes('what can you do')) {
    return `I'm your AI operations assistant. Here's what I can help you with:

🔹 **Contracts** - Review pending contracts, send reminders
🔹 **Assignments** - Find available pros, suggest best matches
🔹 **Daily Summary** - Get an overview of operations
🔹 **WCF Status** - Track work completion forms
🔹 **Scheduling** - Check availability, manage conflicts
🔹 **Customer Info** - Look up customer history

Just ask me anything about your operations!`;
  }

  // Default response
  return `I understand you're asking about "${prompt.slice(0, 50)}${prompt.length > 50 ? '...' : ''}". 

Let me help you with that. You can ask me about:
• Pending contracts and signatures
• Available professionals and assignments
• Daily operations summary
• Work completion form status
• Customer information

How can I assist you further?`;
};

export function useAIChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

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

    // Simulate AI response delay
    await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 1000));

    // Get AI response
    const response = getAIResponse(content);

    // Replace loading message with actual response
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === loadingId
          ? {
              ...msg,
              content: response,
              isLoading: false,
            }
          : msg
      )
    );
    setIsLoading(false);
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

  return {
    messages,
    isLoading,
    isOpen,
    sendMessage,
    clearMessages,
    toggleChat,
    openChat,
    closeChat,
  };
}
