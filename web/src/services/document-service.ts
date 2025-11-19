/**
 * Document Service
 * API calls for document and note management on service orders
 */

import apiClient from './api-client';
import { UUID, ISODateString } from '@/types';

// Document types
export enum DocumentType {
  NOTE = 'NOTE',
  PHOTO = 'PHOTO',
  PDF = 'PDF',
  CONTRACT = 'CONTRACT',
  INVOICE = 'INVOICE',
  OTHER = 'OTHER',
}

export enum NoteType {
  GENERAL = 'GENERAL',
  CUSTOMER_PREFERENCE = 'CUSTOMER_PREFERENCE',
  TECHNICAL = 'TECHNICAL',
  SAFETY = 'SAFETY',
}

export enum NotePriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
}

export enum NoteVisibility {
  ALL = 'ALL',
  OPERATORS_ONLY = 'OPERATORS_ONLY',
  PROVIDERS_ONLY = 'PROVIDERS_ONLY',
}

// Document interface
export interface Document {
  id: UUID;
  serviceOrderId: UUID;
  type: DocumentType;
  title: string;
  description?: string;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  mimeType?: string;
  uploadedBy: string;
  uploadedByName?: string;
  uploadedAt: ISODateString;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

// Note interface
export interface Note {
  id: UUID;
  serviceOrderId: UUID;
  noteType: NoteType;
  title: string;
  content: string;
  priority: NotePriority;
  visibility: NoteVisibility;
  createdBy: string;
  createdByName?: string;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

// DTOs
export interface UploadDocumentDto {
  file: File;
  documentType: DocumentType;
  title: string;
  description?: string;
}

export interface CreateNoteDto {
  noteType: NoteType;
  title: string;
  content: string;
  priority: NotePriority;
  visibility: NoteVisibility;
}

export interface DocumentsAndNotesResponse {
  documents: Document[];
  notes: Note[];
  totalCount: number;
}

class DocumentService {
  /**
   * Upload a document to a service order
   */
  async uploadDocument(
    serviceOrderId: string,
    data: UploadDocumentDto
  ): Promise<Document> {
    const formData = new FormData();
    formData.append('file', data.file);
    formData.append('documentType', data.documentType);
    formData.append('title', data.title);
    if (data.description) {
      formData.append('description', data.description);
    }

    const response = await apiClient.post<Document>(
      `/cockpit/service-orders/${serviceOrderId}/documents`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  }

  /**
   * Create a note on a service order
   */
  async createNote(
    serviceOrderId: string,
    data: CreateNoteDto
  ): Promise<Note> {
    const response = await apiClient.post<Note>(
      `/cockpit/service-orders/${serviceOrderId}/notes`,
      data
    );
    return response.data;
  }

  /**
   * Get all documents and notes for a service order
   */
  async getDocumentsAndNotes(
    serviceOrderId: string
  ): Promise<DocumentsAndNotesResponse> {
    const response = await apiClient.get<DocumentsAndNotesResponse>(
      `/cockpit/service-orders/${serviceOrderId}/documents-and-notes`
    );
    return response.data;
  }

  /**
   * Delete a document
   */
  async deleteDocument(documentId: string): Promise<void> {
    await apiClient.delete(`/cockpit/documents/${documentId}`);
  }

  /**
   * Delete a note
   */
  async deleteNote(noteId: string): Promise<void> {
    await apiClient.delete(`/cockpit/notes/${noteId}`);
  }

  /**
   * Update a note
   */
  async updateNote(
    noteId: string,
    data: Partial<CreateNoteDto>
  ): Promise<Note> {
    const response = await apiClient.patch<Note>(
      `/cockpit/notes/${noteId}`,
      data
    );
    return response.data;
  }

  /**
   * Download a document
   */
  getDocumentDownloadUrl(documentId: string): string {
    return `${apiClient.defaults.baseURL}/cockpit/documents/${documentId}/download`;
  }
}

export const documentService = new DocumentService();
