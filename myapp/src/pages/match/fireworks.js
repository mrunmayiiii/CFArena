/**
 * fireworks.js — enhanced solve-celebration burst
 * Usage: import { celebrateSolve } from './fireworks'
 */

const PALETTES = [
  ['#c8ff00', '#aaee00', '#eeffaa', '#ffffff', '#c8ff00'],   // acid lime (brand)
  ['#ffee44', '#ffcc00', '#ff9900', '#ffddaa', '#ffffff'],   // golden burst
  ['#44ffcc', '#00ffaa', '#00ddff', '#aaffee', '#ffffff'],   // aqua flash
  ['#ff6fff', '#dd44ff', '#aa00ff', '#ffaaff', '#ffffff'],   // violet pop
  ['#ff4466', '#ff0044', '#ffaa88', '#ffffff', '#ffdd44'],   // crimson spark
]

// Shape types for explode particles
const SHAPES = ['circle', 'star', 'ring']

function rnd(a, b) { return a + Math.random() * (b - a) }
function pick(arr)  { return arr[Math.floor(rnd(0, arr.length))] }

let _canvas    = null
let _ctx       = null
let _raf       = null
let _particles = []
let _rockets   = []
let _trails    = []
let _glitters  = []

/* ─── Canvas ─── */

function getCanvas() {
  if (_canvas && document.body.contains(_canvas)) return _canvas
  _canvas = document.getElementById('__fw__')
  if (!_canvas) {
    _canvas = document.createElement('canvas')
    _canvas.id = '__fw__'
    Object.assign(_canvas.style, {
      position: 'fixed', top: '0', left: '0',
      width: '100%', height: '100%',
      pointerEvents: 'none', zIndex: '99999',
    })
    document.body.appendChild(_canvas)
    window.addEventListener('resize', resetCanvas)
  }
  resetCanvas()
  return _canvas
}

function resetCanvas() {
  if (!_canvas) return
  const dpr      = window.devicePixelRatio || 1
  _canvas.width  = window.innerWidth  * dpr
  _canvas.height = window.innerHeight * dpr
  _ctx = _canvas.getContext('2d')
  _ctx.scale(dpr, dpr)
}

/* ─── Glitter (ambient shimmer that falls after explosion) ─── */

class Glitter {
  constructor(x, y, color) {
    this.x    = x
    this.y    = y
    this.vx   = rnd(-1.2, 1.2)
    this.vy   = rnd(-0.5, 1.8)
    this.color = color
    this.alpha = 1
    this.life  = 0
    this.maxLife = Math.floor(rnd(60, 130))
    this.size  = rnd(1, 2.5)
    this.spin  = rnd(-0.18, 0.18)
    this.angle = rnd(0, Math.PI * 2)
    this.gravity = rnd(0.02, 0.06)
    this.wobble  = rnd(0.03, 0.09)
    this.wobbleT = rnd(0, Math.PI * 2)
  }
  update() {
    this.vy     += this.gravity
    this.vy     *= 0.995
    this.wobbleT += this.wobble
    this.x += this.vx + Math.sin(this.wobbleT) * 0.4
    this.y += this.vy
    this.angle += this.spin
    this.life++
    this.alpha = Math.pow(1 - this.life / this.maxLife, 1.2)
    return this.life < this.maxLife
  }
  draw(c) {
    c.save()
    c.globalAlpha = this.alpha
    c.translate(this.x, this.y)
    c.rotate(this.angle)
    // Tiny sparkle square
    c.fillStyle = this.color
    c.fillRect(-this.size / 2, -this.size / 2, this.size, this.size)
    c.restore()
  }
}

/* ─── Particle ─── */

