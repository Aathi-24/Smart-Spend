import React, { useCallback } from 'react';
import Particles from 'react-tsparticles';
import { loadSlim } from '@tsparticles/slim';

const ParticleBackground = ({ variant = 'default' }) => {
  const particlesInit = useCallback(async (engine) => {
    await loadSlim(engine);
  }, []);

  const configs = {
    default: {
      background: { color: { value: 'transparent' } },
      fpsLimit: 60,
      interactivity: {
        events: {
          onHover: { enable: true, mode: 'repulse' },
          onClick: { enable: true, mode: 'push' },
          resize: true,
        },
        modes: {
          repulse: { distance: 100, duration: 0.4 },
          push: { quantity: 3 },
        },
      },
      particles: {
        color: { value: ['#6366f1', '#06b6d4', '#10b981', '#a5b4fc'] },
        links: {
          color: '#c7d2fe',
          distance: 140,
          enable: true,
          opacity: 0.25,
          width: 1,
        },
        move: {
          direction: 'none',
          enable: true,
          outModes: { default: 'bounce' },
          random: true,
          speed: 0.8,
          straight: false,
        },
        number: { density: { enable: true, area: 900 }, value: 60 },
        opacity: { value: { min: 0.2, max: 0.6 } },
        shape: { type: 'circle' },
        size: { value: { min: 1, max: 3 } },
      },
      detectRetina: true,
    },
    dense: {
      background: { color: { value: 'transparent' } },
      fpsLimit: 60,
      interactivity: {
        events: {
          onHover: { enable: true, mode: 'grab' },
          onClick: { enable: true, mode: 'repulse' },
          resize: true,
        },
        modes: {
          grab: { distance: 180, links: { opacity: 0.6 } },
          repulse: { distance: 150, duration: 0.5 },
        },
      },
      particles: {
        color: { value: ['#818cf8', '#67e8f9', '#6ee7b7', '#fcd34d'] },
        links: {
          color: '#c7d2fe',
          distance: 120,
          enable: true,
          opacity: 0.18,
          width: 0.8,
        },
        move: {
          direction: 'none',
          enable: true,
          outModes: { default: 'bounce' },
          random: true,
          speed: 1,
          straight: false,
        },
        number: { density: { enable: true, area: 700 }, value: 80 },
        opacity: { value: { min: 0.15, max: 0.5 } },
        shape: { type: ['circle', 'triangle'] },
        size: { value: { min: 1, max: 3.5 } },
      },
      detectRetina: true,
    },
  };

  return (
    <Particles
      id="particles-js"
      init={particlesInit}
      options={configs[variant] || configs.default}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        pointerEvents: 'none',
      }}
    />
  );
};

export default ParticleBackground;
