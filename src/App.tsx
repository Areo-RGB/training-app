import { BrowserRouter as Router } from 'react-router-dom'
import { AudioProvider } from './contexts/AudioContext'
import AppRoutes from './routes'

function App() {
  return (
    <Router>
      <AudioProvider>
        <AppRoutes />
      </AudioProvider>
    </Router>
  )
}

export default App
