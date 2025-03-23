
/**
 * Helper function to dynamically set and refresh the favicon
 * This can help overcome browser caching issues with favicons
 */
export const refreshFavicon = (): void => {
  // Remove any existing favicons
  const existingFavicons = document.querySelectorAll('link[rel*="icon"]');
  existingFavicons.forEach(favicon => {
    document.head.removeChild(favicon);
  });

  // Create and append a new favicon with a cache-busting parameter
  const newFavicon = document.createElement('link');
  newFavicon.rel = 'shortcut icon';
  newFavicon.href = `/favicon.ico?v=${new Date().getTime()}`; // Add timestamp to bust cache
  document.head.appendChild(newFavicon);
  
  console.log('Favicon has been refreshed');
};
