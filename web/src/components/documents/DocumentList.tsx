/**
 * Document List Component
 * Displays all documents and notes for a service order
 */

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  documentService,
  type Document,
  type Note,
  DocumentType,
  NoteType,
  NotePriority,
} from '@/services/document-service';
import {
  FileText,
  Image,
  FileCheck,
  Download,
  Trash2,
  MessageSquare,
  Eye,
  Edit,
  Info,
  Shield,
  Wrench,
} from 'lucide-react';
import { toast } from 'sonner';
import { format, formatDistanceToNow } from 'date-fns';
import clsx from 'clsx';

interface DocumentListProps {
  serviceOrderId: string;
  onEditNote?: (note: Note) => void;
}

export default function DocumentList({ serviceOrderId, onEditNote }: DocumentListProps) {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<'all' | 'documents' | 'notes'>('all');
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['documents', serviceOrderId],
    queryFn: () => documentService.getDocumentsAndNotes(serviceOrderId),
  });

  const deleteDocumentMutation = useMutation({
    mutationFn: (documentId: string) => documentService.deleteDocument(documentId),
    onSuccess: () => {
      toast.success('Document deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['documents', serviceOrderId] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete document');
    },
  });

  const deleteNoteMutation = useMutation({
    mutationFn: (noteId: string) => documentService.deleteNote(noteId),
    onSuccess: () => {
      toast.success('Note deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['documents', serviceOrderId] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete note');
    },
  });

  const handleDeleteDocument = (documentId: string, title: string) => {
    if (confirm(`Are you sure you want to delete "${title}"?`)) {
      deleteDocumentMutation.mutate(documentId);
    }
  };

  const handleDeleteNote = (noteId: string, title: string) => {
    if (confirm(`Are you sure you want to delete the note "${title}"?`)) {
      deleteNoteMutation.mutate(noteId);
    }
  };

  const handleDownloadDocument = (document: Document) => {
    if (document.fileUrl) {
      window.open(document.fileUrl, '_blank');
    } else {
      const downloadUrl = documentService.getDocumentDownloadUrl(document.id);
      window.open(downloadUrl, '_blank');
    }
  };

  const getDocumentIcon = (type: DocumentType) => {
    switch (type) {
      case DocumentType.PHOTO:
        return <Image className="w-5 h-5 text-blue-500" />;
      case DocumentType.PDF:
      case DocumentType.CONTRACT:
      case DocumentType.INVOICE:
        return <FileText className="w-5 h-5 text-red-500" />;
      default:
        return <FileCheck className="w-5 h-5 text-gray-500" />;
    }
  };

  const getNoteIcon = (type: NoteType) => {
    switch (type) {
      case NoteType.CUSTOMER_PREFERENCE:
        return <MessageSquare className="w-5 h-5 text-blue-500" />;
      case NoteType.TECHNICAL:
        return <Wrench className="w-5 h-5 text-purple-500" />;
      case NoteType.SAFETY:
        return <Shield className="w-5 h-5 text-red-500" />;
      default:
        return <Info className="w-5 h-5 text-gray-500" />;
    }
  };

  const getPriorityBadge = (priority: NotePriority) => {
    const classes = {
      [NotePriority.HIGH]: 'badge-error',
      [NotePriority.MEDIUM]: 'badge-warning',
      [NotePriority.LOW]: 'badge-secondary',
    };
    return <span className={clsx('badge badge-sm', classes[priority])}>{priority}</span>;
  };

  const formatFileSize = (bytes?: number): string => {
    if (!bytes) return 'Unknown size';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  if (isLoading) {
    return (
      <div className="card">
        <div className="text-center py-12 text-gray-500">
          Loading documents and notes...
        </div>
      </div>
    );
  }

  const documents = data?.documents || [];
  const notes = data?.notes || [];
  const totalCount = data?.totalCount || 0;

  const filteredDocuments = filter === 'all' || filter === 'documents' ? documents : [];
  const filteredNotes = filter === 'all' || filter === 'notes' ? notes : [];

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">
          Documents & Notes
          <span className="ml-2 text-sm font-normal text-gray-500">
            ({totalCount} total)
          </span>
        </h3>

        {/* Filter Tabs */}
        <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setFilter('all')}
            className={clsx(
              'px-3 py-1 text-sm rounded transition-colors',
              filter === 'all'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            )}
          >
            All ({totalCount})
          </button>
          <button
            onClick={() => setFilter('documents')}
            className={clsx(
              'px-3 py-1 text-sm rounded transition-colors',
              filter === 'documents'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            )}
          >
            Documents ({documents.length})
          </button>
          <button
            onClick={() => setFilter('notes')}
            className={clsx(
              'px-3 py-1 text-sm rounded transition-colors',
              filter === 'notes'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            )}
          >
            Notes ({notes.length})
          </button>
        </div>
      </div>

      {/* Empty State */}
      {totalCount === 0 && (
        <div className="text-center py-12">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
              <FileText className="w-8 h-8 text-gray-400" />
            </div>
          </div>
          <h4 className="text-lg font-medium text-gray-900 mb-2">
            No documents or notes yet
          </h4>
          <p className="text-sm text-gray-500 mb-4">
            Upload documents or add notes to get started
          </p>
        </div>
      )}

      {/* Documents List */}
      {filteredDocuments.length > 0 && (
        <div className="space-y-2 mb-4">
          {filter === 'all' && (
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Documents</h4>
          )}
          {filteredDocuments.map((document) => (
            <div
              key={document.id}
              className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex-shrink-0 mt-0.5">
                {getDocumentIcon(document.type)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h5 className="text-sm font-medium text-gray-900 truncate">
                      {document.title}
                    </h5>
                    {document.description && (
                      <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                        {document.description}
                      </p>
                    )}
                  </div>
                  <span className="badge badge-sm flex-shrink-0">
                    {document.type}
                  </span>
                </div>

                <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                  <span>{formatFileSize(document.fileSize)}</span>
                  <span>•</span>
                  <span>
                    {document.uploadedByName || 'Unknown'} •{' '}
                    {formatDistanceToNow(new Date(document.uploadedAt), {
                      addSuffix: true,
                    })}
                  </span>
                </div>
              </div>

              <div className="flex gap-1 flex-shrink-0">
                <button
                  onClick={() => handleDownloadDocument(document)}
                  className="p-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded transition-colors"
                  title="Download"
                >
                  <Download className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setSelectedDocument(document)}
                  className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                  title="View"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteDocument(document.id, document.title)}
                  className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                  title="Delete"
                  disabled={deleteDocumentMutation.isPending}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Notes List */}
      {filteredNotes.length > 0 && (
        <div className="space-y-2">
          {filter === 'all' && filteredDocuments.length > 0 && (
            <h4 className="text-sm font-semibold text-gray-700 mb-2 mt-4">Notes</h4>
          )}
          {filteredNotes.map((note) => (
            <div
              key={note.id}
              className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex-shrink-0 mt-0.5">
                {getNoteIcon(note.noteType)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h5 className="text-sm font-medium text-gray-900">
                        {note.title}
                      </h5>
                      {getPriorityBadge(note.priority)}
                    </div>
                    <p className="text-sm text-gray-700 line-clamp-3">
                      {note.content}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                  <span className="badge badge-sm">{note.noteType}</span>
                  <span>•</span>
                  <span className="badge badge-sm">{note.visibility}</span>
                  <span>•</span>
                  <span>
                    {note.createdByName || 'Unknown'} •{' '}
                    {formatDistanceToNow(new Date(note.createdAt), {
                      addSuffix: true,
                    })}
                  </span>
                </div>
              </div>

              <div className="flex gap-1 flex-shrink-0">
                {onEditNote && (
                  <button
                    onClick={() => onEditNote(note)}
                    className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                    title="Edit"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => handleDeleteNote(note.id, note.title)}
                  className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                  title="Delete"
                  disabled={deleteNoteMutation.isPending}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Document Viewer Modal */}
      {selectedDocument && (
        <DocumentViewer
          document={selectedDocument}
          onClose={() => setSelectedDocument(null)}
        />
      )}
    </div>
  );
}

// Simple Document Viewer Modal
function DocumentViewer({
  document,
  onClose,
}: {
  document: Document;
  onClose: () => void;
}) {
  const isImage = document.type === DocumentType.PHOTO;
  const isPDF = [DocumentType.PDF, DocumentType.CONTRACT, DocumentType.INVOICE].includes(
    document.type
  );

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h3 className="text-lg font-semibold">{document.title}</h3>
            {document.description && (
              <p className="text-sm text-gray-600 mt-1">{document.description}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded transition-colors"
          >
            <Eye className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-4">
          {isImage && document.fileUrl && (
            <img
              src={document.fileUrl}
              alt={document.title}
              className="max-w-full h-auto mx-auto"
            />
          )}

          {isPDF && document.fileUrl && (
            <iframe
              src={document.fileUrl}
              className="w-full h-[600px] border-0"
              title={document.title}
            />
          )}

          {!isImage && !isPDF && (
            <div className="text-center py-12">
              <FileCheck className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">
                Preview not available. Click download to view this file.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t">
          <div className="text-sm text-gray-500">
            Uploaded {format(new Date(document.uploadedAt), 'MMM dd, yyyy HH:mm')} by{' '}
            {document.uploadedByName || 'Unknown'}
          </div>
          <button onClick={onClose} className="btn btn-secondary">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
