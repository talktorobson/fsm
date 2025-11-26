/**
 * AI Assistant Button
 * Floating action button to open the AI chat widget
 */

import { Bot, X } from 'lucide-react';
import clsx from 'clsx';

interface AIAssistantButtonProps {
  onClick: () => void;
  isOpen: boolean;
  hasUnread?: boolean;
}

export default function AIAssistantButton({
  onClick,
  isOpen,
  hasUnread = false,
}: AIAssistantButtonProps) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        'fixed bottom-6 right-6 z-50',
        'w-14 h-14 rounded-full shadow-lg',
        'flex items-center justify-center',
        'transition-all duration-300 ease-in-out',
        'focus:outline-none focus:ring-2 focus:ring-offset-2',
        isOpen
          ? 'bg-gray-700 hover:bg-gray-800 focus:ring-gray-500'
          : 'bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 focus:ring-green-500'
      )}
      aria-label={isOpen ? 'Close AI Assistant' : 'Open AI Assistant'}
    >
      {isOpen ? (
        <X className="w-6 h-6 text-white" />
      ) : (
        <>
          <Bot className="w-6 h-6 text-white" />
          {hasUnread && (
            <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-white" />
          )}
        </>
      )}
    </button>
  );
}
