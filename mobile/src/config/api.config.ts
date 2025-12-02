// API Configuration
// For web builds, use relative URL so it works on any host
const getBaseUrl = () => {
  if (globalThis.window?.location?.origin) {
    // Web: use same origin
    return `${globalThis.window.location.origin}/api/v1`;
  }
  // Native: use environment or fallback
  return __DEV__
    ? 'https://135.181.96.93/api/v1'
    : 'https://api.yellow-grid.com/api/v1';
};

export const API_CONFIG = {
  // Base URL - dynamically determined based on platform
  BASE_URL: getBaseUrl(),

  // Timeout settings
  TIMEOUT: 30000, // 30 seconds

  // Retry settings
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000, // 1 second

  // Upload settings
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  SUPPORTED_IMAGE_FORMATS: ['jpg', 'jpeg', 'png', 'heic'],
  SUPPORTED_VIDEO_FORMATS: ['mp4', 'mov'],
};

// Storage keys
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_DATA: 'user_data',
  OFFLINE_QUEUE: 'offline_queue',
  LAST_SYNC: 'last_sync',
};

// Feature flags
export const FEATURES = {
  OFFLINE_MODE: true,
  PUSH_NOTIFICATIONS: true,
  CAMERA_CAPTURE: true,
  GPS_TRACKING: true,
  SIGNATURE_CAPTURE: true,
  BIOMETRIC_AUTH: true,
};
