// Dependency-free icon generator: draws a pastel gradient tile with a tiny sprout
// and writes PNGs into /public. Run with `npm run icons`.
import { deflateSync } from 'node:zlib'
import { writeFileSync, mkdirSync } from 'node:fs'

const crcTable = Array.from({ length: 256 }, (_, n) => {
  let c = n
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
  return c >>> 0
})
const crc32 = (buf) => {
  let c = 0xffffffff
  for (const b of buf) c = crcTable[(c ^ b) & 0xff] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}
const chunk = (type, data) => {
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length)
  const td = Buffer.concat([Buffer.from(type), data])
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(td))
  return Buffer.concat([len, td, crc])
}
const png = (size, rgba) => {
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(size, 0)
  ihdr.writeUInt32BE(size, 4)
  ihdr[8] = 8
  ihdr[9] = 6
  const raw = Buffer.alloc((size * 4 + 1) * size)
  for (let y = 0; y < size; y++) {
    raw[y * (size * 4 + 1)] = 0
    rgba.copy(raw, y * (size * 4 + 1) + 1, y * size * 4, (y + 1) * size * 4)
  }
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw)),
    chunk('IEND', Buffer.alloc(0)),
  ])
}

const mix = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t)
const C1 = [255, 184, 156]
const C2 = [205, 188, 255]
const ellipse = (u, v, cx, cy, rx, ry, rot) => {
  const dx = u - cx, dy = v - cy
  const c = Math.cos(rot), s = Math.sin(rot)
  const x = dx * c + dy * s, y = -dx * s + dy * c
  return (x * x) / (rx * rx) + (y * y) / (ry * ry) <= 1
}
const roundedRect = (u, v, r) => {
  const x = Math.abs(u - 0.5) - (0.5 - r), y = Math.abs(v - 0.5) - (0.5 - r)
  return Math.hypot(Math.max(x, 0), Math.max(y, 0)) <= r
}

function sample(u, v, { maskable }) {
  if (!maskable && !roundedRect(u, v, 0.22)) return [0, 0, 0, 0]
  let col = mix(C1, C2, (u + v) / 2)
  // art lives in the middle ~60% so maskable crops are safe
  const k = maskable ? 1.15 : 1
  const au = (u - 0.5) * k + 0.5, av = (v - 0.5) * k + 0.5
  const d = Math.hypot(au - 0.5, av - 0.54)
  if (d < 0.3) col = mix(col, [255, 255, 255], 0.35 * (1 - d / 0.3) + 0.2)
  const stem = Math.abs(au - 0.5) < 0.017 && av > 0.46 && av < 0.7
  const leafL = ellipse(au, av, 0.42, 0.45, 0.11, 0.055, -0.6)
  const leafR = ellipse(au, av, 0.58, 0.39, 0.11, 0.055, 0.6)
  const pot = av > 0.68 && av < 0.76 && Math.abs(au - 0.5) < 0.12 - (av - 0.68) * 0.5
  if (stem || leafL || leafR) col = [255, 255, 255]
  if (pot) col = [255, 250, 245]
  return [...col, 255]
}

function render(size, opts) {
  const out = Buffer.alloc(size * size * 4)
  const SS = 3
  for (let y = 0; y < size; y++)
    for (let x = 0; x < size; x++) {
      let r = 0, g = 0, b = 0, a = 0
      for (let sy = 0; sy < SS; sy++)
        for (let sx = 0; sx < SS; sx++) {
          const [pr, pg, pb, pa] = sample((x + (sx + 0.5) / SS) / size, (y + (sy + 0.5) / SS) / size, opts)
          r += pr * pa; g += pg * pa; b += pb * pa; a += pa
        }
      const o = (y * size + x) * 4
      out[o] = a ? r / a : 0
      out[o + 1] = a ? g / a : 0
      out[o + 2] = a ? b / a : 0
      out[o + 3] = a / (SS * SS)
    }
  return png(size, out)
}

mkdirSync('public', { recursive: true })
writeFileSync('public/icon-192.png', render(192, {}))
writeFileSync('public/icon-512.png', render(512, {}))
writeFileSync('public/icon-maskable-512.png', render(512, { maskable: true }))
writeFileSync('public/apple-touch-icon.png', render(180, { maskable: true }))
writeFileSync(
  'public/favicon.svg',
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffb89c"/><stop offset="1" stop-color="#cdbcff"/></linearGradient></defs><rect width="64" height="64" rx="15" fill="url(#g)"/><path d="M32 46V30" stroke="#fff" stroke-width="2.4" stroke-linecap="round"/><ellipse cx="25" cy="29" rx="7" ry="3.6" transform="rotate(-34 25 29)" fill="#fff"/><ellipse cx="39" cy="25" rx="7" ry="3.6" transform="rotate(34 39 25)" fill="#fff"/><path d="M24 46h16l-2 5H26z" fill="#fffaf5"/></svg>`,
)
console.log('icons written')
