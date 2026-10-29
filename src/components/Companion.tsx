import { AnimatePresence, m, useReducedMotion } from 'framer-motion'
import { useState } from 'react'
import { COMPANION_LINE_COUNT } from '../data/content'
import { accessoriesForLevel, stageForLevel, type AccessoryId } from '../data/unlocks'
import { useI18n } from '../i18n'
import type { MessageKey } from '../i18n/en'

const STEM_HEIGHT = [0, 16, 34, 52, 62, 70]
const LEAF_PAIRS = [0, 1, 2, 3, 3, 3]
const BASE_Y = 122

function Leaf({ x, y, flip, size }: { x: number; y: number; flip: boolean; size: number }) {
  return (
    <ellipse
      cx={x + (flip ? -size * 0.9 : size * 0.9)}
      cy={y}
      rx={size}
      ry={size * 0.5}
      transform={`rotate(${flip ? 28 : -28} ${x} ${y})`}
      fill="var(--leaf)"
      stroke="var(--leaf-deep)"
      strokeWidth="1.5"
    />
  )
}

function Plant({ stage }: { stage: number }) {
  const h = STEM_HEIGHT[stage - 1]
  const topY = BASE_Y - h
  const pairs = LEAF_PAIRS[stage - 1]
  return (
    <g>
      {stage === 1 && <ellipse cx="100" cy={BASE_Y - 3} rx="9" ry="6" fill="#a47551" />}
      {h > 0 && <path d={`M100 ${BASE_Y} L100 ${topY}`} stroke="var(--leaf-deep)" strokeWidth="5" strokeLinecap="round" />}
      {Array.from({ length: pairs }, (_, i) => {
        const y = BASE_Y - 14 - i * (h / (pairs + 0.6))
        const size = 13 + (stage >= 3 ? 3 : 0) - i * 1.5
        return (
          <g key={i}>
            <Leaf x={100} y={y} flip={false} size={size} />
            <Leaf x={100} y={y} flip size={size} />
          </g>
        )
      })}
      {stage === 2 && <Leaf x={100} y={topY} flip={false} size={11} />}
      {stage === 4 && <circle cx="100" cy={topY - 2} r="6" fill="var(--leaf)" stroke="var(--leaf-deep)" strokeWidth="1.5" />}
      {stage === 5 && <ellipse cx="100" cy={topY - 7} rx="8" ry="11" fill="#ffb5d0" stroke="#e0709f" strokeWidth="1.5" />}
      {stage === 6 && (
        <g>
          {[0, 72, 144, 216, 288].map((a) => (
            <ellipse key={a} cx="100" cy={topY - 15} rx="7.5" ry="12" transform={`rotate(${a} 100 ${topY})`} fill="#ffb5d0" stroke="#e0709f" strokeWidth="1.5" />
          ))}
          <circle cx="100" cy={topY} r="7" fill="#ffe08a" stroke="#e0b341" strokeWidth="1.5" />
        </g>
      )}
    </g>
  )
}

function Accessories({ items, topY, reduce }: { items: AccessoryId[]; topY: number; reduce: boolean }) {
  const has = (a: AccessoryId) => items.includes(a)
  return (
    <g>
      {has('blush') && (
        <g fill="#ff9ebb" opacity="0.7">
          <ellipse cx="80" cy="154" rx="6" ry="3.5" />
          <ellipse cx="120" cy="154" rx="6" ry="3.5" />
        </g>
      )}
      {has('bow') && (
        <g fill="#ff8fb3" stroke="#d96590" strokeWidth="1.2">
          <path d="M100 119 L84 111 L84 127 Z" />
          <path d="M100 119 L116 111 L116 127 Z" />
          <circle cx="100" cy="119" r="4" />
        </g>
      )}
      {has('shades') && (
        <g fill="#2d2a3e">
          <rect x="76" y="140" width="20" height="12" rx="5" />
          <rect x="104" y="140" width="20" height="12" rx="5" />
          <rect x="94" y="144" width="12" height="3" />
        </g>
      )}
      {has('crown') && (
        <path
          d={`M88 ${topY} l4 -12 l8 8 l8 -8 l4 12 z`}
          fill="#ffd75e"
          stroke="#d9a62a"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      )}
      {has('sparkles') &&
        [
          [48, 70, 0],
          [156, 58, 0.8],
          [150, 112, 1.6],
          [42, 118, 2.2],
        ].map(([x, y, delay]) => (
          <m.path
            key={`${x}-${y}`}
            d={`M${x} ${y - 7} L${x + 2} ${y - 2} L${x + 7} ${y} L${x + 2} ${y + 2} L${x} ${y + 7} L${x - 2} ${y + 2} L${x - 7} ${y} L${x - 2} ${y - 2} Z`}
            fill="#ffe08a"
            animate={reduce ? undefined : { scale: [0.6, 1.1, 0.6], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2.6, repeat: Infinity, delay: Number(delay) }}
            style={{ transformOrigin: `${x}px ${y}px` }}
          />
        ))}
    </g>
  )
}

