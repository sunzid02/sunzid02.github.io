import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import "./styles/base.css";

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* <h1>Currently under construction...</h1> */}
    <App />
  </StrictMode>,
)