class Particle {
  constructor(x, y, vx, vy, color, shape = 'circle') {
    this.x = x; this.y = y; this.vx = vx; this.vy = vy
    this.color  = color
    this.shape  = shape
    this.alpha  = 1
    this.life   = 0
    this.maxLife = Math.floor(rnd(50, 100))
    this.size   = rnd(1.8, 4.2)
    this.gravity = rnd(0.04, 0.11)
    this.drag    = rnd(0.97, 0.992)
    this.spin    = rnd(-0.2, 0.2)
    this.angle   = rnd(0, Math.PI * 2)
    // Tail trail
    this.trail  = []
  }
  update() {
    this.trail.push({ x: this.x, y: this.y, a: this.alpha })
    if (this.trail.length > 5) this.trail.shift()
    this.vy   += this.gravity
    this.vx   *= this.drag
    this.vy   *= this.drag
    this.x    += this.vx
    this.y    += this.vy
    this.angle += this.spin
    this.life++
    this.alpha = Math.pow(1 - this.life / this.maxLife, 1.4)
    return this.life < this.maxLife
  }
  draw(c) {
    // Faint tail
    for (let t = 0; t < this.trail.length; t++) {
      const tp = this.trail[t]
      const ta = (t / this.trail.length) * this.alpha * 0.35
      c.globalAlpha = ta
      c.beginPath()
      c.arc(tp.x, tp.y, this.size * 0.5, 0, Math.PI * 2)
      c.fillStyle = this.color
      c.fill()
    }

    c.save()
    c.globalAlpha = this.alpha
    c.translate(this.x, this.y)
    c.rotate(this.angle)

    if (this.shape === 'star') {
      drawStar(c, 0, 0, 5, this.size * 1.1, this.size * 0.45, this.color)
    } else if (this.shape === 'ring') {
      c.beginPath()
      c.arc(0, 0, this.size, 0, Math.PI * 2)
      c.strokeStyle = this.color
      c.lineWidth = 1.2
      c.stroke()
    } else {
      c.beginPath()
      c.arc(0, 0, this.size, 0, Math.PI * 2)
      c.fillStyle = this.color
      c.fill()
    }
    c.restore()
    c.globalAlpha = 1
  }
}

function drawStar(c, cx, cy, spikes, outerR, innerR, color) {
  let rot = (Math.PI / 2) * 3
  const step = Math.PI / spikes
  c.beginPath()
  c.moveTo(cx, cy - outerR)
  for (let i = 0; i < spikes; i++) {
    c.lineTo(cx + Math.cos(rot) * outerR, cy + Math.sin(rot) * outerR)
    rot += step
    c.lineTo(cx + Math.cos(rot) * innerR, cy + Math.sin(rot) * innerR)
    rot += step
  }
  c.lineTo(cx, cy - outerR)
  c.closePath()
  c.fillStyle = color
  c.fill()
}

/* ─── Rocket trail segment ─── */

class TrailDot {
  constructor(x, y, color) {
    this.x = x; this.y = y; this.color = color
    this.alpha = 0.7
    this.size  = rnd(1.5, 3)
    this.life  = 0
    this.maxLife = Math.floor(rnd(10, 22))
  }
  update() {
    this.life++
    this.alpha = (1 - this.life / this.maxLife) * 0.6
    return this.life < this.maxLife
  }
  draw(c) {
    c.globalAlpha = this.alpha
    c.beginPath()
    c.arc(this.x, this.y, this.size, 0, Math.PI * 2)
    c.fillStyle = this.color
    c.fill()
    c.globalAlpha = 1
  }
}

/* ─── Rocket ─── */

class Rocket {
  constructor(sx, sy, tx, ty, palette, burstStyle = 'sphere') {
    this.x = sx; this.y = sy
    this.tx = tx; this.ty = ty
    const frames  = rnd(32, 48)
    this.vx = (tx - sx) / frames
    this.vy = (ty - sy) / frames
    this.palette    = palette
    this.burstStyle = burstStyle   // sphere | ring | fan | double | star
    this.done = false
    this.life = 0
    this.trailColor = pick(palette)
  }

  update() {
    // Leave trail
    if (Math.random() > 0.3) {
      _trails.push(new TrailDot(this.x, this.y, this.trailColor))
    }

    this.x += this.vx
    this.y += this.vy
    this.life++

    const near = Math.abs(this.x - this.tx) < 14 && Math.abs(this.y - this.ty) < 14
    if (this.life > 60 || near) {
      this.explode()
      this.done = true
    }
  }

  explode() {
    const cx = this.x, cy = this.y

    // Flash ring — just a quick set of outward-racing particles
    for (let i = 0; i < 16; i++) {
      const angle = (i / 16) * Math.PI * 2
      const spd   = rnd(6, 10)
      _particles.push(new Particle(cx, cy, Math.cos(angle) * spd, Math.sin(angle) * spd, '#ffffff', 'ring'))
    }

    if (this.burstStyle === 'sphere') {
      this._burstSphere(cx, cy, rnd(80, 120))
    } else if (this.burstStyle === 'ring') {
      this._burstRing(cx, cy)
    } else if (this.burstStyle === 'fan') {
      this._burstFan(cx, cy)
    } else if (this.burstStyle === 'double') {
      this._burstSphere(cx, cy, 60)
      setTimeout(() => this._burstSphere(cx, cy, 55, 1.6), 120)
    } else if (this.burstStyle === 'star') {
      this._burstStar(cx, cy)
    }

    // Glitter shower
    const gc = pick(this.palette)
    for (let i = 0; i < 40; i++) {
      _glitters.push(new Glitter(
        cx + rnd(-20, 20),
        cy + rnd(-20, 20),
        gc
      ))
    }
  }

