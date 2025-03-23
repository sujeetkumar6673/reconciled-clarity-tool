
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { refreshFavicon } from './utils/faviconManager'

// Refresh the favicon immediately when the script loads
refreshFavicon();

// Also refresh favicon after the app is mounted to ensure it takes precedence
createRoot(document.getElementById("root")!).render(<App />);

// Run one more time after a delay to override any late-loading favicons
setTimeout(refreshFavicon, 1000);
