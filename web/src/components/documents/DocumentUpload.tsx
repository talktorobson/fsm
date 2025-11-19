/**
 * Document Upload Component
 * Allows uploading files (photos, PDFs, etc.) to service orders
 */

import { useState, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { documentService, DocumentType, type UploadDocumentDto } from '@/services/document-service';
import { Upload, X, FileText, Image, FileCheck } from 'lucide-react';
import { toast } from 'sonner';
import clsx from 'clsx';

interface DocumentUploadProps {
  serviceOrderId: string;
  onSuccess?: () => void;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const ALLOWED_MIME_TYPES = {
  [DocumentType.PHOTO]: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
  [DocumentType.PDF]: ['application/pdf'],
  [DocumentType.CONTRACT]: ['application/pdf'],
  [DocumentType.INVOICE]: ['application/pdf'],
  [DocumentType.OTHER]: ['*/*'],
};

export default function DocumentUpload({ serviceOrderId, onSuccess }: DocumentUploadProps) {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState<DocumentType>(DocumentType.PHOTO);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const uploadMutation = useMutation({
    mutationFn: (data: UploadDocumentDto) =>
      documentService.uploadDocument(serviceOrderId, data),
    onSuccess: () => {
      toast.success('Document uploaded successfully');
      queryClient.invalidateQueries({ queryKey: ['documents', serviceOrderId] });

      // Reset form
      setFile(null);
      setTitle('');
      setDescription('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      onSuccess?.();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to upload document');
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Validate file size
    if (selectedFile.size > MAX_FILE_SIZE) {
      toast.error('File size exceeds 10MB limit');
      return;
    }

    // Validate file type
    const allowedTypes = ALLOWED_MIME_TYPES[documentType];
    if (!allowedTypes.includes('*/*') && !allowedTypes.includes(selectedFile.type)) {
      toast.error(`Invalid file type. Please select a valid ${documentType.toLowerCase()} file.`);
      return;
    }

    setFile(selectedFile);

    // Auto-fill title if empty
    if (!title) {
      setTitle(selectedFile.name.replace(/\.[^/.]+$/, '')); // Remove extension
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!file) {
      toast.error('Please select a file');
      return;
    }

    if (!title.trim()) {
      toast.error('Please enter a title');
      return;
    }

    uploadMutation.mutate({
      file,
      documentType,
      title: title.trim(),
      description: description.trim() || undefined,
    });
  };

  const getFileIcon = () => {
    if (!file) return <Upload className="w-8 h-8 text-gray-400" />;

    if (file.type.startsWith('image/')) {
      return <Image className="w-8 h-8 text-blue-500" />;
    }

    if (file.type === 'application/pdf') {
      return <FileText className="w-8 h-8 text-red-500" />;
    }

    return <FileCheck className="w-8 h-8 text-gray-500" />;
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="card">
      <h3 className="text-lg font-semibold mb-4">Upload Document</h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Document Type Selector */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Document Type *
          </label>
          <select
            value={documentType}
            onChange={(e) => setDocumentType(e.target.value as DocumentType)}
            className="input w-full"
            disabled={uploadMutation.isPending}
          >
            <option value={DocumentType.PHOTO}>Photo</option>
            <option value={DocumentType.PDF}>PDF Document</option>
            <option value={DocumentType.CONTRACT}>Contract</option>
            <option value={DocumentType.INVOICE}>Invoice</option>
            <option value={DocumentType.OTHER}>Other</option>
          </select>
        </div>

        {/* File Upload Area */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            File *
          </label>

          {!file ? (
            <label
              htmlFor="file-upload"
              className={clsx(
                'flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-lg cursor-pointer transition-colors',
                'hover:bg-gray-50 border-gray-300 hover:border-primary-500'
              )}
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="w-10 h-10 mb-3 text-gray-400" />
                <p className="mb-2 text-sm text-gray-500">
                  <span className="font-semibold">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-gray-500">
                  {documentType === DocumentType.PHOTO && 'PNG, JPG, GIF up to 10MB'}
                  {documentType === DocumentType.PDF && 'PDF up to 10MB'}
                  {(documentType === DocumentType.CONTRACT || documentType === DocumentType.INVOICE) && 'PDF up to 10MB'}
                  {documentType === DocumentType.OTHER && 'Any file up to 10MB'}
                </p>
              </div>
              <input
                id="file-upload"
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={handleFileChange}
                accept={ALLOWED_MIME_TYPES[documentType].join(',')}
                disabled={uploadMutation.isPending}
              />
            </label>
          ) : (
            <div className="flex items-center gap-3 p-4 border border-gray-300 rounded-lg bg-gray-50">
              {getFileIcon()}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {file.name}
                </p>
                <p className="text-xs text-gray-500">
                  {formatFileSize(file.size)}
                </p>
              </div>
              <button
                type="button"
                onClick={handleRemoveFile}
                className="p-1 hover:bg-gray-200 rounded transition-colors"
                disabled={uploadMutation.isPending}
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
          )}
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
            placeholder="Enter document title..."
            maxLength={200}
            disabled={uploadMutation.isPending}
          />
        </div>

        {/* Description Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="input w-full"
            placeholder="Enter optional description..."
            rows={3}
            maxLength={500}
            disabled={uploadMutation.isPending}
          />
          <p className="text-xs text-gray-500 mt-1">
            {description.length}/500 characters
          </p>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end gap-2">
          <button
            type="submit"
            disabled={!file || !title.trim() || uploadMutation.isPending}
            className="btn btn-primary"
          >
            {uploadMutation.isPending ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Upload Document
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
