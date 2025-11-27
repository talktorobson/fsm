/**
 * Customer Photos Page
 * View before/after photos of work performed
 */

import { useState } from 'react';
import {
  Camera,
  X,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  Download,
  Calendar,
  User,
} from 'lucide-react';
import clsx from 'clsx';

interface Photo {
  id: string;
  url: string;
  caption: string;
  type: 'before' | 'during' | 'after';
  timestamp: string;
  takenBy: string;
}

const mockPhotos: Photo[] = [
  { id: '1', url: '/api/placeholder/800/600', caption: 'Old electrical panel - outdated', type: 'before', timestamp: '2025-11-28 09:15', takenBy: 'Marc Lefebvre' },
  { id: '2', url: '/api/placeholder/800/600', caption: 'Wiring before replacement', type: 'before', timestamp: '2025-11-28 09:18', takenBy: 'Marc Lefebvre' },
  { id: '3', url: '/api/placeholder/800/600', caption: 'Installation in progress', type: 'during', timestamp: '2025-11-28 11:30', takenBy: 'Marc Lefebvre' },
  { id: '4', url: '/api/placeholder/800/600', caption: 'New circuit breakers installed', type: 'during', timestamp: '2025-11-28 12:45', takenBy: 'Julie Durand' },
  { id: '5', url: '/api/placeholder/800/600', caption: 'New electrical panel - NFC 15-100 compliant', type: 'after', timestamp: '2025-11-28 14:00', takenBy: 'Marc Lefebvre' },
  { id: '6', url: '/api/placeholder/800/600', caption: 'New outlets installed', type: 'after', timestamp: '2025-11-28 14:10', takenBy: 'Marc Lefebvre' },
  { id: '7', url: '/api/placeholder/800/600', caption: 'Final inspection complete', type: 'after', timestamp: '2025-11-28 14:25', takenBy: 'Marc Lefebvre' },
];

type FilterType = 'all' | 'before' | 'during' | 'after';

