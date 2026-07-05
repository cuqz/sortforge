import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/index.css'
import App from './App.tsx'

window.onerror = function(msg, _url, _line, _col, err) {
  document.getElementById('root')!.innerHTML =
    `<div style="padding:40px;color:oklch(0.55 0.18 25);font-family:system-ui">
      <h2>Something crashed</h2>
      <pre style="color:oklch(0.55 0 0);font-size:14px;margin-top:12px">${err?.stack || msg}</pre>
    </div>`;
  return true;
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
