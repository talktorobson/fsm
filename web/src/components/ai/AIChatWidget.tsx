/**
 * AI Chat Widget
 * Full chat interface with message history and quick actions
 * Based on Operator Cockpit design
 */

import { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  Send, 
  FileText, 
  Users, 
  Calendar, 
  ClipboardCheck,
  Loader2,
  Sparkles,
  X
} from 'lucide-react';
import clsx from 'clsx';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isLoading?: boolean;
}

export interface QuickAction {
  id: string;
  label: string;
  icon: typeof FileText;
  prompt: string;
}

interface AIChatWidgetProps {
  isOpen: boolean;
  onClose: () => void;
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  isLoading?: boolean;
  userName?: string;
}

const defaultQuickActions: QuickAction[] = [
  {
    id: 'contracts',
    label: 'Pending Contracts',
    icon: FileText,
    prompt: 'Show me all pending contracts that need attention',
  },
  {
    id: 'assign',
    label: 'Assign Pro',
    icon: Users,
    prompt: 'Help me assign a professional to a service order',
  },
  {
    id: 'summary',
    label: 'Daily Summary',
    icon: Calendar,
    prompt: 'Give me a summary of today\'s operations',
  },
  {
    id: 'wcf',
    label: 'WCF Status',
    icon: ClipboardCheck,
    prompt: 'Show me work completion forms that need signatures',
  },
];

export default function AIChatWidget({
  isOpen,
  onClose,
  messages,
  onSendMessage,
  isLoading = false,
  userName = 'Operator',
}: AIChatWidgetProps) {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (input.trim() && !isLoading) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleQuickAction = (action: QuickAction) => {
    onSendMessage(action.prompt);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-24 right-6 z-50 w-96 max-h-[600px] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-white">AI Assistant</h3>
            <p className="text-xs text-green-100">Always here to help</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-white/10 rounded-lg transition-colors"
        >
          <X className="w-5 h-5 text-white" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[300px] max-h-[400px]">
        {messages.length === 0 ? (
          <div className="text-center py-8">
            <Sparkles className="w-12 h-12 mx-auto text-green-500 mb-3" />
            <h4 className="font-medium text-gray-900 mb-1">
              Hello, {userName}!
            </h4>
            <p className="text-sm text-gray-500 mb-4">
              I can help you with contracts, assignments, and daily operations.
            </p>
            
            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-2">
              {defaultQuickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <button
                    key={action.id}
                    onClick={() => handleQuickAction(action)}
                    className="flex items-center gap-2 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg text-left transition-colors"
                  >
                    <Icon className="w-4 h-4 text-green-600 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{action.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <div
                key={message.id}
                className={clsx(
                  'flex',
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                <div
                  className={clsx(
                    'max-w-[80%] rounded-2xl px-4 py-2',
                    message.role === 'user'
                      ? 'bg-green-600 text-white rounded-br-md'
                      : 'bg-gray-100 text-gray-900 rounded-bl-md'
                  )}
                >
                  {message.isLoading ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-sm">Thinking...</span>
                    </div>
                  ) : (
                    <>
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      <p
                        className={clsx(
                          'text-xs mt-1',
                          message.role === 'user'
                            ? 'text-green-200'
                            : 'text-gray-400'
                        )}
                      >
                        {formatTime(message.timestamp)}
                      </p>
                    </>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask me anything..."
            className="flex-1 px-4 py-2 bg-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white transition-all"
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className={clsx(
              'p-2 rounded-full transition-colors',
              input.trim() && !isLoading
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            )}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
