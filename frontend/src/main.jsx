import { StrictMode, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/variables.css';
import './styles/global.css';
import './styles/layout.css';
import './styles/components.css';
import './i18n';
import App from './App.jsx'
import SimpleErrorBoundary from './components/SimpleErrorBoundary';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <SimpleErrorBoundary>
      <Suspense fallback="Loading...">
        <App />
      </Suspense>
    </SimpleErrorBoundary>
  </StrictMode>,
)
