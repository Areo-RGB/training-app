import { useState, useEffect, useRef } from 'react'
import { Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import { useAudio } from '@/contexts/AudioContext'

export default function Intervall() {
  const audio = useAudio()

  const [intervalSec, setIntervalSec] = useLocalStorage('intervall_intervalSec', 2)
  const [limitSec, setLimitSec] = useLocalStorage('intervall_limitSec', '')
  const [volumeBoost, setVolumeBoost] = useLocalStorage('intervall_volumeBoost', false)
  const [isRunning, setIsRunning] = useState(false)

  const timerRef = useRef<number | null>(null)
  const limitTimerRef = useRef<number | null>(null)

  const adjustInterval = (amount: number) => {
    setIntervalSec((v) => Math.max(0.1, parseFloat((v + amount).toFixed(1))))
  }

  const play = () => {
    const vol = volumeBoost ? 0.8 : 0.15
    audio.playBeep(600, 0.15, vol)
  }

  const start = async () => {
    await audio.resumeContext()
    setIsRunning(true)
    play()

    timerRef.current = window.setInterval(() => play(), intervalSec * 1000)

    const limit = parseInt(limitSec || '0', 10)
    if (limit > 0) {
      limitTimerRef.current = window.setTimeout(() => {
        stop()
      }, limit * 1000)
    }
  }

  const stop = () => {
    setIsRunning(false)
    if (timerRef.current) clearInterval(timerRef.current)
    if (limitTimerRef.current) clearTimeout(limitTimerRef.current)
  }

  const toggle = () => {
    if (isRunning) stop()
    else start()
  }

  useEffect(() => {
    return () => {
      stop()
    }
  }, [])

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] animate-enter">
      <Card className="w-full max-w-md p-8 text-center transition-all">
        <div className="w-20 h-20 bg-dark-900 rounded-full flex items-center justify-center mx-auto mb-6 text-blue-500 border border-white/5 shadow-inner">
          <Clock className="w-10 h-10" />
        </div>

        <h1 className="text-2xl font-bold text-text-primary mb-2">Intervall</h1>
        <p className="text-text-secondary mb-8">Periodic audio cues for training.</p>

        <div className="space-y-6 mb-8 text-left">
          <div>
            <label className="block text-sm font-bold text-text-secondary mb-4 uppercase tracking-wider text-center">
              Interval (Seconds)
            </label>
            <div className="flex items-center justify-center gap-6">
              <Button
                onClick={() => adjustInterval(-0.5)}
                className="w-12 h-12 rounded-xl bg-dark-900 border border-white/10 hover:bg-dark-700 font-bold text-xl btn-press"
                variant="outline"
              >
                -
              </Button>
              <input
                type="number"
                value={intervalSec}
                onChange={(e) => setIntervalSec(parseFloat(e.target.value) || 0.1)}
                className="w-32 text-center text-3xl font-black bg-transparent border-b-2 border-dark-700 focus:border-blue-500 outline-none py-2 text-text-primary"
              />
              <Button
                onClick={() => adjustInterval(0.5)}
                className="w-12 h-12 rounded-xl bg-dark-900 border border-white/10 hover:bg-dark-700 font-bold text-xl btn-press"
                variant="outline"
              >
                +
              </Button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-text-secondary mb-2 uppercase tracking-wider">
              Auto-Stop Limit (Optional)
            </label>
            <input
              type="number"
              value={limitSec}
              onChange={(e) => setLimitSec(e.target.value)}
              placeholder="Seconds (e.g. 60)"
              className="w-full p-4 rounded-xl bg-dark-900 border border-white/10 focus:border-blue-500 outline-none font-bold text-text-primary transition-all placeholder:font-normal placeholder:text-gray-600"
            />
          </div>

          <div
            className="flex items-center justify-between p-4 bg-dark-900 border border-white/5 rounded-xl cursor-pointer hover:bg-dark-700 transition-colors btn-press"
            onClick={() => setVolumeBoost(!volumeBoost)}
          >
            <span className="font-semibold text-text-primary">Volume Boost</span>
            <div
              className={`w-12 h-7 rounded-full transition-colors relative ${
                volumeBoost ? 'bg-blue-500' : 'bg-dark-700'
              }`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full shadow-sm absolute top-1 transition-transform ${
                  volumeBoost ? 'left-6' : 'left-1'
                }`}
              />
            </div>
          </div>
        </div>

        <Button
          onClick={toggle}
          className={`w-full py-4 text-lg font-bold shadow-lg hover-spring ${
            isRunning
              ? 'bg-red-500 hover:bg-red-600'
              : 'bg-blue-500 hover:bg-blue-600'
          }`}
        >
          {isRunning ? 'Stop' : 'Start Timer'}
        </Button>
      </Card>
    </div>
  )
}