  _burstSphere(cx, cy, n = 100, spdMult = 1) {
    for (let i = 0; i < n; i++) {
      const angle = (i / n) * Math.PI * 2 + rnd(-0.08, 0.08)
      const spd   = rnd(1.8, 5.5) * spdMult
      const col   = pick(this.palette)
      const shape = Math.random() < 0.15 ? pick(SHAPES) : 'circle'
      _particles.push(new Particle(cx, cy, Math.cos(angle) * spd, Math.sin(angle) * spd, col, shape))
    }
  }

  _burstRing(cx, cy) {
    // Tight ring + sparse outer burst
    const n = 60
    for (let i = 0; i < n; i++) {
      const angle = (i / n) * Math.PI * 2
      const spd   = rnd(4.5, 5.5)
      const col   = pick(this.palette)
      _particles.push(new Particle(cx, cy, Math.cos(angle) * spd, Math.sin(angle) * spd, col, 'ring'))
    }
    // Sparse stars
    for (let i = 0; i < 30; i++) {
      const angle = rnd(0, Math.PI * 2)
      const spd   = rnd(1, 3.5)
      _particles.push(new Particle(cx, cy, Math.cos(angle) * spd, Math.sin(angle) * spd, pick(this.palette), 'star'))
    }
  }

  _burstFan(cx, cy) {
    // Upward fan — like a celebration confetti cannon
    for (let i = 0; i < 110; i++) {
      const angle = rnd(-Math.PI * 0.85, -Math.PI * 0.15) // upward cone
      const spd   = rnd(2, 6.5)
      const col   = pick(this.palette)
      const shape = Math.random() < 0.3 ? 'star' : 'circle'
      _particles.push(new Particle(cx, cy, Math.cos(angle) * spd, Math.sin(angle) * spd, col, shape))
    }
    // Side sprays
    for (let i = 0; i < 20; i++) {
      const angle = Math.random() < 0.5 ? rnd(-0.3, 0.3) : rnd(Math.PI - 0.3, Math.PI + 0.3)
      const spd   = rnd(3, 7)
      _particles.push(new Particle(cx, cy, Math.cos(angle) * spd, Math.sin(angle) * spd, pick(this.palette), 'circle'))
    }
  }

  _burstStar(cx, cy) {
    // 5 arms of dense particles
    for (let arm = 0; arm < 5; arm++) {
      const baseAngle = (arm / 5) * Math.PI * 2 - Math.PI / 2
      for (let j = 0; j < 22; j++) {
        const angle = baseAngle + rnd(-0.22, 0.22)
        const spd   = rnd(2.5, 5.5)
        const col   = pick(this.palette)
        _particles.push(new Particle(cx, cy, Math.cos(angle) * spd, Math.sin(angle) * spd, col, 'star'))
      }
    }
  }

  draw(c) {
    // Bright rocket head
    c.globalAlpha = 1
    c.beginPath()
    c.arc(this.x, this.y, 3.5, 0, Math.PI * 2)
    c.fillStyle = '#ffffff'
    c.fill()
    // Glow
    const g = c.createRadialGradient(this.x, this.y, 0, this.x, this.y, 9)
    g.addColorStop(0, 'rgba(255,255,255,0.6)')
    g.addColorStop(1, 'rgba(255,255,255,0)')
    c.beginPath()
    c.arc(this.x, this.y, 9, 0, Math.PI * 2)
    c.fillStyle = g
    c.fill()
  }
}

/* ─── Confetti strip (rectangular falling pieces) ─── */

