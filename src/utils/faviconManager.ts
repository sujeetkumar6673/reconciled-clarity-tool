
/**
 * Helper function to dynamically set and refresh the favicon
 * This can help overcome browser caching issues with favicons
 */
export const refreshFavicon = (): void => {
  try {
    console.log('Starting favicon removal and replacement process');
    
    // Remove all existing favicon links - try multiple strategies
    document.querySelectorAll('link[rel*="icon"], link[rel="shortcut icon"], link[rel="apple-touch-icon"], link[href*="favicon"], link[href*="icon"]')
      .forEach(link => {
        try {
          document.head.removeChild(link);
          console.log('Removed favicon link:', link);
        } catch (e) {
          console.log('Failed to remove link:', e);
        }
      });
    
    // Force removal of any potential cached versions
    const allLinks = document.querySelectorAll('link');
    allLinks.forEach(link => {
      if (link.href && (link.href.includes('favicon') || link.href.includes('icon'))) {
        try {
          document.head.removeChild(link);
          console.log('Removed additional icon link:', link.href);
        } catch (e) {
          console.log('Failed to remove link:', e);
        }
      }
    });
    
    // Generate a completely unique cache-busting timestamp
    const uniqueId = `${new Date().getTime()}-${Math.random().toString(36).substring(2, 15)}`;
    console.log('Generated unique ID for favicon:', uniqueId);
    
    // Create a new base64 transparent 16x16 PNG favicon directly in code
    // This creates a transparent placeholder that won't show any icon
    const transparentFaviconBase64 = 'iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAQAAAC1+jfqAAAAH0lEQVR42mNkwAEYj8Kh/0P/M+JTx4RXDaMKRhWAAQC5xg1+G/U+EwAAAABJRU5ErkJggg==';
    
    // Create and append an inline SVG favicon - even more guaranteed to override existing ones
    const inlineFavicon = document.createElement('link');
    inlineFavicon.rel = 'icon';
    inlineFavicon.type = 'image/png';
    inlineFavicon.href = `data:image/png;base64,${transparentFaviconBase64}`;
    document.head.appendChild(inlineFavicon);
    console.log('Added inline transparent favicon');
    
    // Also try with the local file as a backup with unique ID
    const localFavicon = document.createElement('link');
    localFavicon.rel = 'icon';
    localFavicon.type = 'image/x-icon';
    localFavicon.href = `/favicon.ico?v=${uniqueId}`;
    document.head.appendChild(localFavicon);
    console.log('Added local favicon with unique ID');
    
    // Add multiple other formats with the highest precedence
    ['shortcut icon', 'apple-touch-icon'].forEach(relType => {
      const additionalIcon = document.createElement('link');
      additionalIcon.rel = relType;
      additionalIcon.href = `data:image/png;base64,${transparentFaviconBase64}`;
      document.head.appendChild(additionalIcon);
    });
    
    console.log('Favicon refresh complete with unique ID:', uniqueId);
  } catch (error) {
    console.error('Error in refreshFavicon:', error);
  }
};