export function Companion({ level, name, size = 220 }: { level: number; name: string; size?: number }) {
  const reduce = !!useReducedMotion()
  const stage = stageForLevel(level)
  const { t } = useI18n()
  const accessories = accessoriesForLevel(level)
  const topY = BASE_Y - STEM_HEIGHT[stage.stage - 1] - (stage.stage === 6 ? 30 : stage.stage === 5 ? 18 : 6)
  // crop empty sky above young plants so the card stays snug
  const vy = stage.stage <= 2 ? 70 : stage.stage <= 4 ? 36 : 0
  const [line, setLine] = useState<string | null>(null)
  const [tapCount, setTapCount] = useState(0)

  const poke = () => {
    setTapCount((c) => c + 1)
    setLine(t(`companion.line.${(tapCount + level) % COMPANION_LINE_COUNT}` as MessageKey))
    window.setTimeout(() => setLine(null), 3200)
  }

  return (
    <div className="relative flex flex-col items-center">
      <AnimatePresence>
        {line && (
          <m.p
            key={line}
            role="status"
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0 }}
            className="absolute -top-2 z-10 max-w-[16rem] rounded-2xl bg-surface px-4 py-2 text-center text-sm font-semibold shadow-soft"
          >
            {line}
          </m.p>
        )}
      </AnimatePresence>
      <m.button
        type="button"
        onClick={poke}
        aria-label={t('companion.aria', { name, stage: t(`stage.${stage.stage}` as MessageKey).toLowerCase() })}
        whileTap={{ scale: 0.94, rotate: -3 }}
        animate={reduce ? undefined : { y: [0, -5, 0] }}
        transition={reduce ? undefined : { duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        className="rounded-full"
        style={{ width: size, height: (size * (200 - vy)) / 200 }}
      >
        <svg viewBox={`0 ${vy} 200 ${200 - vy}`} width="100%" height="100%" role="img" aria-hidden="true">
          <ellipse cx="100" cy="186" rx="52" ry="7" fill="currentColor" opacity="0.08" />
          <m.g
            style={{ transformOrigin: `100px ${BASE_Y}px` }}
            animate={reduce ? undefined : { rotate: [-2, 2, -2] }}
            transition={reduce ? undefined : { duration: 5, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Plant stage={stage.stage} />
          </m.g>
          {/* pot */}
          <path d="M66 124 H134 L126 180 Q125 186 119 186 H81 Q75 186 74 180 Z" fill="var(--accent)" />
          <path d="M66 124 H134 L132 138 H68 Z" fill="var(--accent-2)" opacity="0.55" />
          <rect x="58" y="114" width="84" height="16" rx="8" fill="var(--accent-2)" />
          {!accessories.includes('shades') && (
            <g fill="#2d2a3e">
              <circle cx="86" cy="148" r="3.4" />
              <circle cx="114" cy="148" r="3.4" />
            </g>
          )}
          <path d="M92 157 Q100 164 108 157" stroke="#2d2a3e" strokeWidth="2.6" strokeLinecap="round" fill="none" />
          <Accessories items={accessories} topY={topY} reduce={reduce} />
        </svg>
      </m.button>
    </div>
  )
}
