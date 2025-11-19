/**
 * Note Form Component
 * Allows creating and editing notes on service orders
 */

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  documentService,
  NoteType,
  NotePriority,
  NoteVisibility,
  type CreateNoteDto,
  type Note,
} from '@/services/document-service';
import { MessageSquare, AlertCircle, Info, Shield, Wrench } from 'lucide-react';
import { toast } from 'sonner';
import clsx from 'clsx';

interface NoteFormProps {
  serviceOrderId: string;
  existingNote?: Note;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function NoteForm({
  serviceOrderId,
  existingNote,
  onSuccess,
  onCancel,
}: NoteFormProps) {
  const queryClient = useQueryClient();
  const isEditing = !!existingNote;

  const [noteType, setNoteType] = useState<NoteType>(
    existingNote?.noteType || NoteType.GENERAL
  );
  const [title, setTitle] = useState(existingNote?.title || '');
  const [content, setContent] = useState(existingNote?.content || '');
  const [priority, setPriority] = useState<NotePriority>(
    existingNote?.priority || NotePriority.MEDIUM
  );
  const [visibility, setVisibility] = useState<NoteVisibility>(
    existingNote?.visibility || NoteVisibility.ALL
  );

  const createNoteMutation = useMutation({
    mutationFn: (data: CreateNoteDto) =>
      documentService.createNote(serviceOrderId, data),
    onSuccess: () => {
      toast.success('Note created successfully');
      queryClient.invalidateQueries({ queryKey: ['documents', serviceOrderId] });

      // Reset form
      setTitle('');
      setContent('');
      setNoteType(NoteType.GENERAL);
      setPriority(NotePriority.MEDIUM);
      setVisibility(NoteVisibility.ALL);

      onSuccess?.();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create note');
    },
  });

  const updateNoteMutation = useMutation({
    mutationFn: (data: Partial<CreateNoteDto>) =>
      documentService.updateNote(existingNote!.id, data),
    onSuccess: () => {
      toast.success('Note updated successfully');
      queryClient.invalidateQueries({ queryKey: ['documents', serviceOrderId] });
      onSuccess?.();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update note');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error('Please enter a title');
      return;
    }

    if (!content.trim()) {
      toast.error('Please enter content');
      return;
    }

    const noteData: CreateNoteDto = {
      noteType,
      title: title.trim(),
      content: content.trim(),
      priority,
      visibility,
    };

    if (isEditing) {
      updateNoteMutation.mutate(noteData);
    } else {
      createNoteMutation.mutate(noteData);
    }
  };

  const getNoteTypeIcon = () => {
    switch (noteType) {
      case NoteType.CUSTOMER_PREFERENCE:
        return <MessageSquare className="w-5 h-5" />;
      case NoteType.TECHNICAL:
        return <Wrench className="w-5 h-5" />;
      case NoteType.SAFETY:
        return <Shield className="w-5 h-5" />;
      default:
        return <Info className="w-5 h-5" />;
    }
  };

  const isPending = createNoteMutation.isPending || updateNoteMutation.isPending;

  return (
    <div className="card">
      <div className="flex items-center gap-2 mb-4">
        {getNoteTypeIcon()}
        <h3 className="text-lg font-semibold">
          {isEditing ? 'Edit Note' : 'Add Note'}
        </h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Note Type Selector */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Note Type *
          </label>
          <select
            value={noteType}
            onChange={(e) => setNoteType(e.target.value as NoteType)}
            className="input w-full"
            disabled={isPending}
          >
            <option value={NoteType.GENERAL}>General</option>
            <option value={NoteType.CUSTOMER_PREFERENCE}>Customer Preference</option>
            <option value={NoteType.TECHNICAL}>Technical</option>
            <option value={NoteType.SAFETY}>Safety</option>
          </select>
          <p className="text-xs text-gray-500 mt-1">
            {noteType === NoteType.GENERAL && 'General information about the service order'}
            {noteType === NoteType.CUSTOMER_PREFERENCE && 'Customer preferences and special requests'}
            {noteType === NoteType.TECHNICAL && 'Technical details and requirements'}
            {noteType === NoteType.SAFETY && 'Safety considerations and warnings'}
          </p>
        </div>

        {/* Title Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Title *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="input w-full"
            placeholder="Enter note title..."
            maxLength={200}
            disabled={isPending}
          />
        </div>

        {/* Content Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Content *
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="input w-full"
            placeholder="Enter note content..."
            rows={5}
            maxLength={2000}
            disabled={isPending}
          />
          <p className="text-xs text-gray-500 mt-1">
            {content.length}/2000 characters
          </p>
        </div>

        {/* Priority and Visibility Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Priority Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Priority *
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as NotePriority)}
              className="input w-full"
              disabled={isPending}
            >
              <option value={NotePriority.LOW}>Low</option>
              <option value={NotePriority.MEDIUM}>Medium</option>
              <option value={NotePriority.HIGH}>High</option>
            </select>
          </div>

          {/* Visibility Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Visibility *
            </label>
            <select
              value={visibility}
              onChange={(e) => setVisibility(e.target.value as NoteVisibility)}
              className="input w-full"
              disabled={isPending}
            >
              <option value={NoteVisibility.ALL}>Everyone</option>
              <option value={NoteVisibility.OPERATORS_ONLY}>Operators Only</option>
              <option value={NoteVisibility.PROVIDERS_ONLY}>Providers Only</option>
            </select>
          </div>
        </div>

        {/* Info Banner */}
        <div className="flex gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium">Note Visibility</p>
            <p className="mt-1 text-xs">
              {visibility === NoteVisibility.ALL && 'This note will be visible to both operators and providers.'}
              {visibility === NoteVisibility.OPERATORS_ONLY && 'This note will only be visible to operators.'}
              {visibility === NoteVisibility.PROVIDERS_ONLY && 'This note will only be visible to providers.'}
            </p>
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex justify-end gap-2">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="btn btn-secondary"
              disabled={isPending}
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={!title.trim() || !content.trim() || isPending}
            className={clsx(
              'btn',
              priority === NotePriority.HIGH ? 'btn-error' : 'btn-primary'
            )}
          >
            {isPending ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                {isEditing ? 'Updating...' : 'Creating...'}
              </>
            ) : (
              <>
                <MessageSquare className="w-4 h-4 mr-2" />
                {isEditing ? 'Update Note' : 'Create Note'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
