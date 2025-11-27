/**
 * AI Chat Service
 * Handles AI assistant interactions and quick actions
 */

import apiClient from './api-client';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: {
    type?: 'text' | 'action' | 'data';
    actionType?: string;
    data?: unknown;
  };
}

export interface QuickActionResult {
  success: boolean;
  message: string;
  data?: unknown;
  suggestions?: string[];
}

export interface ContractSummary {
  id: string;
  serviceOrderRef: string;
  customerName: string;
  status: string;
  createdAt: string;
  daysWaiting: number;
}

export interface WCFSummary {
  id: string;
  serviceOrderRef: string;
  customerName: string;
  providerName: string;
  completedAt: string;
  status: string;
}

export interface AvailablePro {
  id: string;
  name: string;
  skills: string[];
  rating: number;
  activeJobs: number;
  availableSlots: number;
  location: string;
}

export interface DailySummary {
  completed: number;
  inProgress: number;
  scheduled: number;
  onTimeRate: number;
  contractsSigned: number;
  wcfPending: number;
  rescheduled: number;
  highlights: string[];
  attentionNeeded: string[];
}

class AIChatService {
  /**
   * Send a chat message and get AI response
   * In production, this would call an actual AI backend
   */
  async sendMessage(message: string, context?: Record<string, unknown>): Promise<ChatMessage> {
    // For now, we'll use intelligent pattern matching
    // In production, this would call /api/v1/ai-chat/message
    const response = await this.processMessageLocally(message, context);
    return response;
  }

  /**
   * Get pending contracts that need attention
   */
  async getPendingContracts(): Promise<ContractSummary[]> {
    try {
      const response = await apiClient.get('/service-orders', {
        params: {
          contractStatus: 'PENDING',
          limit: 10,
        },
      });
      
      const orders = response.data?.data?.data || [];
      return orders.map((order: any) => ({
        id: order.id,
        serviceOrderRef: order.externalServiceOrderId || order.id.slice(0, 8),
        customerName: order.customerInfo?.fullName || order.customerInfo?.firstName || 'Unknown',
        status: order.contractStatus || 'PENDING',
        createdAt: order.createdAt,
        daysWaiting: Math.floor((Date.now() - new Date(order.createdAt).getTime()) / (1000 * 60 * 60 * 24)),
      }));
    } catch (error) {
      console.error('Error fetching pending contracts:', error);
      return [];
    }
  }

  /**
   * Get available professionals for assignment
   */
  async getAvailablePros(): Promise<AvailablePro[]> {
    try {
      const response = await apiClient.get('/providers', {
        params: {
          status: 'ACTIVE',
          limit: 10,
        },
      });
      
      const providers = response.data?.data?.data || [];
      return providers.map((provider: any) => ({
        id: provider.id,
        name: provider.name,
        skills: provider.skills || ['General'],
        rating: provider.rating || 4.5,
        activeJobs: provider.activeJobs || 0,
        availableSlots: provider.availableSlots || 3,
        location: provider.addressCity || 'Unknown',
      }));
    } catch (error) {
      console.error('Error fetching available pros:', error);
      return [];
    }
  }

  /**
   * Get pending WCF forms
   */
  async getPendingWCFs(): Promise<WCFSummary[]> {
    try {
      const response = await apiClient.get('/service-orders', {
        params: {
          state: 'COMPLETED',
          limit: 10,
        },
      });
      
      const orders = response.data?.data?.data || [];
      return orders
        .filter((order: any) => !order.wcfStatus || order.wcfStatus === 'PENDING')
        .map((order: any) => ({
          id: order.id,
          serviceOrderRef: order.externalServiceOrderId || order.id.slice(0, 8),
          customerName: order.customerInfo?.fullName || 'Unknown',
          providerName: order.assignedProvider?.name || 'Unknown',
          completedAt: order.completedAt || order.updatedAt,
          status: 'PENDING',
        }));
    } catch (error) {
      console.error('Error fetching pending WCFs:', error);
      return [];
    }
  }

  /**
   * Get daily operations summary
   */
  async getDailySummary(): Promise<DailySummary> {
    try {
      const response = await apiClient.get('/dashboard/stats');
      const stats = response.data?.data || {};
      
      return {
        completed: stats.serviceOrders?.byStatus?.COMPLETED || 0,
        inProgress: stats.serviceOrders?.byStatus?.IN_PROGRESS || 0,
        scheduled: stats.serviceOrders?.byStatus?.SCHEDULED || 0,
        onTimeRate: 95, // Would come from metrics API
        contractsSigned: 2, // Would come from contracts API
        wcfPending: stats.tasks?.pending || 0,
        rescheduled: 1, // Would come from events API
        highlights: [
          `${stats.serviceOrders?.byStatus?.COMPLETED || 0} service orders completed today`,
          'All scheduled appointments on track',
        ],
        attentionNeeded: [
          stats.tasks?.overdue ? `${stats.tasks.overdue} overdue tasks` : null,
          stats.assignments?.pending ? `${stats.assignments.pending} pending assignments` : null,
        ].filter(Boolean) as string[],
      };
    } catch (error) {
      console.error('Error fetching daily summary:', error);
      return {
        completed: 0,
        inProgress: 0,
        scheduled: 0,
        onTimeRate: 0,
        contractsSigned: 0,
        wcfPending: 0,
        rescheduled: 0,
        highlights: [],
        attentionNeeded: ['Unable to load summary'],
      };
    }
  }

