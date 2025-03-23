
/**
 * Super aggressive favicon manager to override any existing favicon
 */
export const refreshFavicon = (): void => {
  try {
    console.log('Starting ultra-aggressive favicon override process');
    
    // Step 1: Remove ALL link elements in the document head, not just favicon ones
    const head = document.head;
    const allLinks = document.querySelectorAll('link');
    
    allLinks.forEach(link => {
      try {
        if (link.rel.includes('icon') || link.href.includes('icon') || link.href.includes('favicon')) {
          head.removeChild(link);
          console.log('Removed favicon/icon link:', link.href || 'inline icon');
        }
      } catch (e) {
        console.log('Failed to remove link:', e);
      }
    });
    
    // Step 2: Try to specifically target the lovable icon if it exists
    try {
      const lovableLinks = document.querySelectorAll('link[href*="lovable"]');
      lovableLinks.forEach(link => head.removeChild(link));
      console.log('Attempted to remove any lovable icon links');
    } catch (e) {
      console.log('No lovable links found or failed to remove');
    }
    
    // Step 3: Generate a timestamp for cache busting
    const timestamp = Date.now() + '-' + Math.random().toString(36).substring(2, 10);
    
    // Step 4: Create and add your own favicon with cache busting
    const favicon = document.createElement('link');
    favicon.rel = 'icon';
    favicon.type = 'image/x-icon';
    favicon.href = `/favicon.ico?v=${timestamp}`;
    head.appendChild(favicon);
    
    // Step 5: Add a shortcut icon as well
    const shortcutIcon = document.createElement('link');
    shortcutIcon.rel = 'shortcut icon';
    shortcutIcon.type = 'image/x-icon';
    shortcutIcon.href = `/favicon.ico?v=${timestamp}`;
    head.appendChild(shortcutIcon);
    
    // Step 6: Also add an apple touch icon
    const appleIcon = document.createElement('link');
    appleIcon.rel = 'apple-touch-icon';
    appleIcon.href = `/favicon.ico?v=${timestamp}`;
    head.appendChild(appleIcon);
    
    // Step 7: Add a fallback transparent icon
    const transparentIcon = document.createElement('link');
    transparentIcon.rel = 'icon';
    transparentIcon.href = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
    head.appendChild(transparentIcon);
    
    console.log('Added new favicons with cache busting timestamp:', timestamp);
    
    // Step 8: Try to modify page title to force browser tab update
    const originalTitle = document.title;
    document.title = originalTitle + ' ';
    setTimeout(() => { document.title = originalTitle; }, 10);
    
    console.log('Favicon refresh complete with extreme measures');
  } catch (error) {
    console.error('Error in refreshFavicon:', error);
  }
};

// Additional function to continuously fight against lovable icon
export const startAggressiveFaviconMonitoring = (): void => {
  // Run every 500ms for 30 seconds
  const interval = setInterval(() => {
    try {
      const lovableLinks = document.querySelectorAll('link[href*="lovable"], link[href*="heart"]');
      if (lovableLinks.length > 0) {
        console.log('Found and removing lovable links:', lovableLinks.length);
        lovableLinks.forEach(link => document.head.removeChild(link));
        refreshFavicon();
      }
    } catch (e) {
      console.log('Error in monitoring:', e);
    }
  }, 500);
  
  // Stop after 30 seconds
  setTimeout(() => {
    clearInterval(interval);
    console.log('Stopped aggressive favicon monitoring');
  }, 30000);
};
