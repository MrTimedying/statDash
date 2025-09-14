import React from 'react'
import ReactDOM from 'react-dom/client'
import '@fontsource/rubik/300.css' // Light
import '@fontsource/rubik/400.css' // Regular
import '@fontsource/rubik/500.css' // Medium
import '@fontsource/rubik/600.css' // SemiBold
import '@fontsource/rubik/700.css' // Bold
import App from './App'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)