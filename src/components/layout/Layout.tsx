import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { Button } from '../ui/button'

export default function Layout() {
  const navigate = useNavigate()
  const location = useLocation()
  const isHome = location.pathname === '/'

  return (
    <div className="min-h-screen bg-dark-900">
      {!isHome && (
        <div className="fixed top-6 left-6 z-50">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/')}
            className="rounded-full bg-dark-800/80 backdrop-blur-sm border border-white/10 hover:bg-dark-700"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </div>
      )}
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <Outlet />
      </div>
    </div>
  )
}
