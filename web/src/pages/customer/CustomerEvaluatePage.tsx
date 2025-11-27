/**
 * Customer Evaluate Page
 * Rate service and provide NPS feedback
 */

import { useState } from 'react';
import {
  Star,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  Award,
  Check,
  Heart,
  Wrench,
  Clock,
  Users,
  Sparkles,
} from 'lucide-react';
import clsx from 'clsx';

type RatingCategory = 'overall' | 'quality' | 'punctuality' | 'professionalism' | 'cleanliness';

interface RatingItem {
  id: RatingCategory;
  label: string;
  icon: React.ElementType;
  rating: number;
}

const initialRatings: RatingItem[] = [
  { id: 'overall', label: 'Overall Satisfaction', icon: Heart, rating: 0 },
  { id: 'quality', label: 'Work Quality', icon: Wrench, rating: 0 },
  { id: 'punctuality', label: 'Punctuality', icon: Clock, rating: 0 },
  { id: 'professionalism', label: 'Professionalism', icon: Users, rating: 0 },
  { id: 'cleanliness', label: 'Cleanliness', icon: Sparkles, rating: 0 },
];

const serviceInfo = {
  provider: 'Électricité Plus SARL',
  technician: 'Marc Lefebvre',
  service: 'Electrical Panel Upgrade',
  date: 'November 28, 2025',
};

const presetFeedback = [
  'Excellent work!',
  'Very professional',
  'Clean and tidy',
  'Great communication',
  'On time',
  'Explained everything clearly',
  'Would recommend',
  'Friendly technician',
];