class Confetti {
  constructor(x, y, color) {
    this.x = x; this.y = y; this.color = color
    this.vx = rnd(-3, 3)
    this.vy = rnd(-4, -1)
    this.w  = rnd(5, 10)
    this.h  = rnd(3, 6)
    this.angle = rnd(0, Math.PI * 2)
    this.spin  = rnd(-0.2, 0.2)
    this.gravity = rnd(0.06, 0.14)
    this.drag    = rnd(0.985, 0.998)
    this.life    = 0
    this.maxLife = Math.floor(rnd(80, 150))
    this.alpha   = 1
    this.wobble  = rnd(0.03, 0.1)
    this.wobbleT = rnd(0, Math.PI * 2)
  }
  update() {
    this.vy     += this.gravity
    this.vx     *= this.drag
    this.vy     *= this.drag
    this.wobbleT += this.wobble
    this.x += this.vx + Math.sin(this.wobbleT) * 0.6
    this.y += this.vy
    this.angle += this.spin
    this.life++
    this.alpha = Math.pow(1 - this.life / this.maxLife, 1.1)
    return this.life < this.maxLife
  }
  draw(c) {
    c.save()
    c.globalAlpha = this.alpha
    c.translate(this.x, this.y)
    c.rotate(this.angle)
    c.fillStyle = this.color
    c.fillRect(-this.w / 2, -this.h / 2, this.w, this.h)
    c.restore()
  }
}

let _confetti = []

/* ─── Render loop ─── */

function tick() {
  const c = _ctx
  if (!c) return
  c.clearRect(0, 0, window.innerWidth, window.innerHeight)

  _trails    = _trails.filter(t  => { const a = t.update();  if (a) t.draw(c);  return a })
  _rockets   = _rockets.filter(r => { r.update(); if (!r.done) r.draw(c); return !r.done })
  _particles = _particles.filter(p => { const a = p.update(); if (a) p.draw(c); return a })
  _glitters  = _glitters.filter(g => { const a = g.update(); if (a) g.draw(c); return a })
  _confetti  = _confetti.filter(k => { const a = k.update(); if (a) k.draw(c); return a })

  const alive = _rockets.length + _particles.length + _glitters.length + _trails.length + _confetti.length
  if (alive > 0) {
    _raf = requestAnimationFrame(tick)
  }
}

function startLoop() {
  cancelAnimationFrame(_raf)
  _raf = requestAnimationFrame(tick)
}

/* ─── Confetti shower from top ─── */

function launchConfettiShower(cx) {
  const W = window.innerWidth
  const colors = [
    '#c8ff00','#ffee44','#ff6b6b','#44ffcc','#ff6fff',
    '#ffffff','#ffaa00','#00ddff','#aaee00','#ff4466',
  ]
  for (let i = 0; i < 90; i++) {
    setTimeout(() => {
      const x = (cx ?? rnd(0.25, 0.75)) * W + rnd(-120, 120)
      _confetti.push(new Confetti(x, rnd(-20, 60), pick(colors)))
      startLoop()
    }, i * 12)
  }
}

/* ─── Public API ─── */

export function celebrateSolve(opts = {}) {
  getCanvas()

  const W = window.innerWidth
  const H = window.innerHeight

  // Burst styles in sequence for visual variety
  const styles    = ['sphere', 'ring', 'fan', 'double', 'star', 'sphere', 'fan']
  const schedule  = [
    { delay: 0,    xFrac: rnd(0.35, 0.65), yFrac: rnd(0.12, 0.30), style: styles[0] },
    { delay: 180,  xFrac: rnd(0.15, 0.38), yFrac: rnd(0.18, 0.38), style: styles[1] },
    { delay: 320,  xFrac: rnd(0.62, 0.85), yFrac: rnd(0.15, 0.35), style: styles[2] },
    { delay: 520,  xFrac: rnd(0.25, 0.75), yFrac: rnd(0.08, 0.22), style: styles[3] },
    { delay: 750,  xFrac: rnd(0.40, 0.60), yFrac: rnd(0.28, 0.42), style: styles[4] },
  ]

  schedule.forEach(({ delay, xFrac, yFrac, style }) => {
    setTimeout(() => {
      const tx      = xFrac * W
      const ty      = yFrac * H
      const sx      = rnd(0.2, 0.8) * W
      const palette = pick(PALETTES)
      _rockets.push(new Rocket(sx, H + 10, tx, ty, palette, style))
      startLoop()
    }, delay)
  })

  // Confetti shower centred around the middle of the action
  setTimeout(() => launchConfettiShower(rnd(0.35, 0.65)), 250)
  // Second confetti wave
  setTimeout(() => launchConfettiShower(rnd(0.3, 0.7)), 700)
}

/* ─── HMR cleanup ─── */

if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    cancelAnimationFrame(_raf)
    document.getElementById('__fw__')?.remove()
    _canvas = null; _ctx = null
    _particles = []; _rockets = []; _trails = []
    _glitters = []; _confetti = []
  })
}