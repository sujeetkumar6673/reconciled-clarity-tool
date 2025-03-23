
/**
 * Helper function to dynamically set and refresh the favicon
 * This can help overcome browser caching issues with favicons
 */
export const refreshFavicon = (): void => {
  try {
    // First attempt: Remove ALL existing favicons
    const existingFavicons = document.querySelectorAll('link[rel*="icon"], link[rel="shortcut icon"], link[rel="apple-touch-icon"]');
    console.log(`Found ${existingFavicons.length} existing favicons to remove`);
    
    existingFavicons.forEach(favicon => {
      document.head.removeChild(favicon);
      console.log('Removed favicon:', favicon);
    });

    // Second attempt: Remove any favicons with specific attributes that might be causing issues
    const potentialFavicons = document.querySelectorAll('link[href*="favicon"], link[href*="icon"]');
    potentialFavicons.forEach(favicon => {
      if (!favicon.parentNode) return; // Skip if already removed
      document.head.removeChild(favicon);
      console.log('Removed additional favicon:', favicon);
    });

    // Create and append a completely new favicon with a unique cache-busting parameter
    const timestamp = new Date().getTime();
    
    // Add primary favicon with aggressive cache busting
    const newFavicon = document.createElement('link');
    newFavicon.rel = 'icon';
    newFavicon.type = 'image/x-icon';
    newFavicon.href = `/favicon.ico?v=${timestamp}`;
    document.head.appendChild(newFavicon);
    
    // Add shortcut icon for maximum browser compatibility
    const shortcutIcon = document.createElement('link');
    shortcutIcon.rel = 'shortcut icon';
    shortcutIcon.type = 'image/x-icon';
    shortcutIcon.href = `/favicon.ico?v=${timestamp}`;
    document.head.appendChild(shortcutIcon);
    
    console.log('Favicon has been completely refreshed with timestamp:', timestamp);
  } catch (error) {
    console.error('Error refreshing favicon:', error);
  }
};
