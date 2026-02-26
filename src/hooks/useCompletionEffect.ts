import { useCallback, useRef } from 'react';
import confetti from 'canvas-confetti';

// Singleton AudioContext (lazily created on first user gesture)
let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    audioCtx = new AudioContext();
  }
  return audioCtx;
}

function playCompletionSound() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    // Pleasant two-tone "ding" (C5 + E5)
    const frequencies = [523.25, 659.25];
    frequencies.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + i * 0.06);
      osc.stop(now + 0.5);
    });
  } catch {
    // Silently fail if audio is not available
  }
}

function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

interface CompletionOrigin {
  x: number;
  y: number;
  color: string;
}

export function useCompletionEffect() {
  const pendingOriginRef = useRef<CompletionOrigin | null>(null);

  const registerClickOrigin = useCallback((origin: CompletionOrigin) => {
    pendingOriginRef.current = origin;
  }, []);

  const fireCompletionEffect = useCallback(() => {
    const origin = pendingOriginRef.current;
    pendingOriginRef.current = null;

    playCompletionSound();

    if (prefersReducedMotion() || !origin) return;

    const x = origin.x / window.innerWidth;
    const y = origin.y / window.innerHeight;

    confetti({
      particleCount: 40,
      spread: 60,
      origin: { x, y },
      colors: [origin.color, '#ffd700', '#ffffff'],
      startVelocity: 20,
      gravity: 0.8,
      ticks: 80,
      scalar: 0.8,
      disableForReducedMotion: true,
    });
  }, []);

  return { registerClickOrigin, fireCompletionEffect };
}
