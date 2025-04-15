import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter as Router} from 'react-router'
import App from './App.jsx'
import { SocketProvider } from './provider/SocketProvider.jsx'

createRoot(document.getElementById('root')).render(
  
  <Router>
    <SocketProvider>
      <App />
    </SocketProvider>
  </Router>

)