export default function CustomerEvaluatePage() {
  const [ratings, setRatings] = useState(initialRatings);
  const [npsScore, setNpsScore] = useState<number | null>(null);
  const [feedback, setFeedback] = useState('');
  const [selectedPresets, setSelectedPresets] = useState<string[]>([]);
  const [wouldRecommend, setWouldRecommend] = useState<boolean | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleRating = (id: RatingCategory, value: number) => {
    setRatings(prev => prev.map(r => r.id === id ? { ...r, rating: value } : r));
  };

  const togglePreset = (preset: string) => {
    setSelectedPresets(prev =>
      prev.includes(preset)
        ? prev.filter(p => p !== preset)
        : [...prev, preset]
    );
  };

  const handleSubmit = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setSubmitted(true);
      setIsSubmitting(false);
    }, 1500);
  };

  const averageRating = ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length;
  const isComplete = ratings.every(r => r.rating > 0) && npsScore !== null;

  if (submitted) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Award className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Thank You!</h1>
          <p className="text-gray-600 mb-6">
            Your feedback helps us maintain high service standards.
          </p>
          
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 mb-6">
            <div className="flex items-center justify-center gap-2 mb-2">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={clsx(
                    'w-8 h-8',
                    i < Math.round(averageRating)
                      ? 'text-yellow-400 fill-yellow-400'
                      : 'text-gray-300'
                  )}
                />
              ))}
            </div>
            <div className="text-2xl font-bold text-gray-900">{averageRating.toFixed(1)}/5</div>
            <div className="text-sm text-gray-600">Your Overall Rating</div>
          </div>

          {averageRating >= 4 && (
            <div className="bg-blue-50 rounded-xl p-4 text-left">
              <h3 className="font-semibold text-blue-900 mb-2">Share Your Experience</h3>
              <p className="text-sm text-blue-800 mb-3">
                Happy customers like you help others find great service providers!
              </p>
              <button className="w-full py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
                Share on Google Reviews
              </button>
            </div>
          )}
        </div>

        <div className="bg-green-50 rounded-2xl p-6 text-center">
          <h3 className="font-semibold text-green-900 mb-2">Need More Services?</h3>
          <p className="text-sm text-green-800 mb-4">
            AHS offers a wide range of home improvement services with the same quality guarantee.
          </p>
          <button className="px-6 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors">
            Browse Services
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
            <Star className="w-6 h-6 text-yellow-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Rate Your Service</h1>
            <p className="text-sm text-gray-500">Your feedback matters to us</p>
          </div>
        </div>
        
        <div className="bg-gray-50 rounded-xl p-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Provider</span>
              <div className="font-medium text-gray-900">{serviceInfo.provider}</div>
            </div>
            <div>
              <span className="text-gray-500">Technician</span>
              <div className="font-medium text-gray-900">{serviceInfo.technician}</div>
            </div>
            <div>
              <span className="text-gray-500">Service</span>
              <div className="font-medium text-gray-900">{serviceInfo.service}</div>
            </div>
            <div>
              <span className="text-gray-500">Date</span>
              <div className="font-medium text-gray-900">{serviceInfo.date}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Star Ratings */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Rate Each Aspect</h2>
        <div className="space-y-4">
          {ratings.map(item => {
            const Icon = item.icon;
            return (
              <div key={item.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Icon className="w-5 h-5 text-gray-500" />
                  </div>
                  <span className="text-gray-700">{item.label}</span>
                </div>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map(value => (
                    <button
                      key={value}
                      onClick={() => handleRating(item.id, value)}
                      className="p-1 transition-transform hover:scale-110"
                    >
                      <Star
                        className={clsx(
                          'w-7 h-7 transition-colors',
                          value <= item.rating
                            ? 'text-yellow-400 fill-yellow-400'
                            : 'text-gray-300 hover:text-yellow-300'
                        )}
                      />
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* NPS Score */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h2 className="font-semibold text-gray-900 mb-2">
          How likely are you to recommend us?
        </h2>
        <p className="text-sm text-gray-500 mb-4">0 = Not at all, 10 = Extremely likely</p>
        
        <div className="flex gap-2 flex-wrap">
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(score => (
            <button
              key={score}
              onClick={() => setNpsScore(score)}
              className={clsx(
                'w-10 h-10 rounded-lg font-medium transition-all',
                npsScore === score
                  ? score <= 6
                    ? 'bg-red-500 text-white'
                    : score <= 8
                    ? 'bg-yellow-500 text-white'
                    : 'bg-green-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              )}
            >
              {score}
            </button>
          ))}
        </div>
        
        {npsScore !== null && (
          <div className={clsx(
            'mt-4 p-3 rounded-lg text-sm',
            npsScore <= 6 ? 'bg-red-50 text-red-800' :
            npsScore <= 8 ? 'bg-yellow-50 text-yellow-800' :
            'bg-green-50 text-green-800'
          )}>
            {npsScore <= 6 && "We're sorry to hear that. Please let us know how we can improve."}
            {npsScore > 6 && npsScore <= 8 && "Thanks! We'd love to know what would make it a 10."}
            {npsScore > 8 && "Wonderful! Thank you for your support! 🎉"}
          </div>
        )}
      </div>

      {/* Would Recommend */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h2 className="font-semibold text-gray-900 mb-4">
          Would you use this provider again?
        </h2>
        <div className="flex gap-4">
          <button
            onClick={() => setWouldRecommend(true)}
            className={clsx(
              'flex-1 py-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all',
              wouldRecommend === true
                ? 'border-green-500 bg-green-50'
                : 'border-gray-200 hover:border-green-300'
            )}
          >
            <ThumbsUp className={clsx(
              'w-8 h-8',
              wouldRecommend === true ? 'text-green-600' : 'text-gray-400'
            )} />
            <span className={clsx(
              'font-medium',
              wouldRecommend === true ? 'text-green-700' : 'text-gray-600'
            )}>Yes, definitely!</span>
          </button>
          <button
            onClick={() => setWouldRecommend(false)}
            className={clsx(
              'flex-1 py-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all',
              wouldRecommend === false
                ? 'border-red-500 bg-red-50'
                : 'border-gray-200 hover:border-red-300'
            )}
          >
            <ThumbsDown className={clsx(
              'w-8 h-8',
              wouldRecommend === false ? 'text-red-600' : 'text-gray-400'
            )} />
            <span className={clsx(
              'font-medium',
              wouldRecommend === false ? 'text-red-700' : 'text-gray-600'
            )}>No, I wouldn't</span>
          </button>
        </div>
      </div>

      {/* Quick Feedback Tags */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h2 className="font-semibold text-gray-900 mb-4">What did you like most?</h2>
        <div className="flex flex-wrap gap-2">
          {presetFeedback.map(preset => (
            <button
              key={preset}
              onClick={() => togglePreset(preset)}
              className={clsx(
                'px-4 py-2 rounded-full text-sm font-medium transition-all',
                selectedPresets.includes(preset)
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              )}
            >
              {preset}
            </button>
          ))}
        </div>
      </div>

      {/* Written Feedback */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <MessageSquare className="w-5 h-5 text-gray-400" />
          <h2 className="font-semibold text-gray-900">Additional Comments</h2>
          <span className="text-sm text-gray-400">(Optional)</span>
        </div>
        <textarea
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          placeholder="Share your experience in detail..."
          className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none"
          rows={4}
        />
        <p className="text-xs text-gray-500 mt-2">
          {feedback.length}/500 characters
        </p>
      </div>

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={!isComplete || isSubmitting}
        className={clsx(
          'w-full py-4 rounded-2xl font-semibold text-lg flex items-center justify-center gap-2 transition-all',
          isComplete
            ? 'bg-green-600 text-white hover:bg-green-700'
            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
        )}
      >
        {isSubmitting ? (
          <>
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Submitting...
          </>
        ) : (
          <>
            <Check className="w-5 h-5" />
            Submit Feedback
          </>
        )}
      </button>

      {!isComplete && (
        <p className="text-center text-sm text-gray-500">
          Please rate all categories and provide an NPS score to submit
        </p>
      )}
    </div>
  );
}
