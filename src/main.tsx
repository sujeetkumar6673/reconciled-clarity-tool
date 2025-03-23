
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { refreshFavicon, startAggressiveFaviconMonitoring } from './utils/faviconManager'

// Run the aggressive favicon override immediately
refreshFavicon();

// Create root and render app
const root = createRoot(document.getElementById("root")!);
root.render(<App />);

// Run multiple times with increasing delays to combat any late-loading icons
setTimeout(refreshFavicon, 100);
setTimeout(refreshFavicon, 500);
setTimeout(refreshFavicon, 1000);
setTimeout(refreshFavicon, 2000);
setTimeout(refreshFavicon, 5000);

// Start aggressive monitoring to detect and remove any lovable icons
startAggressiveFaviconMonitoring();

// Set up a MutationObserver to watch for any new favicon additions
const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
      // Check if any of the added nodes are link elements that might be favicons
      mutation.addedNodes.forEach((node) => {
        if (node.nodeName === 'LINK') {
          const link = node as HTMLLinkElement;
          if (link.rel.includes('icon') || link.href.includes('lovable')) {
            console.log('Detected new favicon/icon being added:', link.href);
            refreshFavicon();
          }
        }
      });
    }
  });
});

// Start observing the document head for changes
observer.observe(document.head, { childList: true, subtree: true });

// Clean up observers and intervals after 1 minute
setTimeout(() => {
  observer.disconnect();
  console.log('Favicon mutation observer disconnected');
}, 60000);