function PhotoModal({ 
  photo, 
  photos,
  onClose,
  onNavigate,
}: { 
  photo: Photo;
  photos: Photo[];
  onClose: () => void;
  onNavigate: (id: string) => void;
}) {
  const currentIndex = photos.findIndex(p => p.id === photo.id);
  const canGoBack = currentIndex > 0;
  const canGoForward = currentIndex < photos.length - 1;

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center">
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors z-10"
      >
        <X className="w-6 h-6" />
      </button>

      {/* Navigation */}
      {canGoBack && (
        <button
          onClick={() => onNavigate(photos[currentIndex - 1].id)}
          className="absolute left-4 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
      )}
      {canGoForward && (
        <button
          onClick={() => onNavigate(photos[currentIndex + 1].id)}
          className="absolute right-4 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      )}

      {/* Image */}
      <div className="max-w-4xl max-h-[80vh] mx-auto px-16">
        <div className="aspect-[4/3] bg-gray-800 rounded-xl overflow-hidden flex items-center justify-center">
          <Camera className="w-20 h-20 text-gray-600" />
        </div>
        
        {/* Caption */}
        <div className="mt-4 text-center">
          <p className="text-white text-lg">{photo.caption}</p>
          <div className="flex items-center justify-center gap-4 mt-2 text-gray-400 text-sm">
            <span className={clsx(
              'px-3 py-1 rounded-full',
              photo.type === 'before' ? 'bg-gray-600 text-gray-200' :
              photo.type === 'during' ? 'bg-blue-600 text-blue-100' :
              'bg-green-600 text-green-100'
            )}>
              {photo.type.charAt(0).toUpperCase() + photo.type.slice(1)}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {photo.timestamp}
            </span>
            <span className="flex items-center gap-1">
              <User className="w-4 h-4" />
              {photo.takenBy}
            </span>
          </div>
        </div>

        {/* Thumbnails */}
        <div className="flex justify-center gap-2 mt-6 overflow-x-auto pb-4">
          {photos.map((p) => (
            <button
              key={p.id}
              onClick={() => onNavigate(p.id)}
              className={clsx(
                'w-16 h-12 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all',
                p.id === photo.id ? 'border-white scale-110' : 'border-transparent opacity-50 hover:opacity-75'
              )}
            >
              <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                <Camera className="w-4 h-4 text-gray-500" />
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function CustomerPhotosPage() {
  const [filter, setFilter] = useState<FilterType>('all');
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);

  const filteredPhotos = filter === 'all' 
    ? mockPhotos 
    : mockPhotos.filter(p => p.type === filter);

  const photosByType = {
    before: mockPhotos.filter(p => p.type === 'before'),
    during: mockPhotos.filter(p => p.type === 'during'),
    after: mockPhotos.filter(p => p.type === 'after'),
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
            <Camera className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Work Photos</h1>
            <p className="text-sm text-gray-500">{mockPhotos.length} photos from your service</p>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {(['all', 'before', 'during', 'after'] as FilterType[]).map(type => (
          <button
            key={type}
            onClick={() => setFilter(type)}
            className={clsx(
              'px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors',
              filter === type
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            )}
          >
            {type.charAt(0).toUpperCase() + type.slice(1)}
            {type !== 'all' && (
              <span className="ml-1.5 opacity-75">
                ({photosByType[type].length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Before/After Comparison */}
      {filter === 'all' && photosByType.before.length > 0 && photosByType.after.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Before & After</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <div className="aspect-[4/3] bg-gray-100 rounded-xl overflow-hidden relative group cursor-pointer"
                   onClick={() => setSelectedPhoto(photosByType.before[0])}>
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <Camera className="w-12 h-12" />
                </div>
                <div className="absolute top-3 left-3">
                  <span className="bg-gray-800 text-white text-xs font-medium px-2 py-1 rounded-full">
                    Before
                  </span>
                </div>
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <ZoomIn className="w-8 h-8 text-white" />
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-2">{photosByType.before[0].caption}</p>
            </div>
            <div>
              <div className="aspect-[4/3] bg-gray-100 rounded-xl overflow-hidden relative group cursor-pointer"
                   onClick={() => setSelectedPhoto(photosByType.after[0])}>
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <Camera className="w-12 h-12" />
                </div>
                <div className="absolute top-3 left-3">
                  <span className="bg-green-600 text-white text-xs font-medium px-2 py-1 rounded-full">
                    After
                  </span>
                </div>
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <ZoomIn className="w-8 h-8 text-white" />
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-2">{photosByType.after[0].caption}</p>
            </div>
          </div>
        </div>
      )}

      {/* Photo Grid */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h2 className="font-semibold text-gray-900 mb-4">
          {filter === 'all' ? 'All Photos' : `${filter.charAt(0).toUpperCase() + filter.slice(1)} Photos`}
        </h2>
        
        {filteredPhotos.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {filteredPhotos.map(photo => (
              <div
                key={photo.id}
                onClick={() => setSelectedPhoto(photo)}
                className="group cursor-pointer"
              >
                <div className="aspect-[4/3] bg-gray-100 rounded-xl overflow-hidden relative">
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <Camera className="w-10 h-10" />
                  </div>
                  <div className="absolute top-2 left-2">
                    <span className={clsx(
                      'text-xs font-medium px-2 py-0.5 rounded-full',
                      photo.type === 'before' ? 'bg-gray-800 text-white' :
                      photo.type === 'during' ? 'bg-blue-600 text-white' :
                      'bg-green-600 text-white'
                    )}>
                      {photo.type.charAt(0).toUpperCase() + photo.type.slice(1)}
                    </span>
                  </div>
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <ZoomIn className="w-6 h-6 text-white" />
                  </div>
                </div>
                <p className="text-sm text-gray-600 mt-2 line-clamp-1">{photo.caption}</p>
                <p className="text-xs text-gray-400">{photo.timestamp}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Camera className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No {filter} photos available</p>
          </div>
        )}
      </div>

      {/* Download All */}
      <button className="w-full flex items-center justify-center gap-2 py-4 bg-gray-100 text-gray-700 rounded-2xl hover:bg-gray-200 transition-colors font-medium">
        <Download className="w-5 h-5" />
        Download All Photos
      </button>

      {/* Modal */}
      {selectedPhoto && (
        <PhotoModal
          photo={selectedPhoto}
          photos={filteredPhotos}
          onClose={() => setSelectedPhoto(null)}
          onNavigate={(id) => setSelectedPhoto(filteredPhotos.find(p => p.id === id) || null)}
        />
      )}
    </div>
  );
}