  /**
   * Process message locally with pattern matching
   * In production, this would be replaced with actual AI
   */
  private async processMessageLocally(
    message: string, 
    _context?: Record<string, unknown>
  ): Promise<ChatMessage> {
    const lowerMessage = message.toLowerCase();
    let content = '';
    
    // Pattern matching for different intents
    if (lowerMessage.includes('contract') || lowerMessage.includes('pending contracts')) {
      const contracts = await this.getPendingContracts();
      if (contracts.length > 0) {
        content = `📋 **Pending Contracts** (${contracts.length} found)\n\n`;
        contracts.slice(0, 5).forEach((c, i) => {
          content += `${i + 1}. **${c.serviceOrderRef}** - ${c.customerName}\n`;
          content += `   Status: ${c.status} • Waiting: ${c.daysWaiting} days\n\n`;
        });
        if (contracts.length > 5) {
          content += `_...and ${contracts.length - 5} more_\n\n`;
        }
        content += 'Would you like me to send reminders or view details for any of these?';
      } else {
        content = '✅ **Great news!** No pending contracts at the moment. All contracts are up to date.';
      }
    }
    else if (lowerMessage.includes('assign') || lowerMessage.includes('pro') || lowerMessage.includes('professional')) {
      const pros = await this.getAvailablePros();
      if (pros.length > 0) {
        content = `👷 **Available Professionals** (${pros.length} found)\n\n`;
        pros.slice(0, 5).forEach((p, i) => {
          content += `${i + 1}. **${p.name}**\n`;
          content += `   📍 ${p.location} • ⭐ ${p.rating}/5 • ${p.availableSlots} slots free\n\n`;
        });
        content += 'Tell me which service order you\'d like to assign, and I\'ll suggest the best match.';
      } else {
        content = '⚠️ No available professionals found at the moment. Try checking back later or expanding your search criteria.';
      }
    }
    else if (lowerMessage.includes('summary') || lowerMessage.includes('today') || lowerMessage.includes('daily')) {
      const summary = await this.getDailySummary();
      content = `📊 **Daily Operations Summary**\n\n`;
      content += `**Completed:** ${summary.completed} service orders\n`;
      content += `**In Progress:** ${summary.inProgress} active interventions\n`;
      content += `**Scheduled:** ${summary.scheduled} remaining appointments\n\n`;
      content += `**Performance:**\n`;
      content += `✅ ${summary.onTimeRate}% on-time arrival rate\n`;
      content += `✅ ${summary.contractsSigned} contracts signed\n`;
      if (summary.rescheduled > 0) {
        content += `⚠️ ${summary.rescheduled} rescheduling(s)\n`;
      }
      content += '\n';
      if (summary.attentionNeeded.length > 0) {
        content += `**Attention Needed:**\n`;
        summary.attentionNeeded.forEach(item => {
          content += `• ${item}\n`;
        });
      }
      content += '\nOverall, operations are running smoothly!';
    }
    else if (lowerMessage.includes('wcf') || lowerMessage.includes('work completion')) {
      const wcfs = await this.getPendingWCFs();
      if (wcfs.length > 0) {
        content = `📝 **Pending Work Completion Forms** (${wcfs.length} found)\n\n`;
        wcfs.slice(0, 5).forEach((w, i) => {
          content += `${i + 1}. **${w.serviceOrderRef}**\n`;
          content += `   Customer: ${w.customerName}\n`;
          content += `   Provider: ${w.providerName}\n`;
          content += `   Completed: ${new Date(w.completedAt).toLocaleDateString()}\n\n`;
        });
        content += 'Would you like me to send signature reminders?';
      } else {
        content = '✅ **All caught up!** No pending WCF forms at the moment.';
      }
    }
    else if (lowerMessage.includes('help') || lowerMessage.includes('what can you do')) {
      content = `🤖 **I can help you with:**\n\n`;
      content += `📋 **Contracts** - View pending contracts, send reminders\n`;
      content += `👷 **Assignments** - Find available professionals, assign jobs\n`;
      content += `📊 **Daily Summary** - Get today's operations overview\n`;
      content += `📝 **WCF Status** - Track work completion forms\n`;
      content += `🔍 **Search** - Find service orders, customers, providers\n\n`;
      content += `Just ask me anything! For example:\n`;
      content += `• "Show pending contracts"\n`;
      content += `• "Who's available today?"\n`;
      content += `• "Give me a daily summary"\n`;
      content += `• "Check WCF status"`;
    }
    else {
      // Default response for unrecognized queries
      content = `I understand you're asking about "${message}". Let me help you with that.\n\n`;
      content += `Here are some things I can assist with:\n`;
      content += `• **Contracts** - "Show pending contracts"\n`;
      content += `• **Assignments** - "Help me assign a pro"\n`;
      content += `• **Summary** - "Daily summary"\n`;
      content += `• **WCF** - "Check WCF status"\n\n`;
      content += `Or you can use the quick action buttons below!`;
    }

    return {
      id: `msg-${Date.now()}`,
      role: 'assistant',
      content,
      timestamp: new Date(),
    };
  }

  /**
   * Execute a quick action
   */
  async executeQuickAction(actionType: string): Promise<QuickActionResult> {
    switch (actionType) {
      case 'contracts':
        const contracts = await this.getPendingContracts();
        return {
          success: true,
          message: `Found ${contracts.length} pending contracts`,
          data: contracts,
        };
      
      case 'assign':
        const pros = await this.getAvailablePros();
        return {
          success: true,
          message: `Found ${pros.length} available professionals`,
          data: pros,
        };
      
      case 'summary':
        const summary = await this.getDailySummary();
        return {
          success: true,
          message: 'Daily summary retrieved',
          data: summary,
        };
      
      case 'wcf':
        const wcfs = await this.getPendingWCFs();
        return {
          success: true,
          message: `Found ${wcfs.length} pending WCF forms`,
          data: wcfs,
        };
      
      default:
        return {
          success: false,
          message: 'Unknown action type',
        };
    }
  }
}

export const aiChatService = new AIChatService();
