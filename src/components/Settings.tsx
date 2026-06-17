import { useState } from 'react'
import { X, Trash2, Plus } from 'lucide-react'
import type { Cat, Schedule } from '../types'

const EMOJI_OPTIONS = ['🐈', '🐈‍⬛', '😺', '😸', '😼', '😾']
const INTERVAL_OPTIONS = [4, 6, 8, 12, 24]

type Props = {
  cats: Cat[]
  schedule: Schedule
  onSave: (cats: Cat[], schedule: Schedule) => void
  onClose: () => void
}

type CatError = { name?: string }
type ScheduleError = { times?: string }

export function Settings({ cats, schedule, onSave, onClose }: Props) {
  const [localCats, setLocalCats] = useState<Cat[]>([...cats])
  const [localSchedule, setLocalSchedule] = useState<Schedule>(
    schedule.type === 'fixed'
      ? { type: 'fixed', times: [...schedule.times] }
      : { type: 'interval', hours: schedule.hours }
  )
  const [scheduleTab, setScheduleTab] = useState<'fixed' | 'interval'>(schedule.type)
  const [catErrors, setCatErrors] = useState<CatError[]>(cats.map(() => ({})))
  const [scheduleError, setScheduleError] = useState<ScheduleError>({})

  const updateCat = (index: number, patch: Partial<Cat>) => {
    const updated = localCats.map((c, i) => (i === index ? { ...c, ...patch } : c))
    setLocalCats(updated)
    if (patch.name !== undefined) {
      const errs = [...catErrors]
      errs[index] = { ...errs[index], name: patch.name.trim() ? undefined : 'Name cannot be empty' }
      setCatErrors(errs)
    }
  }

  const addCat = () => {
    if (localCats.length >= 4) return
    setLocalCats([...localCats, { id: crypto.randomUUID(), name: 'Cat', emoji: '🐈' }])
    setCatErrors([...catErrors, {}])
  }

  const removeCat = (index: number) => {
    if (localCats.length <= 1) return
    setLocalCats(localCats.filter((_, i) => i !== index))
    setCatErrors(catErrors.filter((_, i) => i !== index))
  }

  const updateFixedTime = (index: number, value: string) => {
    if (localSchedule.type !== 'fixed') return
    const times = [...localSchedule.times]
    times[index] = value
    setLocalSchedule({ type: 'fixed', times })
    setScheduleError({})
  }

  const addTime = () => {
    if (localSchedule.type !== 'fixed') return
    if (localSchedule.times.length >= 6) return
    setLocalSchedule({ type: 'fixed', times: [...localSchedule.times, '12:00'] })
  }

  const removeTime = (index: number) => {
    if (localSchedule.type !== 'fixed') return
    if (localSchedule.times.length <= 1) return
    setLocalSchedule({ type: 'fixed', times: localSchedule.times.filter((_, i) => i !== index) })
  }

  const switchTab = (tab: 'fixed' | 'interval') => {
    setScheduleTab(tab)
    if (tab === 'fixed') {
      setLocalSchedule({ type: 'fixed', times: schedule.type === 'fixed' ? [...schedule.times] : ['08:00', '18:00'] })
    } else {
      setLocalSchedule({ type: 'interval', hours: schedule.type === 'interval' ? schedule.hours : 8 })
    }
    setScheduleError({})
  }

  const validate = (): boolean => {
    const newCatErrors = localCats.map(c => ({
      name: c.name.trim() ? undefined : 'Name cannot be empty',
    }))
    setCatErrors(newCatErrors)
    if (newCatErrors.some(e => e.name)) return false

    if (localSchedule.type === 'fixed') {
      const times = localSchedule.times.map(t => t.trim()).filter(Boolean)
      if (new Set(times).size !== times.length) {
        setScheduleError({ times: 'Duplicate times are not allowed' })
        return false
      }
    }
    return true
  }

  const handleSave = () => {
    if (!validate()) return
    const finalSchedule =
      localSchedule.type === 'fixed'
        ? { type: 'fixed' as const, times: [...localSchedule.times].sort() }
        : localSchedule
    onSave(localCats.map(c => ({ ...c, name: c.name.trim() })), finalSchedule)
    onClose()
  }

  const hasErrors = catErrors.some(e => e.name) || !!scheduleError.times

  return (
    <div className="w-[320px] h-[280px] rounded-2xl border border-zinc-800 bg-zinc-900/95 backdrop-blur shadow-2xl p-4 flex flex-col">
      {/* Header — always visible */}
      <div className="flex items-center justify-between shrink-0">
        <p className="text-sm font-medium text-zinc-100">Settings</p>
        <button onClick={onClose} className="text-zinc-500 hover:text-zinc-300 transition-colors p-1">
          <X size={14} />
        </button>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto flex flex-col gap-3 mt-3 min-h-0">
        {/* Cats */}
        <div className="flex flex-col gap-2">
          <p className="text-xs text-zinc-500 uppercase tracking-widest">Cats</p>
          {localCats.map((cat, i) => (
            <div key={cat.id} className="flex flex-col gap-0.5">
              <div className="flex items-center gap-2">
                <select
                  value={cat.emoji}
                  onChange={e => updateCat(i, { emoji: e.target.value })}
                  className="bg-zinc-800 text-zinc-200 rounded-lg px-1 py-1 text-sm border-none outline-none"
                >
                  {EMOJI_OPTIONS.map(e => (
                    <option key={e} value={e}>{e}</option>
                  ))}
                </select>
                <input
                  type="text"
                  value={cat.name}
                  maxLength={20}
                  onChange={e => updateCat(i, { name: e.target.value })}
                  className="flex-1 bg-zinc-800 text-zinc-200 rounded-lg px-2 py-1 text-sm outline-none focus:ring-1 focus:ring-orange-500"
                />
                <button
                  onClick={() => removeCat(i)}
                  disabled={localCats.length <= 1}
                  className="text-zinc-600 hover:text-red-400 transition-colors disabled:opacity-30 disabled:cursor-not-allowed p-0.5"
                >
                  <Trash2 size={13} />
                </button>
              </div>
              {catErrors[i]?.name && (
                <p className="text-xs text-red-400 pl-8">{catErrors[i].name}</p>
              )}
            </div>
          ))}
          {localCats.length < 4 && (
            <button
              onClick={addCat}
              className="flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-300 transition-colors mt-1"
            >
              <Plus size={12} />
              Add cat
            </button>
          )}
        </div>

        {/* Schedule */}
        <div className="flex flex-col gap-2">
          <p className="text-xs text-zinc-500 uppercase tracking-widest">Schedule</p>

          <div className="flex rounded-lg overflow-hidden border border-zinc-700">
            <button
              onClick={() => switchTab('fixed')}
              className={`flex-1 text-xs py-1.5 transition-colors ${
                scheduleTab === 'fixed' ? 'bg-zinc-700 text-zinc-100' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              Fixed times
            </button>
            <button
              onClick={() => switchTab('interval')}
              className={`flex-1 text-xs py-1.5 transition-colors ${
                scheduleTab === 'interval' ? 'bg-zinc-700 text-zinc-100' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              Every N hours
            </button>
          </div>

          {scheduleTab === 'fixed' && localSchedule.type === 'fixed' && (
            <div className="flex flex-col gap-1.5">
              {localSchedule.times.map((t, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    type="time"
                    value={t}
                    onChange={e => updateFixedTime(i, e.target.value)}
                    className="flex-1 bg-zinc-800 text-zinc-200 rounded-lg px-2 py-1 text-sm outline-none focus:ring-1 focus:ring-orange-500"
                  />
                  <button
                    onClick={() => removeTime(i)}
                    disabled={localSchedule.times.length <= 1}
                    className="text-zinc-600 hover:text-red-400 transition-colors disabled:opacity-30 disabled:cursor-not-allowed p-0.5"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
              {localSchedule.times.length < 6 && (
                <button
                  onClick={addTime}
                  className="flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  <Plus size={12} />
                  Add time
                </button>
              )}
              {scheduleError.times && (
                <p className="text-xs text-red-400">{scheduleError.times}</p>
              )}
            </div>
          )}

          {scheduleTab === 'interval' && localSchedule.type === 'interval' && (
            <select
              value={localSchedule.hours}
              onChange={e => setLocalSchedule({ type: 'interval', hours: Number(e.target.value) })}
              className="bg-zinc-800 text-zinc-200 rounded-lg px-2 py-1.5 text-sm outline-none"
            >
              {INTERVAL_OPTIONS.map(h => (
                <option key={h} value={h}>Every {h} hours</option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Save / Cancel — always pinned at bottom */}
      <div className="flex gap-2 pt-2 mt-2 border-t border-zinc-800 shrink-0">
        <button
          onClick={onClose}
          className="flex-1 h-9 rounded-xl text-xs text-zinc-400 hover:text-zinc-200 border border-zinc-700 hover:border-zinc-600 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={hasErrors}
          className="flex-1 h-9 rounded-xl text-xs font-semibold text-white bg-orange-500 hover:bg-orange-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Save
        </button>
      </div>
    </div>
  )
}
