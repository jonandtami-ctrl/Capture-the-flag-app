export const clamp = (v, min, max) => Math.max(min, Math.min(max, v))
export const lerp = (a, b, t) => a + (b - a) * t
export const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y)
export const rand = (min, max) => Math.random() * (max - min) + min
export const randInt = (min, max) => Math.floor(rand(min, max + 1))
export const choice = (arr) => arr[Math.floor(Math.random() * arr.length)]

export function circlesCollide(a, b, ra, rb) {
  return dist(a, b) < ra + rb
}

// Steer `entity` (with x,y,vx,vy) toward/away from a target point.
export function steer(entity, target, speed, away = false) {
  const dx = target.x - entity.x
  const dy = target.y - entity.y
  const d = Math.hypot(dx, dy) || 1
  const dir = away ? -1 : 1
  entity.vx = (dx / d) * speed * dir
  entity.vy = (dy / d) * speed * dir
}

export function drawEmoji(ctx, emoji, x, y, size = 32) {
  ctx.save()
  ctx.font = `${size}px "Apple Color Emoji","Segoe UI Emoji",sans-serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(emoji, x, y)
  ctx.restore()
}

export function drawGroundGradient(ctx, w, h, from = '#0b1f14', to = '#06140d') {
  const g = ctx.createLinearGradient(0, 0, 0, h)
  g.addColorStop(0, from)
  g.addColorStop(1, to)
  ctx.fillStyle = g
  ctx.fillRect(0, 0, w, h)
}

// Simple particle burst for hit/catch/score feedback.
export function spawnBurst(particles, x, y, color, count = 12) {
  for (let i = 0; i < count; i++) {
    const angle = rand(0, Math.PI * 2)
    const speed = rand(60, 220)
    particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: rand(0.3, 0.7),
      age: 0,
      color,
    })
  }
}

export function updateAndDrawParticles(ctx, particles, dt) {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i]
    p.age += dt
    if (p.age >= p.life) {
      particles.splice(i, 1)
      continue
    }
    p.x += p.vx * dt
    p.y += p.vy * dt
    p.vx *= 0.94
    p.vy *= 0.94
    const t = 1 - p.age / p.life
    ctx.save()
    ctx.globalAlpha = t
    ctx.fillStyle = p.color
    ctx.beginPath()
    ctx.arc(p.x, p.y, 3 * t + 1, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()
  }
}

// Floating score/combo text ("+1", "COMBO x3!") — the quick reward pop that
// makes an action feel like it landed. Push with spawnFloatingText, render
// (after particles, so text sits on top) with updateAndDrawFloatingText.
export function spawnFloatingText(texts, x, y, text, color = '#ffffff', size = 20) {
  texts.push({ x, y, text, color, size, life: 0.9, age: 0, vy: -60 })
}

export function updateAndDrawFloatingText(ctx, texts, dt) {
  for (let i = texts.length - 1; i >= 0; i--) {
    const t = texts[i]
    t.age += dt
    if (t.age >= t.life) {
      texts.splice(i, 1)
      continue
    }
    t.y += t.vy * dt
    t.vy *= Math.pow(0.92, dt * 60)
    const p = t.age / t.life
    const alpha = p < 0.65 ? 1 : 1 - (p - 0.65) / 0.35
    ctx.save()
    ctx.globalAlpha = alpha
    ctx.font = `800 ${t.size}px "Baloo 2", sans-serif`
    ctx.textAlign = 'center'
    ctx.lineWidth = 3
    ctx.strokeStyle = 'rgba(11,31,20,0.65)'
    ctx.strokeText(t.text, t.x, t.y)
    ctx.fillStyle = t.color
    ctx.fillText(t.text, t.x, t.y)
    ctx.restore()
  }
}

// Screen-shake "trauma" model: trigger an impulse on impact, decay it every
// frame, and apply the returned offset via ctx.translate before drawing.
export function triggerShake(shakeState, amount = 0.4) {
  shakeState.trauma = clamp((shakeState.trauma ?? 0) + amount, 0, 1)
}

export function updateShake(shakeState, dt) {
  shakeState.trauma = Math.max(0, (shakeState.trauma ?? 0) - dt * 1.8)
  const t = shakeState.trauma
  if (t <= 0) return { x: 0, y: 0 }
  const power = t * t
  return { x: rand(-1, 1) * 9 * power, y: rand(-1, 1) * 9 * power }
}
