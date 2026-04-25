import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { addCollection } from '@iconify/react'
import mingcuteIcons from '@iconify-json/mingcute/icons.json'
import './index.css'
import App from './App.tsx'

addCollection(mingcuteIcons)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
