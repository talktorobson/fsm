/**
 * Yellow Grid Mobile App - Theme Export
 */

export { colors, default as Colors } from './colors';
export { typography, default as Typography } from './typography';
export { spacing, borderRadius, shadows } from './spacing';

import { colors } from './colors';
import { typography } from './typography';
import { spacing, borderRadius, shadows } from './spacing';

export const theme = {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
};

export default theme;
