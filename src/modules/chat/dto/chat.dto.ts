import {
  IsString,
  IsOptional,
  IsEnum,
  IsUUID,
  MaxLength,
  IsArray,
  ValidateNested,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MessageType, ParticipantType } from '@prisma/client';

/**
 * DTO for creating a new conversation
 */
export class CreateConversationDto {
  @ApiProperty({ description: 'Service order ID this conversation belongs to' })
  @IsUUID()
  serviceOrderId: string;

  @ApiPropertyOptional({ description: 'Initial message content' })
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  initialMessage?: string;
}

/**
 * DTO for adding a participant to a conversation
 */
export class AddParticipantDto {
  @ApiPropertyOptional({ description: 'User ID for internal users' })
  @IsOptional()
  @IsUUID()
  userId?: string;

  @ApiPropertyOptional({ description: 'Customer email for external customers' })
  @IsOptional()
  @IsString()
  customerEmail?: string;

  @ApiPropertyOptional({ description: 'Customer phone for external customers' })
  @IsOptional()
  @IsString()
  customerPhone?: string;

  @ApiProperty({ description: 'Type of participant', enum: ParticipantType })
  @IsEnum(ParticipantType)
  participantType: ParticipantType;

  @ApiProperty({ description: 'Display name in conversation' })
  @IsString()
  @MaxLength(255)
  displayName: string;

  @ApiPropertyOptional({ description: 'Work team ID if participant is a work team member' })
  @IsOptional()
  @IsUUID()
  workTeamId?: string;

  @ApiPropertyOptional({ description: 'Provider ID if participant is from a provider' })
  @IsOptional()
  @IsUUID()
  providerId?: string;
}

/**
 * DTO for sending a message
 */
export class SendMessageDto {
  @ApiProperty({ description: 'Message content' })
  @IsString()
  @MaxLength(5000)
  content: string;

  @ApiPropertyOptional({ description: 'Message type', enum: MessageType, default: 'TEXT' })
  @IsOptional()
  @IsEnum(MessageType)
  messageType?: MessageType;

  @ApiPropertyOptional({ description: 'Attachments array [{type, url, name, size}]' })
  @IsOptional()
  @IsArray()
  attachments?: Array<{
    type: string;
    url: string;
    name: string;
    size?: number;
  }>;

  @ApiPropertyOptional({ description: 'ID of message being replied to' })
  @IsOptional()
  @IsUUID()
  replyToMessageId?: string;
}

/**
 * DTO for updating a message
 */
export class UpdateMessageDto {
  @ApiProperty({ description: 'Updated message content' })
  @IsString()
  @MaxLength(5000)
  content: string;
}

/**
 * DTO for marking messages as read
 */
export class MarkAsReadDto {
  @ApiProperty({ description: 'ID of the last message read' })
  @IsUUID()
  lastReadMessageId: string;
}

/**
 * Query params for listing messages
 */
export class ListMessagesQueryDto {
  @ApiPropertyOptional({ description: 'Number of messages to skip' })
  @IsOptional()
  skip?: number;

  @ApiPropertyOptional({ description: 'Number of messages to take', default: 50 })
  @IsOptional()
  take?: number;

  @ApiPropertyOptional({ description: 'Cursor for pagination (message ID to start after)' })
  @IsOptional()
  @IsUUID()
  cursor?: string;

  @ApiPropertyOptional({ description: 'Sort direction', default: 'desc' })
  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc';
}

/**
 * Query params for listing conversations
 */
export class ListConversationsQueryDto {
  @ApiPropertyOptional({ description: 'Filter by service order ID' })
  @IsOptional()
  @IsUUID()
  serviceOrderId?: string;

  @ApiPropertyOptional({ description: 'Number to skip' })
  @IsOptional()
  skip?: number;

  @ApiPropertyOptional({ description: 'Number to take', default: 20 })
  @IsOptional()
  take?: number;

  @ApiPropertyOptional({ description: 'Include only conversations with unread messages' })
  @IsOptional()
  @IsBoolean()
  unreadOnly?: boolean;
}
