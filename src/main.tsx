import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { ClerkWrapper } from './lib/clerk'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ClerkWrapper>
      <App />
    </ClerkWrapper>
  </StrictMode>,
)
