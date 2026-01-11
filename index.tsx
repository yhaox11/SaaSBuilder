import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);

try {
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} catch (error) {
  console.error("CRITICAL RENDER ERROR:", error);
  rootElement.innerHTML = `
    <div style="color: red; padding: 20px; font-family: sans-serif;">
      <h1>Application Error</h1>
      <p>Failed to start the application.</p>
      <pre>${error instanceof Error ? error.message : String(error)}</pre>
    </div>
  `;
}