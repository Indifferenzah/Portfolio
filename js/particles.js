/**
 * particles.js — Canvas particle system.
 * Clean class-based implementation with mouse interaction.
 */

import { PARTICLE_CONFIG } from './config.js';
import { clamp } from './utils.js';

class Particle {
  constructor(canvas, config) {
    this.canvas = canvas;
    this.config = config;
    this.reset();
  }

  reset() {
    const { canvas, config } = this;
    this.x  = Math.random() * canvas.width;
    this.y  = Math.random() * canvas.height;
    this.vx = (Math.random() - 0.5) * config.maxSpeed;
    this.vy = (Math.random() - 0.5) * config.maxSpeed;
    this.radius = config.minRadius + Math.random() * (config.maxRadius - config.minRadius);
    this.opacity = 0.3 + Math.random() * 0.4;
    // Occasionally use alt color (purple)
    this.colorIndex = Math.random() < 0.25 ? 1 : 0;
  }

  update(mouse) {
    const { canvas, config } = this;

    // Mouse repulsion
    if (mouse.x !== null && mouse.y !== null) {
      const dx = this.x - mouse.x;
      const dy = this.y - mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < config.mouseRepelDist && dist > 0) {
        const force = (config.mouseRepelDist - dist) / config.mouseRepelDist;
        this.vx += (dx / dist) * force * config.mouseForce;
        this.vy += (dy / dist) * force * config.mouseForce;
      }
    }

    // Speed cap
    const maxV = config.maxSpeed * 2;
    this.vx = clamp(this.vx, -maxV, maxV);
    this.vy = clamp(this.vy, -maxV, maxV);

    this.x += this.vx;
    this.y += this.vy;

    // Bounce off walls
    if (this.x <= 0 || this.x >= canvas.width)  this.vx *= -1;
    if (this.y <= 0 || this.y >= canvas.height)  this.vy *= -1;

    this.x = clamp(this.x, 0, canvas.width);
    this.y = clamp(this.y, 0, canvas.height);
  }

  draw(ctx) {
    const { config } = this;
    const colorRgb = this.colorIndex === 0 ? config.color : config.altColor;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${colorRgb}, ${this.opacity})`;
    ctx.fill();
  }
}

export class ParticleSystem {
  /**
   * @param {HTMLCanvasElement} canvas
   * @param {object} [configOverride]
   */
  constructor(canvas, configOverride = {}) {
    this.canvas  = canvas;
    this.ctx     = canvas.getContext('2d');
    this.config  = { ...PARTICLE_CONFIG, ...configOverride };
    this.particles = [];
    this.mouse   = { x: null, y: null };
    this._raf    = null;
    this._running = false;

    this._resize   = this._handleResize.bind(this);
    this._mousemove = this._handleMouseMove.bind(this);
    this._mouseleave = () => { this.mouse.x = null; this.mouse.y = null; };
  }

  init() {
    this._handleResize();
    this._buildParticles();
    this._attachEvents();
    this.start();
  }

  start() {
    if (this._running) return;
    this._running = true;
    this._loop();
  }

  stop() {
    this._running = false;
    if (this._raf) {
      cancelAnimationFrame(this._raf);
      this._raf = null;
    }
  }

  destroy() {
    this.stop();
    window.removeEventListener('resize', this._resize);
    window.removeEventListener('mousemove', this._mousemove);
    window.removeEventListener('mouseleave', this._mouseleave);
  }

  // ── Private ────────────────────────────────────────────

  _buildParticles() {
    this.particles = [];
    for (let i = 0; i < this.config.count; i++) {
      this.particles.push(new Particle(this.canvas, this.config));
    }
  }

  _handleResize() {
    this.canvas.width  = window.innerWidth;
    this.canvas.height = window.innerHeight;
    // Re-clamp particles to new bounds
    this.particles.forEach(p => p.reset());
  }

  _handleMouseMove(e) {
    this.mouse.x = e.clientX;
    this.mouse.y = e.clientY;
  }

  _attachEvents() {
    window.addEventListener('resize', this._resize);
    window.addEventListener('mousemove', this._mousemove, { passive: true });
    window.addEventListener('mouseleave', this._mouseleave);
  }

  _loop() {
    if (!this._running) return;
    this._update();
    this._draw();
    this._raf = requestAnimationFrame(() => this._loop());
  }

  _update() {
    this.particles.forEach(p => p.update(this.mouse));
  }

  _draw() {
    const { ctx, canvas, particles, config } = this;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw particles
    particles.forEach(p => p.draw(ctx));

    // Draw connections
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const p1 = particles[i];
        const p2 = particles[j];
        const dx = p1.x - p2.x;
        const dy = p1.y - p2.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < config.connectionDist) {
          const alpha = (1 - dist / config.connectionDist) * 0.2;
          ctx.beginPath();
          ctx.strokeStyle = `rgba(${config.color}, ${alpha})`;
          ctx.lineWidth = 0.6;
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
        }
      }
    }
  }
}
