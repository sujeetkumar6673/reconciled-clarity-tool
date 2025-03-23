
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { refreshFavicon } from './utils/faviconManager'

// Refresh the favicon when the app loads
refreshFavicon();

createRoot(document.getElementById("root")!).render(<App />);
