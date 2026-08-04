import React from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css'

// HashRouter (not BrowserRouter) because there's no server to add a
// catch-all rewrite back to index.html — without one, any URL that isn't
// exactly the site root (including the very first load, once the host adds
// its own path prefix) falls through to the 404 page instead of Home.
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </React.StrictMode>,
)
