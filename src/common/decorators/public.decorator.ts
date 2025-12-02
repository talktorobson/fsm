import { SetMetadata } from '@nestjs/common';

/**
 * Key used to store public route metadata.
 */
export const IS_PUBLIC_KEY = 'isPublic';

/**
 * Decorator to mark a route or controller as public (skips authentication).
 *
 * @returns {CustomDecorator<string>} A decorator that sets the IS_PUBLIC_KEY metadata.
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
