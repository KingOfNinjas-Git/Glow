import { useEffect, useState } from 'react'
import { HABIT_EMOJIS } from '../data/content'
import type { Habit } from '../state/types'
import { Button } from './ui/Button'
import { Modal } from './ui/Modal'

interface Props {
  open: boolean
  /** null = adding a new habit */
  habit: Habit | null
  onClose: () => void
  onSave: (emoji: string, name: string) => void
  onDelete?: (id: string) => void
}

export function HabitForm({ open, habit, onClose, onSave, onDelete }: Props) {
  const [emoji, setEmoji] = useState('✨')
  const [name, setName] = useState('')
  const [confirming, setConfirming] = useState(false)

  useEffect(() => {
    if (open) {
      setEmoji(habit?.emoji ?? '✨')
      setName(habit?.name ?? '')
      setConfirming(false)
    }
  }, [open, habit])

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    onSave(emoji, name)
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title={habit ? 'Edit habit' : 'A tiny new habit'}>
      <form onSubmit={submit} className="space-y-4">
        <div className="flex gap-3">
          <label className="block">
            <span className="mb-1 block text-sm font-bold text-ink-soft">Emoji</span>
            <input
              value={emoji}
              onChange={(e) => setEmoji(Array.from(e.target.value).slice(-2).join(''))}
              aria-label="Emoji"
              className="h-14 w-16 rounded-2xl border border-line bg-surface2 text-center text-3xl"
            />
          </label>
          <label className="block flex-1">
            <span className="mb-1 block text-sm font-bold text-ink-soft">Name</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={40}
              placeholder="e.g. Drink a glass of water"
              className="h-14 w-full rounded-2xl border border-line bg-surface2 px-4 text-base placeholder:text-ink-soft/70"
            />
          </label>
        </div>
        <div role="group" aria-label="Pick an emoji" className="grid grid-cols-8 gap-1.5">
          {HABIT_EMOJIS.map((e) => (
            <button
              key={e}
              type="button"
              onClick={() => setEmoji(e)}
              aria-label={`Use ${e}`}
              aria-pressed={emoji === e}
              className={`flex h-10 items-center justify-center rounded-xl text-xl ${emoji === e ? 'bg-accent-soft ring-2 ring-accent-strong' : 'hover:bg-surface2'}`}
            >
              {e}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
          {habit && onDelete ? (
            confirming ? (
              <div className="flex items-center gap-2">
                <span className="text-sm text-ink-soft">Remove it? Past days stay.</span>
                <Button
                  type="button"
                  variant="danger"
                  onClick={() => {
                    onDelete(habit.id)
                    onClose()
                  }}
                >
                  Yes, remove
                </Button>
              </div>
            ) : (
              <Button type="button" variant="ghost" onClick={() => setConfirming(true)}>
                Delete
              </Button>
            )
          ) : (
            <span />
          )}
          <div className="flex gap-2">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={!name.trim()}>
              {habit ? 'Save' : 'Add habit'}
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  )
}
