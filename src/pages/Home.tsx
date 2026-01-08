import { Link } from 'react-router-dom'
import { Clock, Droplet, Calculator, Timer, Mic, MapPin, BarChart3 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

interface Tool {
  title: string
  description: string
  link: string
  icon: React.ReactNode
  tags: string[]
  accentGradient: string
  hoverColor: string
}

const tools: Tool[] = [
  {
    title: 'Sound-Zähler',
    description: 'Erhöht einen Zähler, wenn der Geräuschpegel einen Schwellenwert überschreitet.',
    link: '/sound-counter',
    icon: <Mic className="w-[18px] h-[18px]" />,
    tags: ['AUDIO', 'TRIGGER'],
    accentGradient: 'from-blue-500 to-indigo-600',
    hoverColor: 'group-hover:text-blue-500',
  },
  {
    title: 'Farben',
    description: 'Stroop-Effekt-Trainer. Farben und Wörter blinken, um die Reaktionsgeschwindigkeit zu verbessern.',
    link: '/farben',
    icon: <Droplet className="w-[18px] h-[18px]" />,
    tags: ['KOGNITIV', 'REAKTION'],
    accentGradient: 'from-pink-500 to-rose-600',
    hoverColor: 'group-hover:text-pink-500',
  },
  {
    title: 'Kettenrechner',
    description: 'Kopfrechnen-Kettenaufgaben. Löse fortlaufende Rechenoperationen.',
    link: '/kettenrechner',
    icon: <Calculator className="w-[18px] h-[18px]" />,
    tags: ['MATHE', 'FOKUS'],
    accentGradient: 'from-emerald-500 to-green-600',
    hoverColor: 'group-hover:text-emerald-500',
  },
  {
    title: 'Timer',
    description: 'Intervall-Timer und Schleifen-Voreinstellungen für verschiedene Trainingseinheiten.',
    link: '/timers',
    icon: <Timer className="w-[18px] h-[18px]" />,
    tags: ['WERKZEUG', 'INTERVALL'],
    accentGradient: 'from-orange-500 to-amber-600',
    hoverColor: 'group-hover:text-orange-500',
  },
  {
    title: 'Intervall',
    description: 'Setze benutzerdefinierte Intervalle für Audio-Erinnerungen.',
    link: '/intervall',
    icon: <Clock className="w-[18px] h-[18px]" />,
    tags: ['AUDIO', 'TAKT'],
    accentGradient: 'from-purple-500 to-violet-600',
    hoverColor: 'group-hover:text-purple-500',
  },
  {
    title: 'Hauptstädte Quiz',
    description: 'Teste dein Wissen über europäische Hauptstädte mit diesem Zeit-Quiz.',
    link: '/capitals',
    icon: <MapPin className="w-[18px] h-[18px]" />,
    tags: ['GEOGRAPHIE', 'GEDÄCHTNIS'],
    accentGradient: 'from-cyan-500 to-teal-600',
    hoverColor: 'group-hover:text-cyan-500',
  },
  {
    title: 'Statistiken',
    description: 'Leistungsübersicht und Ranglisten für alle Trainingseinheiten.',
    link: '/statistiken',
    icon: <BarChart3 className="w-[18px] h-[18px]" />,
    tags: ['DATEN', 'LEISTUNG'],
    accentGradient: 'from-rose-500 to-red-600',
    hoverColor: 'group-hover:text-rose-500',
  },
]

export default function Home() {
  return (
    <div className="flex flex-col gap-8 py-6 animate-enter">
      {/* Header */}
      <div className="text-center space-y-2 mb-2">
        <h1 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-300">
          Training
        </h1>
        <p className="text-text-secondary text-xs md:text-sm font-medium tracking-wide uppercase">
          Training Tools
        </p>
      </div>

      {/* Tools Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {tools.map((tool, i) => (
          <Link
            key={tool.title}
            to={tool.link}
            style={{ animationDelay: `${i * 50}ms` }}
            className="group animate-enter opacity-0 h-full"
          >
            <Card className="relative overflow-hidden hover:border-white/10 transition-all hover-spring cursor-pointer h-full shadow-none">
              {/* Left Accent Border */}
              <div
                className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b group-hover:w-1.5 transition-all ${tool.accentGradient}`}
              />

              <CardContent className="flex items-start p-4 gap-4 h-full">
                {/* Icon Box */}
                <div
                  className={`w-10 h-10 rounded-lg bg-dark-900 border border-white/5 flex items-center justify-center text-text-muted transition-colors shrink-0 mt-0.5 ${tool.hoverColor}`}
                >
                  {tool.icon}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 flex flex-col h-full justify-between">
                  <div>
                    <h3
                      className={`text-base font-bold text-text-primary mb-1 transition-colors truncate leading-tight ${tool.hoverColor}`}
                    >
                      {tool.title}
                    </h3>
                    <p className="text-xs text-text-secondary leading-relaxed line-clamp-2 mb-2">
                      {tool.description}
                    </p>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5 mt-auto">
                    {tool.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-1.5 py-0.5 rounded-[4px] text-[9px] font-bold tracking-wider bg-dark-900 text-text-muted border border-white/5 uppercase"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}

