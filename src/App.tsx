import { BrowserRouter as Router } from 'react-router-dom'
import { ThemeProvider } from '@/contexts/ThemeProvider'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from '@/lib/auth'
import AppRoutes from './AppRoutes'

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-background">
            <AppRoutes />
            <Toaster position="top-right" />
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App