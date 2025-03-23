import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { refreshFavicon } from './utils/faviconManager'

// Refresh the favicon immediately when the script loads
refreshFavicon();

// Create root and render app
const root = createRoot(document.getElementById("root")!);
root.render(<App />);

// Run multiple times to ensure it overrides any late-loading favicons
setTimeout(refreshFavicon, 100);
setTimeout(refreshFavicon, 500);
setTimeout(refreshFavicon, 1000);
setTimeout(refreshFavicon, 2000);

// Also set up an interval to keep checking periodically
const faviconInterval = setInterval(refreshFavicon, 5000);

// Clear the interval after 30 seconds
setTimeout(() => {
  clearInterval(faviconInterval);
  console.log('Favicon refresh interval cleared');
}, 30000);
