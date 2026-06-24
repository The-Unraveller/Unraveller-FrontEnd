/**
 * Maps static local PNG image paths to their WebP optimized equivalents.
 * Safe fallback for API/database responses that still refer to .png extensions.
 */
export const getOptimizedImageUrl = (url?: string): string => {
  if (!url) return '';
  
  // If it's a local PNG image, convert it to WebP
  if (url.endsWith('.png') && (
    url.startsWith('/scenario_') ||
    url.startsWith('/london_bg') ||
    url.startsWith('/logo') ||
    url.startsWith('/start_menu_skyline') ||
    url.includes('/npc/')
  )) {
    return url.replace(/\.png$/, '.webp');
  }
  
  return url;
};
