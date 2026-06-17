import { useState } from 'react'
import { useFeedingStore } from './hooks/useFeedingStore'
import { useHungerTick } from './hooks/useHungerTick'
import { Widget } from './components/Widget'
import { Settings } from './components/Settings'
import { HistoryModal } from './components/HistoryModal'

export default function App() {
  const [showSettings, setShowSettings] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const store = useFeedingStore()
  const { hungerState } = useHungerTick(store.lastFed, store.schedule, store.cats)

  if (!store.loaded) return null

  return (
    <div className="w-[320px] relative">
      {showSettings ? (
        <Settings
          cats={store.cats}
          schedule={store.schedule}
          onSave={(newCats, newSchedule) => {
            store.saveCats(newCats)
            store.saveSchedule(newSchedule)
          }}
          onClose={() => setShowSettings(false)}
        />
      ) : (
        <Widget
          lastFed={store.lastFed}
          cats={store.cats}
          schedule={store.schedule}
          hungerState={hungerState}
          onFeed={store.logFeeding}
          onSettings={() => setShowSettings(true)}
          onHistory={() => setShowHistory(true)}
          onMinimize={() => window.electronAPI.minimize()}
        />
      )}
      <HistoryModal
        open={showHistory}
        events={store.events}
        onClose={() => setShowHistory(false)}
      />
    </div>
  )
}
