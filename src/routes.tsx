import { Routes, Route } from 'react-router-dom'
import Layout from './components/layout/Layout'
import Home from './pages/Home'
import Intervall from './pages/Intervall'
import Farben from './pages/Farben'
import Kettenrechner from './pages/Kettenrechner'
import Timers from './pages/Timers'
import SoundCounter from './pages/SoundCounter'
import Capitals from './pages/Capitals'
import Statistiken from './pages/Statistiken'

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="intervall" element={<Intervall />} />
        <Route path="farben" element={<Farben />} />
        <Route path="kettenrechner" element={<Kettenrechner />} />
        <Route path="timers" element={<Timers />} />
        <Route path="sound-counter" element={<SoundCounter />} />
        <Route path="capitals" element={<Capitals />} />
        <Route path="statistiken" element={<Statistiken />} />
      </Route>
    </Routes>
  )
}
