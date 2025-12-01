/**
 * Customer Photos Page
 * View before/after photos of work performed
 */

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Camera,
  X,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  Download,
  Calendar,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import clsx from 'clsx';
import { useCustomerPortalContext } from '@/hooks/useCustomerAccess';
import { customerPortalService, CustomerPortalPhoto } from '@/services/customer-portal-service';

interface Photo {
  id: string;
  url: string;
  caption: string | null;
  type: 'before' | 'during' | 'after' | string;
  timestamp: string;
}

type FilterType = 'all' | 'before' | 'during' | 'after';

function mapCategoryToType(category: string): 'before' | 'during' | 'after' {
  const categoryLower = category.toLowerCase();
  if (categoryLower.includes('before')) return 'before';
  if (categoryLower.includes('during') || categoryLower.includes('progress')) return 'during';
  if (categoryLower.includes('after') || categoryLower.includes('completed')) return 'after';
  return 'after'; // Default to 'after'
}

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
          {photo.url ? (
            <img src={photo.url} alt={photo.caption || 'Photo'} className="w-full h-full object-contain" />
          ) : (
            <Camera className="w-20 h-20 text-gray-600" />
          )}
        </div>
        
        {/* Caption */}
        <div className="mt-4 text-center">
          <p className="text-white text-lg">{photo.caption || 'Work photo'}</p>
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
              {p.url ? (
                <img src={p.url} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                  <Camera className="w-4 h-4 text-gray-500" />
                </div>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function CustomerPhotosPage() {
  const { accessToken } = useCustomerPortalContext();
  const [filter, setFilter] = useState<FilterType>('all');
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);

  // Fetch photos from API
  const { data: photosData, isLoading, error } = useQuery({
    queryKey: ['customer-photos', accessToken],
    queryFn: () => customerPortalService.getPhotos(accessToken),
    enabled: !!accessToken,
  });

  // Transform API photos to component format
  const photos: Photo[] = (photosData?.photos || []).map((p: CustomerPortalPhoto) => ({
    id: p.id,
    url: p.url || p.thumbnailUrl,
    caption: p.caption,
    type: mapCategoryToType(p.category),
    timestamp: new Date(p.createdAt).toLocaleString('fr-FR', {
      dateStyle: 'short',
      timeStyle: 'short',
    }),
  }));

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-green-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading photos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Unable to Load Photos</h2>
          <p className="text-gray-600">There was an error loading the photos. Please try again later.</p>
        </div>
      </div>
    );
  }

  const filteredPhotos = filter === 'all' 
    ? photos 
    : photos.filter(p => p.type === filter);

  const photosByType = {
    before: photos.filter(p => p.type === 'before'),
    during: photos.filter(p => p.type === 'during'),
    after: photos.filter(p => p.type === 'after'),
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
            <p className="text-sm text-gray-500">{photos.length} photos from your service</p>
          </div>
        </div>
      </div>

      {photos.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12">
          <div className="text-center">
            <Camera className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No Photos Yet</h2>
            <p className="text-gray-600">
              Photos from your service will appear here once the work has been completed.
            </p>
          </div>
        </div>
      ) : (
        <>
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
                    {photosByType.before[0].url ? (
                      <img src={photosByType.before[0].url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <Camera className="w-12 h-12" />
                      </div>
                    )}
                    <div className="absolute top-3 left-3">
                      <span className="bg-gray-800 text-white text-xs font-medium px-2 py-1 rounded-full">
                        Before
                      </span>
                    </div>
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <ZoomIn className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">{photosByType.before[0].caption || 'Before work'}</p>
                </div>
                <div>
                  <div className="aspect-[4/3] bg-gray-100 rounded-xl overflow-hidden relative group cursor-pointer"
                       onClick={() => setSelectedPhoto(photosByType.after[0])}>
                    {photosByType.after[0].url ? (
                      <img src={photosByType.after[0].url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <Camera className="w-12 h-12" />
                      </div>
                    )}
                    <div className="absolute top-3 left-3">
                      <span className="bg-green-600 text-white text-xs font-medium px-2 py-1 rounded-full">
                        After
                      </span>
                    </div>
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <ZoomIn className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">{photosByType.after[0].caption || 'After work'}</p>
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
                      {photo.url ? (
                        <img src={photo.url} alt={photo.caption || ''} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <Camera className="w-10 h-10" />
                        </div>
                      )}
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
                    <p className="text-sm text-gray-600 mt-2 line-clamp-1">{photo.caption || 'Work photo'}</p>
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
        </>
      )}

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
